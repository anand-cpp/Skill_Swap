import React, { useState } from "react";
import type { Student, StudentSummary } from "../../types";

interface SidebarProps {
  currentView: "discover" | "matches" | "create-profile" | "my-exchanges";
  onNavigate: (view: "discover" | "matches" | "create-profile" | "my-exchanges") => void;
  activeStudent: Student | null;
  students: StudentSummary[];
  onSelectStudent: (id: number) => void;
  mutualCount: number;
  pendingCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeStudent,
  students,
  onSelectStudent,
  mutualCount,
  pendingCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [showSwitcher, setShowSwitcher] = useState(false);

  const navItems = [
    {
      id: "discover" as const,
      label: "Discover",
      icon: "explore",
      badge: null,
    },
    {
      id: "matches" as const,
      label: "Matches",
      icon: "swap_horiz",
      badge: mutualCount > 0 ? mutualCount : null,
      badgeColor: "bg-secondary-fixed text-on-secondary-fixed",
    },
    {
      id: "create-profile" as const,
      label: "Create Profile",
      icon: "edit_note",
      badge: null,
    },
    {
      id: "my-exchanges" as const,
      label: "My Exchanges",
      icon: "move_to_inbox",
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-primary-fixed text-primary",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`fixed left-0 top-0 h-full w-72 bg-[#ffffff] z-50 flex flex-col justify-between border-r border-[#c7c4d7]/40 shadow-sm transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-[#c7c4d7]/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#4338ca] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <span className="material-symbols-outlined text-[20px]">swap_horizontal_circle</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Newsreader'] text-2xl text-[#1b1b1e] tracking-tight leading-none font-medium">
                  SkillSwap
                </span>
                <span className="font-['Manrope'] text-[11px] text-[#464554] uppercase tracking-wider mt-1 font-semibold">
                  Reciprocal Exchange
                </span>
              </div>
            </div>
            <p className="font-['Manrope'] text-[13px] text-[#777586] italic mt-3">
              "Knowledge flows both ways."
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all font-['Manrope'] text-[14px] font-semibold cursor-pointer ${
                    isActive
                      ? "bg-[#4338ca] text-white shadow-sm"
                      : "text-[#464554] hover:bg-[#f6f2f7] hover:text-[#1b1b1e]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? "text-white" : "text-[#777586]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`ml-auto font-['Manrope'] text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || "bg-[#eae7eb] text-[#1b1b1e]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Context Card & Switcher */}
        <div className="p-4 border-t border-[#c7c4d7]/30 bg-[#f6f2f7]/60 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-['Manrope'] text-[10px] text-[#006c4a] uppercase font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse"></span>
              Active Context
            </span>
            <button
              type="button"
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="text-[#464554] hover:text-[#1b1b1e] p-1 rounded hover:bg-[#eae7eb] transition-colors cursor-pointer"
              title="Switch Active Student"
            >
              <span className="material-symbols-outlined text-[16px]">unfold_more</span>
            </button>
          </div>

          {activeStudent ? (
            <div
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#c7c4d7]/30 hover:border-[#4338ca]/50 transition-all cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#e3dfff] text-[#2a14b4] flex items-center justify-center font-['Manrope'] text-xs font-bold shrink-0">
                {getInitials(activeStudent.name)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-semibold truncate">
                  {activeStudent.name}
                </span>
                <span className="font-['Manrope'] text-[11px] text-[#777586] truncate">
                  {activeStudent.college}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#777586] italic p-2">No student selected</div>
          )}

          {/* Switcher Dropdown Menu */}
          {showSwitcher && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-[#c7c4d7]/50 max-h-60 overflow-y-auto p-2 z-50">
              <div className="px-2 py-1 text-[11px] font-bold text-[#777586] uppercase tracking-wider border-b border-[#eae7eb] mb-1">
                Switch Student Context
              </div>
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSelectStudent(s.id);
                    setShowSwitcher(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    activeStudent?.id === s.id
                      ? "bg-[#e3dfff] text-[#2a14b4] font-semibold"
                      : "hover:bg-[#f6f2f7] text-[#1b1b1e]"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#f0edf1] text-[#464554] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {getInitials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate">{s.name}</div>
                    <div className="text-[10px] text-[#777586] truncate">{s.college}</div>
                  </div>
                  {activeStudent?.id === s.id && (
                    <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
