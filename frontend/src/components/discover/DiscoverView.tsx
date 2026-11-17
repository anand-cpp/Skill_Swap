import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import type { Student, StudentSummary, Match } from "../../types";
import { api } from "../../api";
import { DossierSkeleton } from "../ui/Skeleton";

interface DiscoverViewProps {
  activeStudent: Student | null;
  allStudents: StudentSummary[];
  matches: Match[];
  onOpenProposalWithTarget: (student: StudentSummary) => void;
  onNavigateToMatches: () => void;
  searchQuery: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  activeStudent,
  allStudents,
  matches,
  onOpenProposalWithTarget,
  onNavigateToMatches,
  searchQuery,
}) => {
  const initialSelectedId =
    allStudents.find((s) => s.id !== activeStudent?.id)?.id ??
    allStudents[0]?.id ??
    null;

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialSelectedId);
  const [selectedStudentFull, setSelectedStudentFull] = useState<Student | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "mutual" | string>("all");
  const [localSearch, setLocalSearch] = useState("");

  // Map of mutual peer IDs
  const mutualPeerIds = useMemo(() => {
    const ids = new Set<number>();
    matches.forEach((m) => {
      if (m.type === "MUTUAL") {
        ids.add(m.peer.id);
      }
    });
    return ids;
  }, [matches]);

  // Sync selected student if null and list is populated
  useEffect(() => {
    if (selectedStudentId === null && allStudents.length > 0) {
      const firstPeer = allStudents.find((s) => s.id !== activeStudent?.id) || allStudents[0];
      if (firstPeer) setSelectedStudentId(firstPeer.id);
    }
  }, [allStudents, activeStudent?.id, selectedStudentId]);

  // Fetch full details of selected student whenever ID changes
  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }
    let isMounted = true;
    setLoadingFull(true);
    api
      .getStudent(selectedStudentId)
      .then((data) => {
        if (isMounted) setSelectedStudentFull(data);
      })
      .catch((err) => {
        console.error("Error loading student details:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingFull(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedStudentId]);

  // Combined search term
  const effectiveSearch = (searchQuery || localSearch).toLowerCase().trim();

  // Filter students
  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      // Search query
      if (effectiveSearch) {
        const matchesName = student.name.toLowerCase().includes(effectiveSearch);
        const matchesCollege = student.college.toLowerCase().includes(effectiveSearch);
        const matchesBio = student.bio.toLowerCase().includes(effectiveSearch);
        if (!matchesName && !matchesCollege && !matchesBio) return false;
      }

      // Filter chips
      if (activeFilter === "mutual") {
        return mutualPeerIds.has(student.id);
      } else if (activeFilter !== "all") {
        // match category if needed
      }

      return true;
    });
  }, [allStudents, effectiveSearch, activeFilter, mutualPeerIds]);

  // Metric stats
  const distinctCollegesCount = useMemo(() => {
    const colleges = new Set(allStudents.map((s) => s.college.trim()));
    return colleges.size;
  }, [allStudents]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isMutual = selectedStudentId ? mutualPeerIds.has(selectedStudentId) : false;
  const isSelf = activeStudent?.id === selectedStudentId;

  // Selected student's summary from list
  const selectedStudentSummary = allStudents.find((s) => s.id === selectedStudentId);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#c7c4d7]/20">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-[#777586] font-['Manrope'] text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#4338ca]"></span>
            <span>Network Registry • Academic Node</span>
          </div>
          <h1 className="font-['Newsreader'] text-3xl sm:text-4xl text-[#1b1b1e] tracking-tight font-normal">
            Peer Talent Directory
          </h1>
          <p className="font-['Manrope'] text-[14px] text-[#464554] leading-relaxed">
            Algorithmic bi-directional skill matchmaking. Real-time reciprocity detection active for{" "}
            <strong className="text-[#1b1b1e] font-semibold">
              {activeStudent?.name || "Active Context"}
            </strong>
            .
          </p>
        </div>

        {/* Live Metrics Pill */}
        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl shadow-xs border border-[#c7c4d7]/30 self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e]">
              {allStudents.length}
            </span>
            <span className="font-['Manrope'] text-[12px] text-[#777586]">Active Peers</span>
          </div>
          <span className="w-1 h-3 rounded-full bg-[#eae7eb]"></span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#4338ca]">school</span>
            <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e]">
              {distinctCollegesCount}
            </span>
            <span className="font-['Manrope'] text-[12px] text-[#777586]">Colleges</span>
          </div>
          {mutualPeerIds.size > 0 && (
            <>
              <span className="w-1 h-3 rounded-full bg-[#eae7eb]"></span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
                  sync_alt
                </span>
                <span className="font-['Manrope'] text-[12px] font-bold text-[#006c4a]">
                  {mutualPeerIds.size} Reciprocal
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Directory List (~40% on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Search & Filter Strip */}
          <div className="bg-white p-3.5 rounded-xl border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-3">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777586] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter by name, campus, or topic..."
                className="w-full bg-[#f6f2f7] text-[#1b1b1e] placeholder:text-[#777586] font-['Manrope'] text-[13px] pl-9 pr-8 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#4338ca] transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#1b1b1e] text-xs p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Chips Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-full font-['Manrope'] text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-[#4338ca] text-white shadow-xs"
                    : "bg-[#f0edf1] hover:bg-[#eae7eb] text-[#464554]"
                }`}
              >
                All Students ({allStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("mutual")}
                className={`px-3 py-1 rounded-full font-['Manrope'] text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  activeFilter === "mutual"
                    ? "bg-[#006c4a] text-white shadow-xs"
                    : "bg-[#82f5c1]/30 hover:bg-[#82f5c1]/50 text-[#006c4a]"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">swap_horizontal_circle</span>
                <span>Mutual Matches ({mutualPeerIds.size})</span>
              </button>
            </div>
          </div>

          {/* Student Cards Stream */}
          <div className="flex flex-col gap-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#c7c4d7]/30 text-center text-[#777586]">
                <span className="material-symbols-outlined text-[32px] text-[#c7c4d7]">search_off</span>
                <p className="font-['Manrope'] text-[14px] mt-2">No students match your filter.</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = student.id === selectedStudentId;
                const studentIsMutual = mutualPeerIds.has(student.id);
                const isCurrentSelf = student.id === activeStudent?.id;

                return (
                  <motion.div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.15 }}
                    className={`group cursor-pointer rounded-xl p-4 transition-all duration-200 border text-left relative ${
                      isSelected
                        ? "bg-white border-[#006c4a] shadow-md ring-1 ring-[#006c4a]/50"
                        : "bg-white border-[#c7c4d7]/30 hover:border-[#c7c4d7] hover:shadow-xs"
                    }`}
                  >
                    {/* Top Row: Avatar & Identity */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#f0edf1] text-[#4338ca] flex items-center justify-center font-['Manrope'] text-[13px] font-bold shrink-0">
                          {getInitials(student.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e] truncate">
                              {student.name}
                            </span>
                            {isCurrentSelf && (
                              <span className="bg-[#e3dfff] text-[#2a14b4] px-1.5 py-0.2 rounded font-['Manrope'] text-[10px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="font-['Manrope'] text-[12px] text-[#777586] truncate">
                            {student.college}
                          </span>
                        </div>
                      </div>

                      {/* Mutual Badge or Self Status */}
                      {studentIsMutual ? (
                        <div className="shrink-0 flex items-center gap-1 bg-[#85f8c4]/40 text-[#006c4a] px-2 py-0.5 rounded-full border border-[#85f8c4]">
                          <span className="material-symbols-outlined text-[13px]">sync</span>
                          <span className="font-['Manrope'] text-[11px] font-bold">100% Reciprocal</span>
                        </div>
                      ) : isCurrentSelf ? (
                        <span className="font-['Manrope'] text-[10px] font-bold uppercase text-[#777586] bg-[#eae7eb] px-2 py-0.5 rounded-full">
                          Active Anchor
                        </span>
                      ) : null}
                    </div>

                    {/* Bio snippet */}
                    {student.bio && (
                      <p className="font-['Manrope'] text-[12px] text-[#464554] line-clamp-2 mb-2.5">
                        {student.bio}
                      </p>
                    )}

                    {/* Skill count counts preview */}
                    <div className="grid grid-cols-2 gap-2 bg-[#f6f2f7]/80 p-2 rounded-lg font-['Manrope'] text-[11px]">
                      <div className="flex items-center gap-1 text-[#006c4a] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                        <span>Teaches ({student.teach_count})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#4338ca] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca]"></span>
                        <span>Wants to Learn ({student.learn_count})</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Student Profile Deep Dive (~60% on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {loadingFull ? (
            <DossierSkeleton />
          ) : selectedStudentFull ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-6">
              {/* Header Hero */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#c7c4d7]/20">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#e3dfff] text-[#2a14b4] font-['Newsreader'] text-2xl font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(selectedStudentFull.name)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-['Newsreader'] text-2xl sm:text-3xl text-[#1b1b1e] font-medium leading-tight">
                        {selectedStudentFull.name}
                      </h2>
                      {isSelf && (
                        <span className="bg-[#e3dfff] text-[#2a14b4] px-2 py-0.5 rounded font-['Manrope'] text-[11px] font-bold uppercase">
                          You (Active Context)
                        </span>
                      )}
                    </div>
                    <p className="font-['Manrope'] text-[14px] text-[#4338ca] font-semibold">
                      {selectedStudentFull.college}
                    </p>
                    {selectedStudentFull.bio && (
                      <p className="font-['Manrope'] text-[13px] text-[#464554] mt-2 leading-relaxed italic">
                        "{selectedStudentFull.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {!isSelf && selectedStudentSummary && (
                  <button
                    type="button"
                    onClick={() => onOpenProposalWithTarget(selectedStudentSummary)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#4338ca] text-white font-['Manrope'] text-[13px] font-semibold hover:bg-[#372abf] transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                    <span>Propose Exchange</span>
                  </button>
                )}
              </div>

              {/* Reciprocity Alert Banner if Mutual */}
              {isMutual && !isSelf && (
                <div className="p-4 rounded-xl bg-[#85f8c4]/20 border border-[#85f8c4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#006c4a]/15 text-[#006c4a] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                    </div>
                    <div>
                      <span className="font-['Manrope'] text-[12px] font-bold text-[#006c4a] uppercase tracking-wider block">
                        Direct Mutual Match Available!
                      </span>
                      <p className="font-['Manrope'] text-[13px] text-[#1b1b1e] mt-0.5">
                        You both have complementary skills that directly satisfy each other's wishlist.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToMatches}
                    className="inline-flex items-center gap-1 text-[#006c4a] font-['Manrope'] text-[12px] font-bold hover:underline shrink-0"
                  >
                    <span>View in Matches</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* Side-by-side Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What Student Can Teach (Emerald) */}
                <div className="flex flex-col bg-[#f6f2f7]/70 p-4 rounded-xl border border-[#c7c4d7]/30">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#c7c4d7]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
                      <h3 className="font-['Manrope'] text-[13px] font-bold text-[#006c4a] uppercase tracking-wider">
                        Skills {selectedStudentFull.name.split(" ")[0]} Can Teach
                      </h3>
                    </div>
                    <span className="bg-[#85f8c4]/50 text-[#002114] font-['Manrope'] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {selectedStudentFull.skills.filter((s) => s.direction === "teach").length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {selectedStudentFull.skills.filter((s) => s.direction === "teach").length === 0 ? (
                      <p className="text-xs text-[#777586] italic py-2">No teaching skills listed.</p>
                    ) : (
                      selectedStudentFull.skills
                        .filter((s) => s.direction === "teach")
                        .map((skill) => {
                          const matchesActiveLearn = activeStudent?.skills.some(
                            (as) =>
                              as.direction === "learn" &&
                              as.name.toLowerCase() === skill.name.toLowerCase()
                          );

                          return (
                            <div
                              key={skill.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                matchesActiveLearn
                                  ? "bg-white border-[#006c4a]/50 shadow-xs"
                                  : "bg-white border-[#c7c4d7]/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                                  {skill.name}
                                </span>
                                <span className="bg-[#f0edf1] text-[#464554] font-['Manrope'] text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                  {skill.level}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px] font-['Manrope'] text-[#777586]">
                                <span>Category: {skill.category}</span>
                                {matchesActiveLearn && (
                                  <span className="text-[#006c4a] font-semibold flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    On your wishlist!
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* What Student Wants to Learn (Indigo) */}
                <div className="flex flex-col bg-[#f6f2f7]/70 p-4 rounded-xl border border-[#c7c4d7]/30">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#c7c4d7]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4338ca]"></span>
                      <h3 className="font-['Manrope'] text-[13px] font-bold text-[#4338ca] uppercase tracking-wider">
                        Skills {selectedStudentFull.name.split(" ")[0]} Wants to Learn
                      </h3>
                    </div>
                    <span className="bg-[#e3dfff] text-[#2a14b4] font-['Manrope'] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {selectedStudentFull.skills.filter((s) => s.direction === "learn").length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {selectedStudentFull.skills.filter((s) => s.direction === "learn").length === 0 ? (
                      <p className="text-xs text-[#777586] italic py-2">No learning goals listed.</p>
                    ) : (
                      selectedStudentFull.skills
                        .filter((s) => s.direction === "learn")
                        .map((skill) => {
                          const matchesActiveTeach = activeStudent?.skills.some(
                            (as) =>
                              as.direction === "teach" &&
                              as.name.toLowerCase() === skill.name.toLowerCase()
                          );

                          return (
                            <div
                              key={skill.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                matchesActiveTeach
                                  ? "bg-white border-[#4338ca]/50 shadow-xs"
                                  : "bg-white border-[#c7c4d7]/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                                  {skill.name}
                                </span>
                                <span className="bg-[#f0edf1] text-[#464554] font-['Manrope'] text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                  {skill.level}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px] font-['Manrope'] text-[#777586]">
                                <span>Category: {skill.category}</span>
                                {matchesActiveTeach && (
                                  <span className="text-[#4338ca] font-semibold flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                                    You can teach this!
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              {/* Barter Guarantees */}
              <div className="flex items-center gap-2 p-3 bg-[#f6f2f7] rounded-xl text-xs text-[#777586]">
                <span className="material-symbols-outlined text-[18px] text-[#006c4a]">balance</span>
                <span>
                  Exchanges on SkillSwap are 1:1, non-monetary, and direct. Both students give and receive instruction equally.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
              <p className="font-['Manrope'] text-[14px]">Select a student from the directory to inspect their portfolio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
