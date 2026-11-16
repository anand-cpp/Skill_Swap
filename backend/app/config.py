"""Application configuration and environment settings."""

import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    """Immutable environment settings for SkillSwap."""

    app_name: str = "SkillSwap API"
    app_env: str = os.getenv("APP_ENV", "development")
    api_prefix: str = os.getenv("API_PREFIX", "/api")
    db_path: Path = field(
        default_factory=lambda: Path(
            os.getenv("DB_PATH", str(Path(__file__).resolve().parent.parent / "skillswap.db"))
        )
    )
    cors_origins: list[str] = field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
    )
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
    session_secret: str = os.getenv(
        "SESSION_SECRET", "skillswap-default-secret-key-for-development-only-32bytes"
    )
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in ("production", "prod")


_settings: Settings | None = None


def get_settings() -> Settings:
    """Return the cached application settings singleton."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
