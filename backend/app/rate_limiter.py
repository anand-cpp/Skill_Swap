"""In-memory sliding-window rate limiter middleware for FastAPI."""

import time
from collections import defaultdict
from threading import Lock
from fastapi import Request
from fastapi.responses import JSONResponse

from .config import get_settings


class SlidingWindowRateLimiter:
    """Thread-safe sliding window rate limiter by client IP."""

    def __init__(self, limit_per_minute: int | None = None, window_seconds: int = 60):
        self.limit = limit_per_minute or get_settings().rate_limit_per_minute
        self.window_seconds = window_seconds
        self._history: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

    def check_rate_limit(self, client_ip: str) -> tuple[bool, int, int]:
        """Check if client_ip is within rate limit.

        Returns (allowed, remaining, reset_seconds).
        """
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            # Prune timestamps older than current window
            timestamps = [t for t in self._history[client_ip] if t > window_start]
            count = len(timestamps)

            if count >= self.limit:
                oldest_timestamp = timestamps[0]
                reset_seconds = max(1, int(oldest_timestamp + self.window_seconds - now))
                self._history[client_ip] = timestamps
                return False, 0, reset_seconds

            timestamps.append(now)
            self._history[client_ip] = timestamps
            remaining = max(0, self.limit - (count + 1))
            return True, remaining, self.window_seconds


rate_limiter = SlidingWindowRateLimiter()


async def rate_limiting_middleware(request: Request, call_next):
    # Exempt health checks
    if request.url.path.endswith("/health"):
        return await call_next(request)

    client_ip = rate_limiter.get_client_ip(request)
    allowed, remaining, reset_seconds = rate_limiter.check_rate_limit(client_ip)

    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Rate limit exceeded. Try again in {reset_seconds} seconds.",
                "error": {
                    "code": 429,
                    "message": "Too Many Requests",
                    "retry_after": reset_seconds,
                    "path": request.url.path,
                },
            },
            headers={
                "Retry-After": str(reset_seconds),
                "X-RateLimit-Limit": str(rate_limiter.limit),
                "X-RateLimit-Remaining": "0",
            },
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response
