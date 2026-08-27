import { type FormEvent, useState } from "react";

import AppLayout from "../components/AppLayout";
import type { SidebarQuestion } from "../components/TestCreationSidebar";
import { getCurrentUser } from "../utils/auth";

import "./TestConfirmation.css";

export type TestConfirmationData = {
  testType?: string;
  chapterName?: string;
  difficulty?: string;
  subject?: string;
  topic?: string;
  subTopic?: string;
  duration?: string;
  totalQuestions?: number | string;
  totalMarks?: number | string;
};

export type TestConfirmationProps = {
  test?: TestConfirmationData;
  questions?: SidebarQuestion[];
  activeQuestionId?: string;
  totalQuestions?: number;
  onQuestionClick?: (
    question: SidebarQuestion
  ) => void;
  onPublishNow?: () => void;
  onConfirm?: (data: {
    availability: string;
    endDate: string;
    endTime: string;
  }) => void;
  onCancel?: () => void;
  className?: string;
};

const defaultTest: TestConfirmationData = {
  testType: "Chapter Wise",
  chapterName: "Chapter 1",
  difficulty: "Easy",
  subject: "English",
  topic: "Grammar, Writing",
  subTopic: "Application",
  duration: "60 Min",
  totalQuestions: 50,
  totalMarks: 250,
};

export default function TestConfirmation({
  test = defaultTest,
  questions,
  activeQuestionId,
  totalQuestions = 50,
  onQuestionClick,
  onPublishNow,
  onConfirm,
  onCancel,
  className = "",
}: TestConfirmationProps) {
  const user = getCurrentUser();
  const [availability, setAvailability] =
    useState("custom");

  const [endDate, setEndDate] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const data = {
    ...defaultTest,
    ...test,
  };

  const submit = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onConfirm?.({
      availability,
      endDate,
      endTime,
    });
  };

  return (
    <AppLayout
      componentName="TestConfirmation"
      questions={questions}
      totalQuestions={totalQuestions}
      activeQuestionId={activeQuestionId}
      onQuestionClick={onQuestionClick}
    >
      <div
        className={`test-confirmation-page ${className}`.trim()}
      >
        <main className="test-confirmation-main">

          <header className="confirmation-topbar">

            <div className="confirmation-breadcrumb">
              Test creation
            </div>

            <div className="confirmation-profile">

              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
              >
                ♧
              </button>

              
<div
  className="profile-avatar"
  aria-hidden="true"
>
  {user?.name?.charAt(0).toUpperCase() || "U"}
</div>

<div className="profile-copy">
  <strong>
    {user?.name || "User"}
  </strong>

  <span>
    {user?.role
      ? user.role.charAt(0).toUpperCase() +
        user.role.slice(1)
      : "User"}
  </span>
</div>



            

              <span className="profile-chevron">
                ⌄
              </span>

            </div>

          </header>

          <section className="confirmation-content">

            <div className="confirmation-heading">

              <h1>
                Test created
              </h1>

              <div className="completion-pill">

                <span className="completion-dot">
                  ✓
                </span>

                All {data.totalQuestions} Questions done

              </div>

            </div>

            <section className="test-summary-card">

              <button
                type="button"
                className="summary-edit-button"
                aria-label="Edit test"
                onClick={onCancel}
              >
                ✎
              </button>

              <div className="summary-top-row">

                <span className="summary-type-badge">
                  {data.testType}
                </span>

                <div className="summary-chapter">

                  <span className="chapter-icon">
                    ◒
                  </span>

                  <strong>
                    {data.chapterName}
                  </strong>

                  <span className="summary-difficulty">
                    {data.difficulty}
                  </span>

                </div>

              </div>

              <div className="summary-details">

                <div className="summary-detail-row">

                  <span className="summary-label">
                    Subject
                  </span>

                  <span className="summary-separator">
                    :
                  </span>

                  <span className="summary-value">
                    {data.subject}
                  </span>

                </div>

                <div className="summary-detail-row">

                  <span className="summary-label">
                    Topic
                  </span>

                  <span className="summary-separator">
                    :
                  </span>

                  <div className="summary-tags">

                    {(data.topic ?? "")
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((x) => (
                        <span
                          className="topic-tag"
                          key={x}
                        >
                          {x}
                        </span>
                      ))}

                  </div>

                </div>

                <div className="summary-detail-row">

                  <span className="summary-label">
                    Sub Topic
                  </span>

                  <span className="summary-separator">
                    :
                  </span>

                  <div className="summary-tags">

                    {(data.subTopic ?? "")
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((x) => (
                        <span
                          className="subtopic-tag"
                          key={x}
                        >
                          {x}
                        </span>
                      ))}

                  </div>

                </div>

              </div>

              <div className="summary-stats">

                <span>
                  ◷ {data.duration}
                </span>

                <span>
                  ▤ {data.totalQuestions} Q's
                </span>

                <span>
                  ▣ {data.totalMarks} Marks
                </span>

              </div>

            </section>

            <div className="publish-switch">

              <button
                type="button"
                className={`publish-tab ${
                  availability === "now"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setAvailability("now");
                  onPublishNow?.();
                }}
              >
                Publish Now
              </button>

              <button
                type="button"
                className={`publish-tab ${
                  availability === "custom"
                    ? "active-schedule"
                    : ""
                }`}
                onClick={() =>
                  setAvailability("custom")
                }
              >
                Schedule Publish
              </button>

            </div>

            <form
              className="availability-form"
              onSubmit={submit}
            >

              <div className="availability-heading">

                <h2>
                  Live Until
                </h2>

                <p>
                  Choose how long this test should remain
                  available on the platform.
                </p>

              </div>

              <div className="availability-options">

                {[
                  [
                    "always",
                    "Always Available",
                  ],
                  [
                    "3-weeks",
                    "3 Weeks",
                  ],
                  [
                    "1-week",
                    "1 Week",
                  ],
                  [
                    "1-month",
                    "1 Month",
                  ],
                  [
                    "2-weeks",
                    "2 Weeks",
                  ],
                  [
                    "custom",
                    "Custom Duration",
                  ],
                ].map(
                  ([value, label]) => (
                    <label
                      className="availability-option"
                      key={value}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={value}
                        checked={
                          availability ===
                          value
                        }
                        onChange={(e) =>
                          setAvailability(
                            e.target.value
                          )
                        }
                      />

                      <span>
                        {label}
                      </span>
                    </label>
                  )
                )}

              </div>

              <div className="custom-duration-fields">

                <div className="confirmation-input-wrap">

                  <input
                    type="date"
                    aria-label="Select end date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                    disabled={
                      availability !==
                      "custom"
                    }
                  />

                </div>

                <div className="confirmation-input-wrap">

                  <select
                    aria-label="Select end time"
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(
                        e.target.value
                      )
                    }
                    disabled={
                      availability !==
                      "custom"
                    }
                  >
                    <option value="">
                      Select End Time
                    </option>

                    <option value="09:00">
                      09:00 AM
                    </option>

                    <option value="12:00">
                      12:00 PM
                    </option>

                    <option value="15:00">
                      03:00 PM
                    </option>

                    <option value="18:00">
                      06:00 PM
                    </option>

                    <option value="21:00">
                      09:00 PM
                    </option>

                  </select>

                </div>

              </div>

              <div className="confirmation-actions">

                <button
                  type="button"
                  className="confirmation-cancel-button"
                  onClick={onCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="confirmation-confirm-button"
                >
                  Confirm
                </button>

              </div>

            </form>

          </section>

        </main>
      </div>
    </AppLayout>
  );
}