import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../components/layout/Header";

describe("Header component", () => {
  it("renders search input and responds to input changes", () => {
    const onSearchChange = vi.fn();
    const onOpenProposal = vi.fn();

    render(
      <Header
        onOpenMobile={vi.fn()}
        searchQuery=""
        onSearchChange={onSearchChange}
        mutualCount={2}
        onOpenProposal={onOpenProposal}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search peers by skill/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Python" } });
    expect(onSearchChange).toHaveBeenCalledWith("Python");

    expect(screen.getByText("2 Mutual Swaps Available")).toBeInTheDocument();

    const proposeBtn = screen.getByRole("button", { name: /Propose an Exchange/i });
    fireEvent.click(proposeBtn);
    expect(onOpenProposal).toHaveBeenCalledTimes(1);
  });
});
