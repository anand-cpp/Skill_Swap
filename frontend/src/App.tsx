import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { api } from "./api";
import type { Student, StudentSummary, Match, Cycle, ExchangeRequest } from "./types";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { DiscoverView } from "./components/discover/DiscoverView";
import { MatchesView } from "./components/matches/MatchesView";
import { CreateProfileView } from "./components/profile/CreateProfileView";
import { ExchangesView } from "./components/exchanges/ExchangesView";
import { ProposalModal } from "./components/modals/ProposalModal";
import { Toast, type ToastState } from "./components/ui/Toast";

export function App() {
  const [currentView, setCurrentView] = useState<"discover" | "matches" | "create-profile" | "my-exchanges">("discover");
  const [allStudents, setAllStudents] = useState<StudentSummary[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Match and cycle data
  const [matches, setMatches] = useState<Match[]>([]);
  const [mutualCount, setMutualCount] = useState<number>(0);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [proposalTarget, setProposalTarget] = useState<StudentSummary | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  // 1. Initial students directory loading
  useEffect(() => {
    let isMounted = true;
    api
      .listStudents()
      .then((list) => {
        if (!isMounted) return;
        setAllStudents(list);
        if (list.length > 0) {
          setActiveStudentId((prev) => {
            if (!prev || !list.some((s) => s.id === prev)) {
              return list[0].id;
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        if (isMounted) {
          showToast("Unable to reach SkillSwap API. Ensure backend is running.", "error");
        }
      })
      .finally(() => {
        if (isMounted) {
          setInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const loadStudents = useCallback(
    async (selectId?: number) => {
      try {
        const list = await api.listStudents();
        setAllStudents(list);

        if (list.length > 0) {
          if (selectId) {
            setActiveStudentId(selectId);
          } else {
            setActiveStudentId((prev) => {
              if (!prev || !list.some((s) => s.id === prev)) {
                return list[0].id;
              }
              return prev;
            });
          }
        }
      } catch (err: any) {
        console.error("Failed to load students:", err);
        showToast("Unable to reach SkillSwap API. Ensure backend is running.", "error");
      } finally {
        setInitialLoading(false);
      }
    },
    [showToast]
  );

  // 2. Load active student full profile, matches, cycles, and requests
  const refreshActiveStudentData = useCallback(async (id: number) => {
    try {
      const [studentData, matchesData, cyclesData, requestsData] = await Promise.all([
        api.getStudent(id),
        api.matches(id).catch(() => ({ student_id: id, matches: [], mutual_count: 0 })),
        api.cycles(id).catch(() => ({ student_id: id, cycles: [], cycle_count: 0 })),
        api.requests(id).catch(() => ({ requests: [] })),
      ]);

      setActiveStudent(studentData);
      setMatches(matchesData.matches);
      setMutualCount(matchesData.mutual_count);
      setCycles(cyclesData.cycles);
      setRequests(requestsData.requests);
    } catch (err: any) {
      console.error("Failed to load active student data:", err);
    }
  }, []);

  useEffect(() => {
    if (activeStudentId === null) return;
    let isMounted = true;

    Promise.all([
      api.getStudent(activeStudentId),
      api.matches(activeStudentId).catch(() => ({ student_id: activeStudentId, matches: [], mutual_count: 0 })),
      api.cycles(activeStudentId).catch(() => ({ student_id: activeStudentId, cycles: [], cycle_count: 0 })),
      api.requests(activeStudentId).catch(() => ({ requests: [] })),
    ])
      .then(([studentData, matchesData, cyclesData, requestsData]) => {
        if (!isMounted) return;
        setActiveStudent(studentData);
        setMatches(matchesData.matches);
        setMutualCount(matchesData.mutual_count);
        setCycles(cyclesData.cycles);
        setRequests(requestsData.requests);
      })
      .catch((err) => {
        console.error("Failed to load active student data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeStudentId]);

  // Handle student selection change
  const handleSelectStudent = (id: number) => {
    setActiveStudentId(id);
    const s = allStudents.find((st) => st.id === id);
    if (s) {
      showToast(`Active student context switched to ${s.name}`, "info");
    }
  };

  // Open proposal modal targeting a specific student
  const handleOpenProposalWithTarget = (student: StudentSummary) => {
    setProposalTarget(student);
    setIsProposalOpen(true);
  };

  // Open generic proposal modal
  const handleOpenGenericProposal = () => {
    setProposalTarget(null);
    setIsProposalOpen(true);
  };

  // Handle request actions (accept, reject, complete)
  const handleDecideRequest = async (
    requestId: number,
    action: "accept" | "reject" | "complete"
  ) => {
    await api.decide(requestId, action);
    if (activeStudentId !== null) {
      refreshActiveStudentData(activeStudentId);
    }
  };

  // Handle newly created student
  const handleProfileCreated = (newStudent: Student) => {
    loadStudents(newStudent.id);
    setCurrentView("matches");
  };

  // Calculate pending incoming requests for badge
  const pendingIncomingCount = activeStudent
    ? requests.filter((r) => r.receiver_id === activeStudent.id && r.status === "pending").length
    : 0;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8fc] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#4338ca] text-white flex items-center justify-center font-['Newsreader'] text-2xl font-bold mb-4 shadow-sm animate-pulse">
          §
        </div>
        <div className="font-['Newsreader'] text-2xl text-[#1b1b1e]">Loading SkillSwap...</div>
        <p className="font-['Manrope'] text-[13px] text-[#777586] mt-1">Connecting to academic barter clearinghouse</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8fc] text-[#1b1b1e] font-['Manrope'] selection:bg-[#e3dfff] selection:text-[#2a14b4]">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        activeStudent={activeStudent}
        students={allStudents}
        onSelectStudent={handleSelectStudent}
        mutualCount={mutualCount}
        pendingCount={pendingIncomingCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          mutualCount={mutualCount}
          onOpenProposal={handleOpenGenericProposal}
        />

        {/* View Content with Apple-Quality Animated Transition */}
        <main className="flex-1 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {currentView === "discover" && (
                <DiscoverView
                  activeStudent={activeStudent}
                  allStudents={allStudents}
                  matches={matches}
                  onOpenProposalWithTarget={handleOpenProposalWithTarget}
                  onNavigateToMatches={() => setCurrentView("matches")}
                  searchQuery={searchQuery}
                />
              )}

              {currentView === "matches" && (
                <MatchesView
                  activeStudent={activeStudent}
                  matches={matches}
                  cycles={cycles}
                  onOpenProposalWithTarget={handleOpenProposalWithTarget}
                  allStudents={allStudents}
                />
              )}

              {currentView === "create-profile" && (
                <CreateProfileView
                  onProfileCreated={handleProfileCreated}
                  onToast={showToast}
                />
              )}

              {currentView === "my-exchanges" && (
                <ExchangesView
                  activeStudent={activeStudent}
                  requests={requests}
                  onDecide={handleDecideRequest}
                  onNavigateToDiscover={() => setCurrentView("discover")}
                  onToast={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Proposal Modal */}
      {isProposalOpen && (
        <ProposalModal
          isOpen={isProposalOpen}
          onClose={() => {
            setIsProposalOpen(false);
            setProposalTarget(null);
          }}
          activeStudent={activeStudent}
          targetStudentSummary={proposalTarget}
          allStudents={allStudents}
          onSuccess={(msg) => {
            showToast(msg, "success");
            if (activeStudentId !== null) {
              refreshActiveStudentData(activeStudentId);
            }
          }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </div>
  );
}

export default App;
