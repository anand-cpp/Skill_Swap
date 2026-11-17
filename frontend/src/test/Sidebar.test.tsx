import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../components/layout/Sidebar";
import type { Student, StudentSummary } from "../types";

const mockActiveStudent: Student = {
  id: 1,
  name: "Riya Sharma",
  college: "IIT Delhi",
  bio: "CS sophomore",
  teach_count: 1,
  learn_count: 1,
  skills: [
    { id: 1, name: "Python", category: "Programming", direction: "teach", level: "expert" },
    { id: 2, name: "Guitar", category: "Music", direction: "learn", level: "beginner" },
  ],
};

const mockStudents: StudentSummary[] = [
  { id: 1, name: "Riya Sharma", college: "IIT Delhi", bio: "CS sophomore", teach_count: 1, learn_count: 1 },
  { id: 2, name: "Arjun Nair", college: "NIT Trichy", bio: "Web dev", teach_count: 2, learn_count: 1 },
];

describe("Sidebar component", () => {
  it("renders brand, nav items, and active context student", () => {
    const onNavigate = vi.fn();
    const onSelectStudent = vi.fn();

    render(
      <Sidebar
        currentView="discover"
        onNavigate={onNavigate}
        activeStudent={mockActiveStudent}
        students={mockStudents}
        onSelectStudent={onSelectStudent}
        mutualCount={3}
        pendingCount={1}
        isOpenMobile={false}
        onCloseMobile={vi.fn()}
      />
    );

    expect(screen.getByText("SkillSwap")).toBeInTheDocument();
    expect(screen.getByText("Discover")).toBeInTheDocument();
    expect(screen.getByText("Matches")).toBeInTheDocument();
    expect(screen.getByText("Create Profile")).toBeInTheDocument();
    expect(screen.getByText("My Exchanges")).toBeInTheDocument();

    const matchesBtn = screen.getByRole("button", { name: /Matches/i });
    fireEvent.click(matchesBtn);
    expect(onNavigate).toHaveBeenCalledWith("matches");

    expect(screen.getByText("Riya Sharma")).toBeInTheDocument();
    expect(screen.getByText("IIT Delhi")).toBeInTheDocument();
  });
});
