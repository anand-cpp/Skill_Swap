import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Student, StudentSummary } from "../../types";
import { api } from "../../api";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: Student | null;
  targetStudentSummary: StudentSummary | null;
  allStudents: StudentSummary[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  activeStudent,
  targetStudentSummary,
  allStudents,
  onSuccess,
  onError,
}) => {
  const initialTargetId =
    targetStudentSummary?.id ??
    allStudents.find((s) => s.id !== activeStudent?.id)?.id ??
    null;

  const initialTeachId =
    activeStudent?.skills.find((s) => s.direction === "teach")?.id ?? null;
  const initialLearnId =
    activeStudent?.skills.find((s) => s.direction === "learn")?.id ?? null;

  const [targetId, setTargetId] = useState<number | null>(initialTargetId);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);
  const [teachSkillId, setTeachSkillId] = useState<number | null>(initialTeachId);
  const [learnSkillId, setLearnSkillId] = useState<number | null>(initialLearnId);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load target student full profile to show their skills
  useEffect(() => {
    if (!targetId) {
      return;
    }
    let isMounted = true;
    api
      .getStudent(targetId)
      .then((data) => {
        if (isMounted) setTargetStudent(data);
      })
      .catch((err) => {
        console.error("Failed to fetch target student", err);
      });
    return () => {
      isMounted = false;
    };
  }, [targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !targetId || !teachSkillId || !learnSkillId) {
      onError("Please select both a skill you teach and a skill you want to learn.");
      return;
    }

    setSubmitting(true);
    try {
      await api.sendRequest(activeStudent.id, targetId, teachSkillId, learnSkillId);
      onSuccess(`Exchange proposal sent to ${targetStudent?.name || "peer"} successfully.`);
      onClose();
    } catch (err: any) {
      onError(err?.message || "Failed to create exchange request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const teachSkills = activeStudent?.skills?.filter((s) => s.direction === "teach") || [];
  const learnSkills = activeStudent?.skills?.filter((s) => s.direction === "learn") || [];
  const targetTeachSkills = targetStudent?.skills?.filter((s) => s.direction === "teach") || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="proposal-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#c7c4d7]/40 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#c7c4d7]/20 flex items-start justify-between bg-[#fbf8fc]">
            <div>
              <div className="flex items-center gap-1.5 text-[#006c4a] font-['Manrope'] text-[11px] font-bold uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-[16px]">swap_horizontal_circle</span>
                <span>Direct Exchange Proposal</span>
              </div>
              <h3 id="proposal-modal-title" className="font-['Newsreader'] text-2xl text-[#1b1b1e] font-medium leading-tight">
                Propose a Learning Swap
              </h3>
              <p className="font-['Manrope'] text-[13px] text-[#777586] mt-0.5">
                Commit to balanced 1:1 bilateral peer instruction with zero currency barrier.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1 rounded-lg text-[#777586] hover:text-[#1b1b1e] hover:bg-[#eae7eb] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Target Peer Selection */}
            <div>
              <label className="block font-['Manrope'] text-[12px] font-bold text-[#1b1b1e] uppercase tracking-wider mb-1.5">
                Recipient Peer
              </label>
              <select
                value={targetId || ""}
                onChange={(e) => setTargetId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[14px] text-[#1b1b1e] bg-white focus:outline-none focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca]"
              >
                {allStudents
                  .filter((s) => s.id !== activeStudent?.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.college} ({s.teach_count} teach, {s.learn_count} learn)
                    </option>
                  ))}
              </select>
            </div>

            {/* Bilateral Offer Preview Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#f6f2f7] border border-[#c7c4d7]/30">
              {/* What You Offer */}
              <div className="flex flex-col gap-1">
                <span className="font-['Manrope'] text-[11px] font-bold text-[#006c4a] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                  You Offer (Teaching)
                </span>
                {teachSkills.length > 0 ? (
                  <select
                    value={teachSkillId || ""}
                    onChange={(e) => setTeachSkillId(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs font-semibold text-[#1b1b1e] focus:outline-none focus:border-[#006c4a]"
                  >
                    {teachSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category} • {s.level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#ba1a1a] mt-1 font-medium">
                    You have no teaching skills listed! Add skills in Create Profile.
                  </p>
                )}
              </div>

              {/* What You Receive */}
              <div className="flex flex-col gap-1">
                <span className="font-['Manrope'] text-[11px] font-bold text-[#4338ca] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4338ca]"></span>
                  You Receive (Your Goal)
                </span>
                {learnSkills.length > 0 ? (
                  <select
                    value={learnSkillId || ""}
                    onChange={(e) => setLearnSkillId(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs font-semibold text-[#1b1b1e] focus:outline-none focus:border-[#4338ca]"
                  >
                    {learnSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category} • {s.level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#ba1a1a] mt-1 font-medium">
                    You have no learning goals listed! Add skills in Create Profile.
                  </p>
                )}
              </div>
            </div>

            {/* Target Peer Skills Insight */}
            {targetStudent && targetTeachSkills.length > 0 && (
              <div className="p-3 bg-[#e3dfff]/30 rounded-lg border border-[#c3c0ff]/40">
                <span className="font-['Manrope'] text-[11px] font-bold text-[#2a14b4] uppercase tracking-wider block mb-1">
                  Skills {targetStudent.name} can teach:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {targetTeachSkills.map((ts) => {
                    const matchesYourGoal = learnSkills.some(
                      (ls) => ls.name.toLowerCase() === ts.name.toLowerCase()
                    );
                    return (
                      <span
                        key={ts.id}
                        className={`font-['Manrope'] text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                          matchesYourGoal
                            ? "bg-[#85f8c4] text-[#002114] border border-[#006c4a]/30"
                            : "bg-white text-[#464554] border border-[#c7c4d7]/40"
                        }`}
                      >
                        {matchesYourGoal && (
                          <span className="material-symbols-outlined text-[13px] text-[#006c4a]">
                            check_circle
                          </span>
                        )}
                        {ts.name} ({ts.level})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Principles Note */}
            <div className="flex items-start gap-2.5 text-xs text-[#777586] italic">
              <span className="material-symbols-outlined text-[18px] text-[#006c4a] shrink-0 mt-0.5">
                verified
              </span>
              <span>
                Zero token or fee barrier. Once submitted, {targetStudent?.name || "your peer"} will
                see your proposal under their Incoming Exchanges.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#c7c4d7]/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-['Manrope'] text-[13px] font-semibold text-[#464554] hover:bg-[#eae7eb] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  teachSkills.length === 0 ||
                  learnSkills.length === 0 ||
                  !targetId
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4338ca] text-white font-['Manrope'] text-[13px] font-bold hover:bg-[#372abf] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                    <span>Send Formal Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
