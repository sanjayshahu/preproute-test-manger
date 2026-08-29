import {
  useNavigate,
} from "react-router-dom";

import type {
  ComponentName,
  SidebarQuestion,
} from "../types/layout";

import "./TestCreationSidebar.css";


interface TestCreationSidebarProps {
  componentName: ComponentName;

  totalQuestions?: number;

  questions?: SidebarQuestion[];

  activeQuestionId?: string;

  onQuestionClick?: (
    question: SidebarQuestion
  ) => void;

  onNavigate?: (
    componentName: ComponentName
  ) => void;
}


/* ==================================================
   SIDEBAR
================================================== */

export default function TestCreationSidebar({
  componentName,
  totalQuestions = 0,
  questions = [],
  activeQuestionId,
  onQuestionClick,
  onNavigate,
}: TestCreationSidebarProps) {
  const navigate = useNavigate();


  /* ==================================================
     TRACKING FLOW
  ================================================== */

  const isTrackingFlow =
    componentName === "TestTracking" ||
    componentName === "TestPreview" ||
    componentName === "TestConfirmation";


  /* ==================================================
     QUESTIONS VISIBILITY
  ================================================== */

  const shouldShowQuestions =
    componentName === "TestPreview" ||
    componentName === "TestConfirmation";


  /* ==================================================
     NAVIGATION
  ================================================== */

  const handleDashboardClick = () => {
    onNavigate?.("Dashboard");

    navigate("/dashboard");
  };


  const handleTestCreationClick = () => {
    onNavigate?.("CreateTest");

    navigate("/tests/create");
  };


  const handleTrackingClick = () => {
    onNavigate?.("TestTracking");

    navigate("/tests/tracking");
  };


  return (
    <aside className="test-creation-sidebar">

      {/* =========================================
          BRAND
      ========================================== */}

      <div className="sidebar-brand">
        Preproute
      </div>


      {/* =========================================
          NAVIGATION
      ========================================== */}

      <nav className="sidebar-navigation">

        {/* =======================================
            DASHBOARD
        ======================================== */}

        <button
          type="button"
          className={`sidebar-nav-item ${
            componentName === "Dashboard"
              ? "active"
              : ""
          }`}
          onClick={handleDashboardClick}
        >
          <span className="sidebar-nav-icon">
            ▦
          </span>

          <span className="sidebar-nav-label">
            Dashboard
          </span>
        </button>


        {/* =======================================
            TEST CREATION
        ======================================== */}

        <button
          type="button"
          className={`sidebar-nav-item ${
            componentName === "CreateTest"
              ? "active"
              : ""
          }`}
          onClick={handleTestCreationClick}
        >
          <span className="sidebar-nav-icon">
            ＋
          </span>

          <span className="sidebar-nav-label">
            Test Creation
          </span>
        </button>


        {/* =======================================
            TEST TRACKING
        ======================================== */}

        <button
          type="button"
          className={`sidebar-nav-item ${
            isTrackingFlow
              ? "active"
              : ""
          }`}
          onClick={handleTrackingClick}
        >
          <span className="sidebar-nav-icon">
            ◷
          </span>

          <span className="sidebar-nav-label">
            Test Tracking
          </span>
        </button>

      </nav>


      {/* =========================================
          QUESTIONS
      ========================================== */}

      {shouldShowQuestions && (
        <section className="sidebar-questions">

          <div className="sidebar-questions-header">

            <span>
              Questions
            </span>

            <span className="sidebar-question-count">
              {totalQuestions ||
                questions.length}
            </span>

          </div>


          <div className="sidebar-question-list">

            {questions.length > 0 ? (
              questions.map(
                (question, index) => {

                  const isActive =
                    activeQuestionId ===
                    question.id;

                  return (
                    <button
                      type="button"
                      key={question.id}
                      className={`sidebar-question-item ${
                        isActive
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        onQuestionClick?.(
                          question
                        )
                      }
                    >

                      <span className="sidebar-question-number">
                        {index + 1}
                      </span>


                      <span className="sidebar-question-label">
                        {question.label}
                      </span>


                      {question.status && (
                        <span
                          className={`sidebar-question-status ${question.status}`}
                        >
                          {question.status}
                        </span>
                      )}

                    </button>
                  );
                }
              )
            ) : (
              <div className="sidebar-no-questions">
                No questions available
              </div>
            )}

          </div>

        </section>
      )}

    </aside>
  );
}