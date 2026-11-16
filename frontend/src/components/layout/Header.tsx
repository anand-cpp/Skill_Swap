import React from "react";

interface HeaderProps {
  onOpenMobile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mutualCount: number;
  onOpenProposal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  searchQuery,
  onSearchChange,
  mutualCount,
  onOpenProposal,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#fbf8fc]/90 backdrop-blur-md z-40 border-b border-[#c7c4d7]/30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-[#464554] hover:bg-[#eae7eb] transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777586] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search peers by skill (e.g. Python, UI Design, Guitar)..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c7c4d7]/40 rounded-lg font-['Manrope'] text-[13px] text-[#1b1b1e] placeholder:text-[#777586] focus:outline-none focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#1b1b1e] text-xs p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-3 ml-3 shrink-0">
        {mutualCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#85f8c4]/30 text-[#002114] px-3 py-1 rounded-full border border-[#85f8c4]">
            <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span className="font-['Manrope'] text-[12px] font-bold">
              {mutualCount} Mutual Swap{mutualCount > 1 ? "s" : ""} Available
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenProposal}
          className="flex items-center gap-1.5 bg-[#4338ca] text-white px-3.5 sm:px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-semibold hover:bg-[#372abf] transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">handshake</span>
          <span className="hidden sm:inline">Propose an Exchange</span>
          <span className="sm:hidden">Propose</span>
        </button>
      </div>
    </header>
  );
};
