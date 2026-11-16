import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Student } from "../../types";
import { api } from "../../api";

interface CreateProfileViewProps {
  onProfileCreated: (student: Student) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

interface DraftSkill {
  id: string;
  name: string;
  category: string;
  direction: "teach" | "learn";
  level: "beginner" | "intermediate" | "expert";
}

export const CreateProfileView: React.FC<CreateProfileViewProps> = ({
  onProfileCreated,
  onToast,
}) => {
  // Context fields
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [bio, setBio] = useState("");

  // Skills
  const [skills, setSkills] = useState<DraftSkill[]>([
    {
      id: "1",
      name: "Python Programming",
      category: "Engineering",
      direction: "teach",
      level: "expert",
    },
    {
      id: "2",
      name: "Acoustic Guitar",
      category: "Music",
      direction: "learn",
      level: "beginner",
    },
  ]);

  // Skill inputs
  const [teachInputName, setTeachInputName] = useState("");
  const [teachCategory, setTeachCategory] = useState("Engineering");
  const [teachLevel, setTeachLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");

  const [learnInputName, setLearnInputName] = useState("");
  const [learnCategory, setLearnCategory] = useState("Design");
  const [learnLevel, setLearnLevel] = useState<"beginner" | "intermediate" | "expert">("beginner");

  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "Engineering",
    "Design",
    "Music",
    "Business",
    "Science",
    "Languages",
    "Humanities",
    "Other",
  ];

  const teachSkills = skills.filter((s) => s.direction === "teach");
  const learnSkills = skills.filter((s) => s.direction === "learn");

  const handleAddTeachSkill = () => {
    if (!teachInputName.trim()) {
      onToast("Please enter a skill name to teach.", "error");
      return;
    }
    const newSkill: DraftSkill = {
      id: Date.now().toString(),
      name: teachInputName.trim(),
      category: teachCategory,
      direction: "teach",
      level: teachLevel,
    };
    setSkills([...skills, newSkill]);
    setTeachInputName("");
  };

  const handleAddLearnSkill = () => {
    if (!learnInputName.trim()) {
      onToast("Please enter a skill you want to learn.", "error");
      return;
    }
    const newSkill: DraftSkill = {
      id: Date.now().toString(),
      name: learnInputName.trim(),
      category: learnCategory,
      direction: "learn",
      level: learnLevel,
    };
    setSkills([...skills, newSkill]);
    setLearnInputName("");
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast("Please provide your full student name.", "error");
      return;
    }
    if (!college.trim()) {
      onToast("Please provide your college or affiliation.", "error");
      return;
    }
    if (teachSkills.length === 0) {
      onToast("Please add at least one skill you can teach.", "error");
      return;
    }
    if (learnSkills.length === 0) {
      onToast("Please add at least one skill you want to learn.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        college: college.trim(),
        bio: bio.trim(),
        skills: skills.map((s) => ({
          name: s.name,
          category: s.category,
          direction: s.direction,
          level: s.level,
        })),
      };

      const newStudent = await api.createStudent(payload);
      onToast(`Student profile for "${newStudent.name}" created successfully!`, "success");
      onProfileCreated(newStudent);
    } catch (err: any) {
      onToast(err?.message || "Failed to create student profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Parity bar calculation
  const totalSkills = teachSkills.length + learnSkills.length;
  const teachPercent = totalSkills > 0 ? (teachSkills.length / totalSkills) * 100 : 50;
  const learnPercent = totalSkills > 0 ? (learnSkills.length / totalSkills) * 100 : 50;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Overview */}
      <div className="relative overflow-hidden bg-[#f6f2f7] rounded-2xl p-6 sm:p-10 border border-[#c7c4d7]/30 shadow-xs">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#eae7eb] px-3 py-1 rounded-full mb-3">
              <span className="material-symbols-outlined text-[16px] text-[#4338ca]">auto_awesome</span>
              <span className="font-['Manrope'] text-[11px] text-[#464554] uppercase tracking-wider font-bold">
                Intellectual Dossier • Live Sync
              </span>
            </div>
            <h1 className="font-['Newsreader'] text-3xl sm:text-4xl lg:text-5xl text-[#1b1b1e] tracking-tight leading-tight font-normal">
              Your skills have value. <span className="italic text-[#4338ca]">Share them.</span>
            </h1>
            <p className="font-['Manrope'] text-[14px] text-[#464554] mt-3 leading-relaxed">
              Tell the student network what you are confident teaching, and what crafts you yearn to learn. Every exchange is built on mutual respect and shared curiosity.
            </p>
          </div>

          {/* 1:1 Parity Meter */}
          <div className="bg-white p-4 rounded-xl border border-[#c7c4d7]/40 shadow-xs min-w-[260px] self-start md:self-auto">
            <div className="flex items-center justify-between text-[#1b1b1e] mb-1.5">
              <span className="font-['Manrope'] text-[11px] text-[#777586] uppercase font-bold tracking-wider">
                Equitable Barter
              </span>
              <span className="font-['Manrope'] text-[11px] bg-[#85f8c4]/40 text-[#002114] px-2 py-0.5 rounded-full font-bold">
                {teachSkills.length === learnSkills.length ? "1 : 1 Parity Met" : "Balanced Matrix"}
              </span>
            </div>
            <div className="relative h-2.5 w-full bg-[#eae7eb] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#006c4a] transition-all duration-300"
                style={{ width: `${teachPercent}%` }}
              ></div>
              <div
                className="h-full bg-[#4338ca] transition-all duration-300"
                style={{ width: `${learnPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 font-['Manrope'] text-[12px]">
              <span className="text-[#006c4a] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">school</span>
                {teachSkills.length} Offered
              </span>
              <span className="text-[#777586]">↔</span>
              <span className="text-[#4338ca] font-bold flex items-center gap-1">
                {learnSkills.length} Sought
                <span className="material-symbols-outlined text-[14px]">psychology</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* Part 01: Academic & Personal Context */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#c7c4d7]/40 shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <span className="font-['Manrope'] text-[11px] text-[#4338ca] uppercase font-bold tracking-widest">
                Part 01
              </span>
              <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e] mt-0.5">
                Academic & Personal Context
              </h2>
              <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">
                Introduces your intellectual grounding and collegiate working style to prospective peer matches.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f6f2f7] px-3 py-1 rounded-full text-[#464554] font-['Manrope'] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px] text-[#006c4a]">verified_user</span>
              <span>Local REST Identity</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-['Manrope'] text-[12px] font-bold text-[#1b1b1e] uppercase tracking-wider mb-1.5">
                Full Display Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Sharma, Priya Patel"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[14px] text-[#1b1b1e] focus:outline-none focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca]"
              />
            </div>

            <div>
              <label className="block font-['Manrope'] text-[12px] font-bold text-[#1b1b1e] uppercase tracking-wider mb-1.5">
                Institution / Campus <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. IIT Bombay, BITS Pilani, Stanford"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[14px] text-[#1b1b1e] focus:outline-none focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca]"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-['Manrope'] text-[12px] font-bold text-[#1b1b1e] uppercase tracking-wider">
                  Bio & Intellectual Curiosity
                </label>
                <span className="font-['Manrope'] text-[11px] text-[#777586]">
                  {bio.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your focus, major, and what drives your curiosity (e.g. 'Systems programming enthusiast eager to trade backend techniques for acoustic guitar theory')."
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[14px] text-[#1b1b1e] focus:outline-none focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca]"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Skills Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Part 02: What I Can Teach (Emerald) */}
          <section className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d7]/20">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#85f8c4]/50 flex items-center justify-center text-[#006c4a]">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                </span>
                <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">What I Can Teach</h2>
              </div>
              <span className="bg-[#85f8c4]/40 text-[#002114] font-['Manrope'] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {teachSkills.length} Active Offers
              </span>
            </div>

            <p className="font-['Manrope'] text-[13px] text-[#464554]">
              What subjects, libraries, instruments, or crafts can you patiently guide someone through?
            </p>

            {/* Input row */}
            <div className="bg-[#f6f2f7] p-3.5 rounded-xl border border-[#c7c4d7]/30 flex flex-col gap-3">
              <input
                type="text"
                value={teachInputName}
                onChange={(e) => setTeachInputName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTeachSkill();
                  }
                }}
                placeholder="Skill name (e.g. Python, Docker, FastAPIs)..."
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[13px] text-[#1b1b1e] focus:outline-none focus:border-[#006c4a]"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-['Manrope'] font-bold uppercase text-[#777586] mb-1">
                    Category
                  </label>
                  <select
                    value={teachCategory}
                    onChange={(e) => setTeachCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs text-[#1b1b1e] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-['Manrope'] font-bold uppercase text-[#777586] mb-1">
                    Proficiency Level
                  </label>
                  <select
                    value={teachLevel}
                    onChange={(e) => setTeachLevel(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs text-[#1b1b1e] focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Advanced / Expert</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTeachSkill}
                className="w-full py-2 px-3 rounded-lg bg-[#006c4a] text-white font-['Manrope'] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#005137] transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add Skill I Can Teach</span>
              </button>
            </div>

            {/* List of skills */}
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {teachSkills.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-white border border-[#006c4a]/30 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#006c4a] shrink-0"></span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e] truncate">
                          {s.name}
                        </span>
                        <span className="font-['Manrope'] text-[11px] text-[#777586]">
                          {s.category} • {s.level}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.id)}
                      className="text-[#777586] hover:text-[#ba1a1a] p-1 transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Part 03: What I Want to Learn (Indigo) */}
          <section className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d7]/20">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#e3dfff] flex items-center justify-center text-[#2a14b4]">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </span>
                <h2 className="font-['Newsreader'] text-2xl text-[#1b1b1e]">What I Want to Learn</h2>
              </div>
              <span className="bg-[#e3dfff] text-[#2a14b4] font-['Manrope'] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {learnSkills.length} Desired Goals
              </span>
            </div>

            <p className="font-['Manrope'] text-[13px] text-[#464554]">
              What skills are on your wishlist? Be specific so the network finds the ideal reciprocal match.
            </p>

            {/* Input row */}
            <div className="bg-[#f6f2f7] p-3.5 rounded-xl border border-[#c7c4d7]/30 flex flex-col gap-3">
              <input
                type="text"
                value={learnInputName}
                onChange={(e) => setLearnInputName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLearnSkill();
                  }
                }}
                placeholder="Skill wishlist (e.g. Acoustic Guitar, Figma, Spanish)..."
                className="w-full px-3 py-2 bg-white rounded-lg border border-[#c7c4d7]/50 font-['Manrope'] text-[13px] text-[#1b1b1e] focus:outline-none focus:border-[#4338ca]"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-['Manrope'] font-bold uppercase text-[#777586] mb-1">
                    Category
                  </label>
                  <select
                    value={learnCategory}
                    onChange={(e) => setLearnCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs text-[#1b1b1e] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-['Manrope'] font-bold uppercase text-[#777586] mb-1">
                    Target Goal Level
                  </label>
                  <select
                    value={learnLevel}
                    onChange={(e) => setLearnLevel(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#c7c4d7]/50 text-xs text-[#1b1b1e] focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLearnSkill}
                className="w-full py-2 px-3 rounded-lg bg-[#4338ca] text-white font-['Manrope'] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#372abf] transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add Skill I Want to Learn</span>
              </button>
            </div>

            {/* List of skills */}
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {learnSkills.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-white border border-[#4338ca]/30 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#4338ca] shrink-0"></span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-['Manrope'] text-[13px] font-bold text-[#1b1b1e] truncate">
                          {s.name}
                        </span>
                        <span className="font-['Manrope'] text-[11px] text-[#777586]">
                          {s.category} • {s.level} goal
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.id)}
                      className="text-[#777586] hover:text-[#ba1a1a] p-1 transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <footer className="bg-white rounded-2xl p-6 border border-[#c7c4d7]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#777586] text-[13px] font-['Manrope']">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">lock</span>
            <p>
              Stored locally for your browser session via{" "}
              <strong className="text-[#1b1b1e]">FastAPI REST</strong>. Zero cookies, zero corporate tracking.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#4338ca] text-white font-['Manrope'] text-[14px] font-bold hover:bg-[#372abf] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {submitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Save Profile & Explore Matches</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};
