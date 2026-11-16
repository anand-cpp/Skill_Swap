import React, { useState } from "react";
import { motion } from "motion/react";
import type { ExchangeRequest, Student } from "../../types";

interface ExchangesViewProps {
  activeStudent: Student | null;
  requests: ExchangeRequest[];
  onDecide: (requestId: number, action: "accept" | "reject" | "complete") => Promise<void>;
  onNavigateToDiscover: () => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const ExchangesView: React.FC<ExchangesViewProps> = ({
  activeStudent,
  requests,
  onDecide,
  onNavigateToDiscover,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "active" | "completed">("incoming");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (!activeStudent) {
    return (
      <div className="p-12 text-center text-[#777586]">
        Please select a student from the sidebar context.
      </div>
    );
  }

  // Filter requests
  const incoming = requests.filter(
    (r) => r.receiver_id === activeStudent.id && r.status === "pending"
  );
  const outgoing = requests.filter(
    (r) => r.sender_id === activeStudent.id && r.status === "pending"
  );
  const activeExchanges = requests.filter((r) => r.status === "accepted");
  const completed = requests.filter(
    (r) => r.status === "completed" || r.status === "rejected"
  );

  const handleAction = async (
    requestId: number,
    action: "accept" | "reject" | "complete"
  ) => {
    setProcessingId(requestId);
    try {
      await onDecide(requestId, action);
      const actionLabel =
        action === "accept"
          ? "accepted"
          : action === "reject"
            ? "declined"
            : "marked completed";
      onToast(`Exchange request #${requestId} ${actionLabel}.`, "success");
    } catch (err: any) {
      onToast(err?.message || `Failed to ${action} request.`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Editorial Page Title & Metric Ribbon */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-[#c7c4d7]/20">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[#777586] font-['Manrope'] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#4338ca]"></span>
              <span>Ledger & Mutual Transmissions</span>
            </div>
            <h1 className="font-['Newsreader'] text-4xl sm:text-5xl text-[#1b1b1e] tracking-tight font-normal">
              My Exchanges
            </h1>
            <p className="font-['Manrope'] text-[15px] text-[#464554] leading-relaxed">
              Review reciprocal proposals, manage active learning partnerships, and look back on completed skill swaps.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {incoming.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#85f8c4]/40 text-[#002114] font-['Manrope'] text-[12px] font-bold border border-[#85f8c4]">
                <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
                <span>{incoming.length} Action Required (Incoming)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e3dfff] text-[#2a14b4] font-['Manrope'] text-[12px] font-bold">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>{activeExchanges.length} Active Partnerships</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eae7eb] text-[#464554] font-['Manrope'] text-[12px] font-bold">
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">verified</span>
              <span>{completed.filter((r) => r.status === "completed").length} Completed</span>
            </div>
          </div>
        </div>

        {/* Segmented Navigation Ledger Tabs */}
        <div className="flex items-center justify-between bg-[#f0edf1] p-1.5 rounded-xl">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "incoming"
                  ? "bg-white text-[#1b1b1e] shadow-xs"
                  : "text-[#464554] hover:text-[#1b1b1e] hover:bg-white/50"
              }`}
            >
              <span>Incoming Proposals</span>
              {incoming.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                  {incoming.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("outgoing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "outgoing"
                  ? "bg-white text-[#1b1b1e] shadow-xs"
                  : "text-[#464554] hover:text-[#1b1b1e] hover:bg-white/50"
              }`}
            >
              <span>Outgoing</span>
              {outgoing.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#eae7eb] text-[#464554] text-[11px] font-bold">
                  {outgoing.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-white text-[#1b1b1e] shadow-xs"
                  : "text-[#464554] hover:text-[#1b1b1e] hover:bg-white/50"
              }`}
            >
              <span>Active Exchanges</span>
              {activeExchanges.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#e3dfff] text-[#2a14b4] text-[11px] font-bold">
                  {activeExchanges.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-white text-[#1b1b1e] shadow-xs"
                  : "text-[#464554] hover:text-[#1b1b1e] hover:bg-white/50"
              }`}
            >
              <span>Completed / History</span>
              {completed.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#eae7eb] text-[#464554] text-[11px] font-bold">
                  {completed.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pr-3 text-[#464554] font-['Manrope'] text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">balance</span>
            <span>True Parity Barter</span>
          </div>
        </div>
      </section>

      {/* Main Grid: 8 Columns Left + 4 Columns Right */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Proposals & Active Exchanges (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* INCOMING TAB */}
          {activeTab === "incoming" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c4a] text-[22px]">inbox</span>
                  <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">
                    Pending Incoming Proposals
                  </h2>
                </div>
                {incoming.length > 0 && (
                  <span className="font-['Manrope'] text-[11px] uppercase tracking-wider text-[#006c4a] font-bold bg-[#85f8c4]/40 px-2.5 py-1 rounded-full">
                    Response Requested
                  </span>
                )}
              </div>

              {incoming.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
                  <span className="material-symbols-outlined text-[36px] text-[#c7c4d7] mb-2">mark_email_read</span>
                  <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">All Clear</p>
                  <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">
                    You have no pending incoming proposals right now.
                  </p>
                </div>
              ) : (
                incoming.map((r) => {
                  const isProcessing = processingId === r.id;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#006c4a]"></div>

                      {/* Header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#f0edf1] text-[#006c4a] flex items-center justify-center font-['Manrope'] text-[13px] font-bold">
                            {getInitials(r.sender_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-['Newsreader'] text-xl text-[#1b1b1e] font-medium">
                                {r.sender_name}
                              </h3>
                              <span className="material-symbols-outlined text-[#006c4a] text-[16px]">
                                verified
                              </span>
                            </div>
                            <span className="font-['Manrope'] text-[12px] text-[#777586]">
                              Propose an exchange • ID #{r.id}
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#85f8c4]/40 text-[#002114] text-[11px] font-['Manrope'] font-bold px-2.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      </div>

                      {/* Summary Banner */}
                      <div className="p-3 bg-[#f6f2f7] rounded-xl text-xs font-['Manrope'] text-[#1b1b1e] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4338ca] text-[18px]">
                          swap_horizontal_circle
                        </span>
                        <span>
                          {r.sender_name} proposes a direct 1:1 barter exchange with you.
                        </span>
                      </div>

                      {/* Bilateral Deal Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-[#f6f2f7]/60 p-4 rounded-xl border border-[#c7c4d7]/20">
                        {/* Sender offers */}
                        <div className="md:col-span-5 bg-white p-3.5 rounded-lg border border-[#c7c4d7]/30">
                          <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#006c4a] block mb-1">
                            {r.sender_name} will teach you:
                          </span>
                          <div className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                            {r.teach_skill}
                          </div>
                          <div className="text-[11px] text-[#777586] mt-0.5 font-['Manrope']">
                            {r.teach_category} • {r.teach_level}
                          </div>
                        </div>

                        {/* Center Knot */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
                          <span className="material-symbols-outlined text-[#4338ca] text-[20px]">sync</span>
                          <span className="font-['Manrope'] text-[9px] font-bold text-[#777586] uppercase">1:1</span>
                        </div>

                        {/* You offer */}
                        <div className="md:col-span-5 bg-white p-3.5 rounded-lg border border-[#c7c4d7]/30">
                          <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#4338ca] block mb-1">
                            You will teach {r.sender_name}:
                          </span>
                          <div className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                            {r.learn_skill}
                          </div>
                          <div className="text-[11px] text-[#777586] mt-0.5 font-['Manrope']">
                            On your teaching curriculum
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[#c7c4d7]/20 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(r.id, "reject")}
                          className="px-4 py-2 rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10 font-['Manrope'] text-[13px] font-semibold transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(r.id, "accept")}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#006c4a] text-white font-['Manrope'] text-[13px] font-bold hover:bg-[#005137] transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <span className="material-symbols-outlined text-[18px]">handshake</span>
                          <span>Accept & Begin Exchange</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* OUTGOING TAB */}
          {activeTab === "outgoing" && (
            <div className="flex flex-col gap-5">
              <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">Outgoing Proposals</h2>

              {outgoing.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
                  <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">No Outgoing Proposals</p>
                  <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">
                    Explore the talent directory or matches to propose an exchange with a peer.
                  </p>
                  <button
                    type="button"
                    onClick={onNavigateToDiscover}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4338ca] text-white font-['Manrope'] text-[13px] font-bold cursor-pointer"
                  >
                    <span>Discover Peers</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              ) : (
                outgoing.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-['Newsreader'] text-xl text-[#1b1b1e] font-medium">
                          Proposal to {r.receiver_name}
                        </div>
                        <span className="font-['Manrope'] text-[12px] text-[#777586]">
                          Sent {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="bg-[#f0edf1] text-[#464554] text-[11px] font-['Manrope'] font-bold px-2.5 py-0.5 rounded-full">
                        Awaiting Peer Response
                      </span>
                    </div>

                    <div className="bg-[#f6f2f7] p-3 rounded-lg text-xs font-['Manrope'] text-[#1b1b1e] flex flex-col gap-1">
                      <div>
                        <strong className="text-[#006c4a]">You offered to teach:</strong> {r.teach_skill}
                      </div>
                      <div>
                        <strong className="text-[#4338ca]">You requested to learn:</strong> {r.learn_skill}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ACTIVE EXCHANGES TAB */}
          {activeTab === "active" && (
            <div className="flex flex-col gap-5">
              <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">
                Active Learning Partnerships
              </h2>

              {activeExchanges.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
                  <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">No Active Exchanges</p>
                  <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">
                    Accepted proposals will appear here as ongoing peer instruction partnerships.
                  </p>
                </div>
              ) : (
                activeExchanges.map((r) => {
                  const isSender = r.sender_id === activeStudent.id;
                  const partnerName = isSender ? r.receiver_name : r.sender_name;
                  const isProcessing = processingId === r.id;

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#85f8c4]/40 text-[#006c4a] flex items-center justify-center font-['Manrope'] text-[13px] font-bold">
                            {getInitials(partnerName)}
                          </div>
                          <div>
                            <div className="font-['Newsreader'] text-xl text-[#1b1b1e] font-medium">
                              {partnerName}
                            </div>
                            <span className="font-['Manrope'] text-[11px] text-[#006c4a] font-bold uppercase tracking-wider">
                              Active Partnership
                            </span>
                          </div>
                        </div>

                        <span className="bg-[#85f8c4]/50 text-[#002114] text-[11px] font-['Manrope'] font-bold px-3 py-1 rounded-full">
                          Ongoing Exchange
                        </span>
                      </div>

                      {/* Exchange Flow */}
                      <div className="bg-[#f6f2f7] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-['Manrope']">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                          <span>
                            <strong>You teach:</strong> {isSender ? r.teach_skill : r.learn_skill}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-[#777586] hidden sm:block">
                          swap_horiz
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#4338ca]"></span>
                          <span>
                            <strong>{partnerName.split(" ")[0]} teaches:</strong>{" "}
                            {isSender ? r.learn_skill : r.teach_skill}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[#c7c4d7]/20 flex items-center justify-end">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(r.id, "complete")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#85f8c4] text-[#002114] font-['Manrope'] text-[12px] font-bold hover:bg-[#68dba9] transition-all cursor-pointer shadow-xs active:scale-98"
                        >
                          <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          <span>Mark Exchange Completed</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* COMPLETED TAB */}
          {activeTab === "completed" && (
            <div className="flex flex-col gap-5">
              <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">Ledger History</h2>

              {completed.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/30 text-center text-[#777586]">
                  <p className="font-['Newsreader'] text-xl text-[#1b1b1e]">No Completed Exchanges</p>
                  <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">
                    Concluded and archived exchanges will be cataloged here.
                  </p>
                </div>
              ) : (
                completed.map((r) => {
                  const partner = r.sender_id === activeStudent.id ? r.receiver_name : r.sender_name;
                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-xl p-4 border border-[#c7c4d7]/30 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            r.status === "completed" ? "text-[#006c4a]" : "text-[#777586]"
                          }`}
                        >
                          {r.status === "completed" ? "check_circle" : "cancel"}
                        </span>
                        <div>
                          <div className="font-['Manrope'] text-[14px] font-bold text-[#1b1b1e]">
                            Exchange with {partner}
                          </div>
                          <div className="font-['Manrope'] text-[12px] text-[#777586]">
                            {r.teach_skill} ↔ {r.learn_skill}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-['Manrope'] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          r.status === "completed"
                            ? "bg-[#85f8c4]/40 text-[#002114]"
                            : "bg-[#eae7eb] text-[#777586]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Column: Ledger Rules & Parity (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Account Parity Status */}
          <div className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-['Manrope'] text-[11px] text-[#006c4a] uppercase font-bold tracking-wider">
                Account Parity Status
              </span>
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">done_all</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Newsreader'] text-3xl sm:text-4xl text-[#1b1b1e]">1:1.00</span>
              <span className="font-['Manrope'] text-[12px] text-[#006c4a] font-bold">Equilibrium Met</span>
            </div>

            <p className="font-['Manrope'] text-[13px] text-[#464554]">
              Every barter exchange requires bilateral reciprocity. Time and knowledge are the only valid legal tender.
            </p>

            <div className="bg-[#f6f2f7] p-3 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between font-['Manrope'] text-[11px] text-[#777586]">
                <span>Taught (Skills)</span>
                <span>Learned (Goals)</span>
              </div>
              <div className="relative w-full h-2.5 bg-[#eae7eb] rounded-full overflow-hidden flex">
                <div className="w-1/2 h-full bg-[#006c4a]"></div>
                <div className="w-1/2 h-full bg-[#4338ca]"></div>
              </div>
              <div className="flex justify-between font-['Manrope'] text-[11px] font-bold">
                <span className="text-[#006c4a]">{activeStudent.skills.filter((s) => s.direction === "teach").length} Listed</span>
                <span className="text-[#4338ca]">{activeStudent.skills.filter((s) => s.direction === "learn").length} Listed</span>
              </div>
            </div>
          </div>

          {/* The Reciprocity Code */}
          <div className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4338ca] text-[20px]">menu_book</span>
              <h3 className="font-['Newsreader'] text-xl text-[#1b1b1e]">The Reciprocity Code</h3>
            </div>
            <p className="font-['Manrope'] text-[12px] text-[#777586]">
              Guiding student principles that preserve genuine collegiate mutual scholarship.
            </p>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#e3dfff] text-[#2a14b4] font-['Manrope'] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-bold">1:1 Hour Ratio</h5>
                  <p className="font-['Manrope'] text-[12px] text-[#464554] mt-0.5 leading-snug">
                    Every hour spent receiving instruction is matched by an equal hour of teaching. No student is only a recipient.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#85f8c4] text-[#002114] font-['Manrope'] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-bold">Zero Currency</h5>
                  <p className="font-['Manrope'] text-[12px] text-[#464554] mt-0.5 leading-snug">
                    Pure peer-to-peer barter. Intellectual curiosity and time are our sole forms of exchange.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#f0edf1] text-[#464554] font-['Manrope'] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="font-['Manrope'] text-[13px] text-[#1b1b1e] font-bold">Honest Commitments</h5>
                  <p className="font-['Manrope'] text-[12px] text-[#464554] mt-0.5 leading-snug">
                    Commit thoughtfully and respect your peer's preparation. Mutual scholarship requires mutual reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
