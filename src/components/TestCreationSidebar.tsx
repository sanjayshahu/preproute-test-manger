
import "./TestCreationSidebar.css";

export type SidebarQuestion = {
  id: string;
  label: string;
  status?: "complete" | "active" | "pending";
};

export type SidebarComponent =
  | "Dashboard"
  | "CreateTest"
  | "TestTracking"
  | "TestConfirmation"
  | "TestPreview";

export type TestCreationSidebarProps = {
  questions?: SidebarQuestion[];
  totalQuestions?: number;
  activeQuestionId?: string;
  onQuestionClick?: (question: SidebarQuestion) => void;
  componentName: SidebarComponent;
  onNavigate?: (componentName: SidebarComponent) => void;
  className?: string;
};

const defaultQuestions: SidebarQuestion[] = [
  { id: "question-1", label: "Question 1", status: "complete" },
  { id: "question-2", label: "Question 2", status: "complete" },
  { id: "question-3", label: "Question 3", status: "complete" },
  { id: "question-4", label: "Question 4", status: "complete" },
  { id: "question-5", label: "Question 5", status: "complete" },
  { id: "question-6", label: "Question 6", status: "complete" },
];

export default function TestCreationSidebar({
  questions = defaultQuestions,
  totalQuestions = 50,
  activeQuestionId,
  onQuestionClick,
  componentName,
  onNavigate,
  className = "",
}: TestCreationSidebarProps) {
  const renderComponentSpecificUI = () => {
    switch (componentName) {
      case "TestConfirmation":
      case "TestPreview":
        return (
          <>
            <div className="sidebar-divider" />

            <nav
              className="sidebar-question-nav"
              aria-label="Question creation"
            >
              <div className="sidebar-nav-item sidebar-question-creation">
                <span
                  className="sidebar-nav-icon"
                  aria-hidden="true"
                >
                  ✎
                </span>

                <span>Question creation</span>

                <span
                  className="sidebar-collapse-icon"
                  aria-hidden="true"
                >
                  ‹
                </span>
              </div>

              <div className="sidebar-total">
                <span
                  className="sidebar-total-icon"
                  aria-hidden="true"
                >
                  ▤
                </span>

                <span>
                  Total Questions · {totalQuestions}
                </span>
              </div>

              <div className="sidebar-question-list">
                {questions.map((question) => {
                  const isActive =
                    question.id === activeQuestionId;

                  const isComplete =
                    question.status === "complete" || isActive;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={[
                        "sidebar-question",
                        isActive ? "is-active" : "",
                        question.status === "pending"
                          ? "is-pending"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        onQuestionClick?.(question)
                      }
                    >
                      <span
                        className={[
                          "sidebar-question-status",
                          isComplete ? "is-complete" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isComplete ? "✓" : ""}
                      </span>

                      <span className="sidebar-question-label">
                        {question.label}
                      </span>

                      <span
                        className="sidebar-question-arrow"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </>
        );

      case "Dashboard":
      case "CreateTest":
      case "TestTracking":
      default:
        return null;
    }
  };

  /*
   * TestConfirmation and TestPreview are part
   * of the Test Creation flow, so Test Creation
   * remains highlighted on those screens.
   */
  const isTestCreation =
    componentName === "CreateTest" ||
    componentName === "TestConfirmation" ||
    componentName === "TestPreview";

  return (
    <aside
      className={`test-creation-sidebar ${className}`.trim()}
    >
      {/* Brand */}

    <div className="sidebar-header">
  <div className="sidebar-brand">
    <img
      src="/assets/preproute-logo.png"
      alt="PrepRoute"
      className="sidebar-logo"
    />
  </div>
</div>

      <div className="sidebar-divider" />

      {/* Main navigation */}

      <nav
        className="sidebar-nav"
        aria-label="Main navigation"
      >
        {/* Dashboard */}

        <button
          type="button"
          className={[
            "sidebar-nav-item",
            componentName === "Dashboard"
              ? "is-active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            onNavigate?.("Dashboard")
          }
        >
          <span
            className="sidebar-nav-icon"
            aria-hidden="true"
          >
            ⌂
          </span>

          <span>Dashboard</span>
        </button>

        {/* Test Creation */}

        <button
          type="button"
          className={[
            "sidebar-nav-item",
            isTestCreation
              ? "is-active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            onNavigate?.("CreateTest")
          }
        >
          <span
            className="sidebar-nav-icon"
            aria-hidden="true"
          >
            ✎
          </span>

          <span>Test Creation</span>
        </button>

        {/* Test Tracking */}

        <button
          type="button"
          className={[
            "sidebar-nav-item",
            componentName === "TestTracking"
              ? "is-active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            onNavigate?.("TestTracking")
          }
        >
          <span
            className="sidebar-nav-icon"
            aria-hidden="true"
          >
            ◴
          </span>

          <span>Test Tracking</span>
        </button>
      </nav>

      {/* Component-specific UI */}

      {renderComponentSpecificUI()}
    </aside>
  );
}