import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "../components/ui/Toast";

describe("Toast component", () => {
  it("renders nothing when toast prop is null", () => {
    const { container } = render(<Toast toast={null} onClose={vi.fn()} />);
    expect(container.querySelector(".pointer-events-auto")).not.toBeInTheDocument();
  });

  it("renders success toast message with check_circle icon", () => {
    const onClose = vi.fn();
    render(
      <Toast
        toast={{ message: "Profile created successfully!", type: "success" }}
        onClose={onClose}
      />
    );
    expect(screen.getByText("Profile created successfully!")).toBeInTheDocument();
    expect(screen.getByText("check_circle")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close notification" });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders error toast message", () => {
    render(
      <Toast
        toast={{ message: "Failed to connect to API", type: "error" }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Failed to connect to API")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
