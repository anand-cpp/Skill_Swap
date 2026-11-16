import React from "react";
import { motion } from "motion/react";
import type { Student, Match, Cycle, StudentSummary } from "../../types";

interface MatchesViewProps {
  activeStudent: Student | null;
  matches: Match[];
  cycles: Cycle[];
  onOpenProposalWithTarget: (student: StudentSummary) => void;
  allStudents: StudentSummary[];
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  activeStudent,
  matches,
  cycles,
  onOpenProposalWithTarget,
  allStudents,
}) => {
  const mutualMatches = matches.filter((m) => m.type === "MUTUAL");
  const relevantMatches = matches.filter((m) => m.type === "RELEVANT");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const findSummary = (id: number): StudentSummary | undefined => {
    return allStudents.find((s) => s.id === id);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Editorial Header & Ledger Count Metrics */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#c7c4d7]/20">
          <div className="max-w-3xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#777586] font-['Manrope'] text-[11px] font-bold uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#4338ca]"></span>
              <span>Ledger Portfolio • Vol. IV / Campus Exchange</span>
            </div>
            <h1 className="font-['Newsreader'] text-4xl sm:text-5xl text-[#1b1b1e] tracking-tight font-normal">
              Your Skill Matches
            </h1>
            <p className="font-['Manrope'] text-[15px] text-[#464554] max-w-2xl leading-relaxed">
              Find peers who want what you know, and know what you want. Knowledge barter with zero monetary barrier.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#464554] font-['Manrope'] text-[13px] italic bg-white px-3.5 py-1.5 rounded-full border border-[#c7c4d7]/30 shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">verified</span>
            <span>Zero-currency, peer-authenticated barter</span>
          </div>
        </div>

        {/* Ledger Summary Bar: 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Metric 1 */}
          <div className="bg-white p-5 rounded-xl border border-[#c7c4d7]/30 shadow-xs flex items-start gap-4 hover:border-[#006c4a]/40 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#85f8c4]/40 flex items-center justify-center text-[#006c4a] shrink-0">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-['Newsreader'] text-3xl text-[#1b1b1e] font-semibold">
                  {mutualMatches.length}
                </span>
                <span className="font-['Manrope'] text-[12px] text-[#006c4a] uppercase font-bold tracking-wider">
                  Direct Swaps
                </span>
              </div>
              <p className="font-['Manrope'] text-[13px] text-[#777586] mt-0.5">
                Both learners simultaneously satisfy each other’s wishlist.
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white p-5 rounded-xl border border-[#c7c4d7]/30 shadow-xs flex items-start gap-4 hover:border-[#4338ca]/40 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#e3dfff] flex items-center justify-center text-[#2a14b4] shrink-0">
              <span className="material-symbols-outlined text-[24px]">change_circle</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-['Newsreader'] text-3xl text-[#1b1b1e] font-semibold">
                  {cycles.length}
                </span>
                <span className="font-['Manrope'] text-[12px] text-[#4338ca] font-bold uppercase tracking-wider">
                  3-Person Cycles
                </span>
              </div>
              <p className="font-['Manrope'] text-[13px] text-[#777586] mt-0.5">
                Triangular closed loop routing: zero dead-ends or idle tokens.
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white p-5 rounded-xl border border-[#c7c4d7]/30 shadow-xs flex items-start gap-4 hover:border-[#c7c4d7] transition-colors">
            <div className="w-11 h-11 rounded-lg bg-[#f0edf1] flex items-center justify-center text-[#464554] shrink-0">
              <span className="material-symbols-outlined text-[24px]">interests</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-['Newsreader'] text-3xl text-[#1b1b1e] font-semibold">
                  {relevantMatches.length}
                </span>
                <span className="font-['Manrope'] text-[12px] text-[#464554] uppercase font-bold tracking-wider">
                  Relevant Inquiries
                </span>
              </div>
              <p className="font-['Manrope'] text-[13px] text-[#777586] mt-0.5">
                Peers teaching your target topics with one-way syllabus overlap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: DIRECT MUTUAL EXCHANGES */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-[#006c4a] font-['Manrope'] text-[11px] uppercase tracking-wider mb-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
              <span>Equilibrium State</span>
            </div>
            <h2 className="font-['Newsreader'] text-2xl sm:text-3xl text-[#1b1b1e]">
              Direct Mutual Exchanges
            </h2>
            <p className="font-['Manrope'] text-[14px] text-[#464554] max-w-xl">
              The canonical barter: both individuals fulfill each other’s primary learning syllabus in real-time.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#464554] text-[11px] font-['Manrope'] font-bold border border-[#c7c4d7]/30 shadow-2xs self-start md:self-auto">
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">balance</span>
            <span>Bilateral Parity Calibrated</span>
          </div>
        </div>

        {mutualMatches.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
            <span className="material-symbols-outlined text-[36px] text-[#c7c4d7] mb-2">swap_calls</span>
            <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">No Direct Mutual Swaps Yet</p>
            <p className="font-['Manrope'] text-[13px] text-[#777586] max-w-md mx-auto mt-1">
              Add more skills you want to learn or skills you can teach in Create Profile to open reciprocal pairings.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {mutualMatches.map((match, idx) => {
              const peerSummary = findSummary(match.peer.id);
              const hasExistingRequest = match.request !== null;
              const isAccepted = match.request?.status === "accepted";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-[#c7c4d7]/40 shadow-xs p-6 flex flex-col gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
                    {/* Left Node: Active Student (You) */}
                    <div className="flex-1 bg-[#f6f2f7]/70 rounded-xl p-5 flex flex-col justify-between border border-[#c7c4d7]/20">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-[#e3dfff] text-[#2a14b4] flex items-center justify-center font-['Manrope'] text-[14px] font-bold shrink-0">
                          {getInitials(activeStudent?.name || "You")}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-['Newsreader'] text-xl text-[#1b1b1e] font-semibold truncate">
                              {activeStudent?.name || "Active Context"}
                            </span>
                            <span className="bg-[#e3dfff] text-[#2a14b4] px-1.5 py-0.5 rounded font-['Manrope'] text-[10px] font-bold uppercase">
                              You
                            </span>
                          </div>
                          <span className="font-['Manrope'] text-[12px] text-[#777586] truncate">
                            {activeStudent?.college}
                          </span>
                        </div>
                      </div>

                      {/* Your Offering Box */}
                      <div className="mt-4 pt-3 border-t border-[#c7c4d7]/20 flex flex-col gap-1.5">
                        <span className="font-['Manrope'] text-[11px] text-[#006c4a] uppercase font-bold tracking-wider">
                          Your Offering to {match.peer.name.split(" ")[0]}
                        </span>
                        <div className="flex flex-col gap-1">
                          {match.give.map((g) => (
                            <div
                              key={g.skill_id}
                              className="p-2.5 bg-white rounded-lg border border-[#c7c4d7]/30 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006c4a] text-[18px]">terminal</span>
                                <span className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-bold">
                                  {g.name}
                                </span>
                              </div>
                              <span className="font-['Manrope'] text-[10px] bg-[#85f8c4]/40 text-[#002114] px-2 py-0.5 rounded font-bold uppercase">
                                {g.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reciprocal Flow Bridge Centerpiece */}
                    <div className="w-full lg:w-80 flex flex-col items-center justify-center py-2 px-2">
                      <div className="bg-[#f0edf1]/60 w-full rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-center border border-[#c7c4d7]/30">
                        {/* 100% Reciprocal Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006c4a] text-white font-['Manrope'] text-[11px] uppercase tracking-wider font-bold shadow-xs">
                          <span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                          <span>100% Reciprocal Match</span>
                        </div>

                        {/* Kinetic Flow Connectors */}
                        <div className="w-full flex flex-col gap-2">
                          {/* Flow 1: Left to Right */}
                          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#c7c4d7]/30 shadow-2xs">
                            <span className="font-['Manrope'] text-[11px] text-[#4338ca] font-bold truncate">
                              You teach {match.give[0]?.name || "Skill"}
                            </span>
                            <div className="flex items-center gap-1 text-[#4338ca]">
                              <span className="w-6 h-[2px] bg-[#4338ca] rounded-full relative overflow-hidden">
                                <span className="absolute inset-0 bg-[#c3c0ff] animate-ping"></span>
                              </span>
                              <span className="material-symbols-outlined text-[16px]">east</span>
                            </div>
                          </div>

                          {/* Flow 2: Right to Left */}
                          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#c7c4d7]/30 shadow-2xs">
                            <div className="flex items-center gap-1 text-[#006c4a]">
                              <span className="material-symbols-outlined text-[16px]">west</span>
                              <span className="w-6 h-[2px] bg-[#006c4a] rounded-full relative overflow-hidden">
                                <span className="absolute inset-0 bg-[#85f8c4] animate-ping"></span>
                              </span>
                            </div>
                            <span className="font-['Manrope'] text-[11px] text-[#006c4a] font-bold truncate">
                              {match.peer.name.split(" ")[0]} teaches {match.get[0]?.name || "Skill"}
                            </span>
                          </div>
                        </div>

                        <span className="font-['Manrope'] text-[11px] text-[#777586] italic">
                          {match.reasons?.[0] || "Bilateral match authenticated across syllabus."}
                        </span>
                      </div>
                    </div>

                    {/* Right Node: Peer Student */}
                    <div className="flex-1 bg-[#f6f2f7]/70 rounded-xl p-5 flex flex-col justify-between border border-[#c7c4d7]/20">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-[#f0edf1] text-[#006c4a] flex items-center justify-center font-['Manrope'] text-[14px] font-bold shrink-0">
                          {getInitials(match.peer.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-['Newsreader'] text-xl text-[#1b1b1e] font-semibold truncate">
                              {match.peer.name}
                            </span>
                            <span className="material-symbols-outlined text-[16px] text-[#006c4a]" title="Verified">
                              check_circle
                            </span>
                          </div>
                          <span className="font-['Manrope'] text-[12px] text-[#777586] truncate">
                            {match.peer.college}
                          </span>
                        </div>
                      </div>

                      {/* Peer Offering Box */}
                      <div className="mt-4 pt-3 border-t border-[#c7c4d7]/20 flex flex-col gap-1.5">
                        <span className="font-['Manrope'] text-[11px] text-[#4338ca] uppercase font-bold tracking-wider">
                          {match.peer.name.split(" ")[0]} Offers You
                        </span>
                        <div className="flex flex-col gap-1">
                          {match.get.map((g) => (
                            <div
                              key={g.skill_id}
                              className="p-2.5 bg-white rounded-lg border border-[#c7c4d7]/30 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4338ca] text-[18px]">auto_stories</span>
                                <span className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-bold">
                                  {g.name}
                                </span>
                              </div>
                              <span className="font-['Manrope'] text-[10px] bg-[#e3dfff] text-[#2a14b4] px-2 py-0.5 rounded font-bold uppercase">
                                On Your Wishlist
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-4 border-t border-[#c7c4d7]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[#464554] font-['Manrope'] text-[13px]">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                        1:1
                      </span>
                      <span>Equitable barter: equal hours committed by both learners.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      {hasExistingRequest ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1.5 rounded-lg font-['Manrope'] text-[12px] font-bold uppercase ${
                              isAccepted
                                ? "bg-[#85f8c4]/50 text-[#002114]"
                                : "bg-[#f0edf1] text-[#464554]"
                            }`}
                          >
                            Status: {match.request?.status}
                          </span>
                        </div>
                      ) : peerSummary ? (
                        <button
                          type="button"
                          onClick={() => onOpenProposalWithTarget(peerSummary)}
                          className="flex items-center justify-center gap-2 bg-[#4338ca] text-white px-5 py-2 rounded-lg font-['Manrope'] text-[13px] font-bold hover:bg-[#372abf] transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <span className="material-symbols-outlined text-[18px]">handshake</span>
                          <span>Propose Bilateral Swap</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: 3-PERSON CLOSED-LOOP EXCHANGE CYCLES */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="max-w-3xl flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-[#4338ca] font-['Manrope'] text-[11px] uppercase tracking-wider font-bold">
              <span className="material-symbols-outlined text-[16px]">all_inclusive</span>
              <span>Algorithmic Non-Monetary Clearinghouse</span>
            </div>
            <h2 className="font-['Newsreader'] text-2xl sm:text-3xl text-[#1b1b1e] tracking-tight">
              Think Beyond Two: 3-Person Knowledge Cycles
            </h2>
            <p className="font-['Manrope'] text-[14px] text-[#464554]">
              When direct bilateral swaps aren’t available, SkillSwap unlocks three-person closed loops where every participant teaches and learns in simultaneous resonance. No currency, no bottlenecks.
            </p>
          </div>
          <div className="bg-[#85f8c4]/30 text-[#002114] px-4 py-2 rounded-xl flex items-center gap-2 border border-[#85f8c4]/50 shrink-0 shadow-2xs self-start md:self-auto">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">published_with_changes</span>
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-[11px] font-bold uppercase tracking-wider">Topology Verified</span>
              <span className="font-['Manrope'] text-[12px] font-medium">3 Students • 3 Skills • Zero Dead-Ends</span>
            </div>
          </div>
        </div>

        {cycles.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
            <span className="material-symbols-outlined text-[36px] text-[#c7c4d7] mb-2">trip_origin</span>
            <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">No 3-Person Cycles Detected</p>
            <p className="font-['Manrope'] text-[13px] text-[#777586] max-w-md mx-auto mt-1">
              As more campus peers register complementary skills, triangular loops will emerge automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cycles.map((cycle, cycleIdx) => {
              return (
                <div
                  key={cycleIdx}
                  className="bg-white rounded-2xl border border-[#c7c4d7]/40 p-6 sm:p-8 shadow-xs flex flex-col gap-6"
                >
                  {/* Loop Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d7]/20">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#4338ca] text-white flex items-center justify-center font-['Manrope'] text-[13px] font-bold">
                        Δ{cycleIdx + 1}
                      </span>
                      <div>
                        <span className="font-['Newsreader'] text-xl text-[#1b1b1e] font-medium block">
                          Triad Loop #{100 + cycleIdx}
                        </span>
                        <span className="font-['Manrope'] text-[12px] text-[#777586]">
                          Closed circular routing across {cycle.participants.map((p) => p.name).join(", ")}
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#85f8c4]/40 text-[#002114] px-3 py-1 rounded-full font-['Manrope'] text-[11px] font-bold flex items-center gap-1 border border-[#85f8c4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse"></span>
                      Resonant Loop
                    </span>
                  </div>

                  {/* 3-Node Topology Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {cycle.participants.map((p, pIdx) => {
                      const isSelfNode = p.id === activeStudent?.id;
                      const nextNode = cycle.participants[(pIdx + 1) % cycle.participants.length];
                      const prevNode = cycle.participants[(pIdx + 2) % cycle.participants.length];

                      const displayName = isSelfNode ? (activeStudent?.name || "You") : p.name;
                      const nextDisplayName = nextNode.id === activeStudent?.id ? (activeStudent?.name || "You") : nextNode.name;
                      const prevDisplayName = prevNode.id === activeStudent?.id ? (activeStudent?.name || "You") : prevNode.name;

                      // Finding exchanges
                      const givesExchange = cycle.exchange.find(
                        (e) => (e.from === p.name || (isSelfNode && e.from === "You")) &&
                               (e.to === nextNode.name || (nextNode.id === activeStudent?.id && e.to === "You"))
                      );
                      const receivesExchange = cycle.exchange.find(
                        (e) => (e.to === p.name || (isSelfNode && e.to === "You")) &&
                               (e.from === prevNode.name || (prevNode.id === activeStudent?.id && e.from === "You"))
                      );

                      return (
                        <div
                          key={p.id}
                          className={`rounded-xl p-5 flex flex-col justify-between border ${
                            isSelfNode
                              ? "bg-[#e3dfff]/20 border-[#4338ca]/40 shadow-xs"
                              : "bg-[#f6f2f7]/80 border-[#c7c4d7]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full bg-white text-[#4338ca] flex items-center justify-center font-['Manrope'] text-[13px] font-bold border border-[#c7c4d7]/30 shadow-2xs">
                                {getInitials(displayName)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e] truncate">
                                  {displayName}
                                </span>
                                <span className="font-['Manrope'] text-[11px] text-[#777586]">
                                  {isSelfNode ? "You (Active Anchor)" : `Node ${String.fromCharCode(65 + pIdx)}`}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded font-['Manrope'] text-[10px] font-bold uppercase bg-white border border-[#c7c4d7]/30 text-[#464554]">
                              Node {String.fromCharCode(65 + pIdx)}
                            </span>
                          </div>

                          {/* Direct exchange attributes */}
                          <div className="flex flex-col gap-2.5">
                            {/* Gives */}
                            <div className="bg-white p-2.5 rounded-lg border border-[#c7c4d7]/30">
                              <div className="flex items-center justify-between text-[#006c4a] font-['Manrope'] text-[10px] font-bold uppercase mb-0.5">
                                <span>Gives to {nextDisplayName.split(" ")[0]}</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </div>
                              <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e]">
                                {givesExchange?.skill || "Topic Instruction"}
                              </span>
                            </div>

                            {/* Receives */}
                            <div className="bg-white p-2.5 rounded-lg border border-[#c7c4d7]/30">
                              <div className="flex items-center justify-between text-[#4338ca] font-['Manrope'] text-[10px] font-bold uppercase mb-0.5">
                                <span>Receives from {prevDisplayName.split(" ")[0]}</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                              </div>
                              <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e]">
                                {receivesExchange?.skill || "Topic Learning"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-[#c7c4d7]/20 flex items-center justify-between text-[11px] font-['Manrope'] text-[#777586]">
                            <span className="italic text-[#006c4a] font-semibold">Parity balance</span>
                            <span className="font-bold">1:1:1</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: RELEVANT ONE-WAY OPPORTUNITIES */}
      {relevantMatches.length > 0 && (
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-1 pb-2">
            <h3 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">
              Relevant Opportunities ({relevantMatches.length})
            </h3>
            <p className="font-['Manrope'] text-[13px] text-[#777586]">
              Peers with complementary knowledge where one directional fit has been identified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantMatches.map((m, idx) => {
              const peerSummary = findSummary(m.peer.id);
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#c7c4d7]/30 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f0edf1] text-[#464554] flex items-center justify-center font-['Manrope'] text-[13px] font-bold">
                        {getInitials(m.peer.name)}
                      </div>
                      <div>
                        <h4 className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                          {m.peer.name}
                        </h4>
                        <p className="font-['Manrope'] text-[12px] text-[#777586]">
                          {m.peer.college}
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#f0edf1] text-[#464554] px-2 py-0.5 rounded font-['Manrope'] text-[10px] font-bold uppercase">
                      Relevant
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-['Manrope'] bg-[#f6f2f7] p-3 rounded-lg">
                    {m.give.length > 0 && (
                      <div className="text-[#006c4a]">
                        <strong>You offer:</strong> {m.give.map((g) => g.name).join(", ")}
                      </div>
                    )}
                    {m.get.length > 0 && (
                      <div className="text-[#4338ca]">
                        <strong>They offer:</strong> {m.get.map((g) => g.name).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    {peerSummary && (
                      <button
                        type="button"
                        onClick={() => onOpenProposalWithTarget(peerSummary)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4338ca] text-white font-['Manrope'] text-[12px] font-bold hover:bg-[#372abf] transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">handshake</span>
                        <span>Propose Swap</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
