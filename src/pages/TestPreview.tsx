import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTestById, updateTest } from "../api/tests";
import { fetchQuestionsBulk } from "../api/questions";

import type { Test } from "../types/test";

import AppLayout from "../components/AppLayout";

import "./TestPreview.css";

interface PreviewQuestion {
  id: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string | null;
  difficulty?: string | null;
  subject?: string | null;
  test_id?: string;
}

export default function TestPreview() {
  const { testId } = useParams<{
    testId: string;
  }>();

  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);

  const [questions, setQuestions] = useState<
    PreviewQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [publishing, setPublishing] =
    useState(false);

  /*
   * ==========================================
   * LOAD TEST + QUESTIONS
   * ==========================================
   */

  useEffect(() => {
    if (!testId) {
      setError("Test ID is missing.");
      setLoading(false);
      return;
    }

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "PREVIEW TEST ID:",
          testId
        );

        /*
         * --------------------------------------
         * 1. GET TEST
         * --------------------------------------
         */

        const testData =
          await getTestById(testId);

        console.log(
          "TEST PREVIEW DATA:",
          testData
        );

        if (!testData) {
          throw new Error(
            "Test was not found."
          );
        }

        setTest(testData);

        /*
         * --------------------------------------
         * 2. GET QUESTION IDS
         * --------------------------------------
         *
         * We only use test.questions to tell
         * the API which questions belong to
         * this test.
         *
         * IMPORTANT:
         *
         * We DO NOT use test.questions to
         * reorder the final result.
         */

        const questionIds =
          Array.isArray(testData.questions)
            ? testData.questions
            : [];

        console.log(
          "QUESTION IDS FROM TEST:",
          questionIds
        );

        /*
         * No questions.
         */

        if (questionIds.length === 0) {
          setQuestions([]);
          return;
        }

        /*
         * --------------------------------------
         * 3. FETCH QUESTIONS
         * --------------------------------------
         *
         * fetchQuestionsBulk() is already
         * returning the questions in the
         * correct order.
         *
         * We preserve that order.
         */

        const questionData =
          await fetchQuestionsBulk(
            questionIds
          );

        console.log(
          "QUESTIONS RETURNED BY API:",
          questionData
        );

        if (!Array.isArray(questionData)) {
          setQuestions([]);
          return;
        }

        /*
         * --------------------------------------
         * 4. NORMALIZE QUESTIONS
         * --------------------------------------
         *
         * IMPORTANT:
         *
         * Do not sort.
         * Do not reverse.
         * Do not rebuild using test.questions.
         *
         * The array order returned from
         * fetchQuestionsBulk() is preserved.
         */

        const normalizedQuestions: PreviewQuestion[] =
          questionData
            .filter(
              (question: any) =>
                question &&
                question.id
            )
            .map(
              (question: any) => ({
                id: String(
                  question.id
                ),

                type:
                  question.type ||
                  "mcq",

                question:
                  question.question ||
                  "",

                option1:
                  question.option1 ||
                  "",

                option2:
                  question.option2 ||
                  "",

                option3:
                  question.option3 ||
                  "",

                option4:
                  question.option4 ||
                  "",

                correct_option:
                  question.correct_option ||
                  "option1",

                explanation:
                  question.explanation ??
                  "",

                difficulty:
                  question.difficulty ||
                  "medium",

                subject:
                  question.subject ||
                  testData.subject ||
                  "",

                test_id:
                  question.test_id ||
                  testId,
              })
            );

        /*
         * --------------------------------------
         * 5. KEEP API RESPONSE ORDER
         * --------------------------------------
         */

        console.log(
          "FINAL PREVIEW ORDER:",
          normalizedQuestions.map(
            (question, index) => ({
              number: index + 1,
              id: question.id,
              question:
                question.question,
            })
          )
        );

        setQuestions(
          normalizedQuestions
        );
      } catch (error: any) {
        console.error(
          "TEST PREVIEW ERROR:",
          error
        );

        console.error(
          "SERVER RESPONSE:",
          error?.response?.data
        );

        console.error(
          "STATUS:",
          error?.response?.status
        );

        console.error(
          "URL:",
          error?.config?.url
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load test preview."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [testId]);

  /*
   * ==========================================
   * BACK
   * ==========================================
   */

  const handleBack = () => {
    navigate("/dashboard");
  };

  /*
   * ==========================================
   * EDIT TEST
   * ==========================================
   */

  const handleEditTest = () => {
    if (!testId) {
      return;
    }

    navigate(
      `/tests/${testId}/edit`
    );
  };

  /*
   * ==========================================
   * EDIT QUESTIONS
   * ==========================================
   */

  const handleEditQuestions = () => {
    if (!testId) {
      return;
    }

    navigate(
      `/tests/${testId}/questions`
    );
  };

  /*
   * ==========================================
   * PUBLISH
   * ==========================================
   */

  const handlePublish = async () => {
    if (!testId) {
      setError(
        "Test ID is missing."
      );
      return;
    }

    if (questions.length === 0) {
      setError(
        "At least one question is required before publishing."
      );
      return;
    }

    try {
      setPublishing(true);
      setError("");

      console.log(
        "PUBLISHING TEST:",
        testId
      );

      const updatedTest =
        await updateTest(
          testId,
          {
            status: "live",
          }
        );

      console.log(
        "PUBLISHED TEST:",
        updatedTest
      );

      setTest(
        updatedTest
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error(
        "PUBLISH ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "URL:",
        error?.config?.url
      );

      setError(
        error?.response?.data?.message ||
          "Failed to publish test."
      );
    } finally {
      setPublishing(false);
    }
  };

  /*
   * ==========================================
   * SIDEBAR QUESTION NAVIGATION
   * ==========================================
   */

  const sidebarQuestions =
    questions.map(
      (question, index) => ({
        id: question.id,
        label: `Question ${index + 1}`,
        status: "complete",
      })
    );

  const handleQuestionClick = (
    question: {
      id: string;
      label: string;
      status: string;
    }
  ) => {
    const element =
      document.getElementById(
        question.id
      );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
   * ==========================================
   * SIDEBAR NAVIGATION
   * ==========================================
   */

  const handleSidebarNavigate = (
    componentName:
      | "Dashboard"
      | "CreateTest"
      | "TestTracking"
      | "TestPreview"
      | "TestConfirmation"
  ) => {
    switch (componentName) {
      case "Dashboard":
        navigate("/dashboard");
        break;

      case "CreateTest":
        if (testId) {
          navigate(
            `/tests/${testId}/edit`
          );
        }
        break;

      case "TestTracking":
        navigate("/test-tracking");
        break;

      case "TestConfirmation":
      case "TestPreview":
        // Already on preview/confirmation flow
        break;

      default:
        break;
    }
  };

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="test-preview-page">
        <div className="test-preview-container">
          <div className="loading-state">
            Loading test preview...
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * TEST NOT FOUND
   * ==========================================
   */

  if (!test) {
    return (
      <main className="test-preview-page">
        <div className="test-preview-container">

          <div className="error-state">
            {error ||
              "Test not found."}
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
          >
            Back to Dashboard
          </button>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <AppLayout
      componentName="TestPreview"
      totalQuestions={
        questions.length
      }
      questions={
        sidebarQuestions
      }
      onQuestionClick={
        handleQuestionClick
      }
      onNavigate={
        handleSidebarNavigate
      }
    >
      <main className="test-preview-page">
        <div className="test-preview-container">

          {/* =====================================
              HEADER
          ====================================== */}

          <header className="test-preview-header">

            <div className="test-preview-title">
              <h1>
                Test Preview
              </h1>

              <p>
                Review the complete test before
                publishing.
              </p>
            </div>

            <div className="preview-actions">

             

              

              <button
                type="button"
                className="secondary-button"
                onClick={handlePublish}
              >
                Publish
              </button>

            </div>

          </header>

          {/* =====================================
              ERROR
          ====================================== */}

          {error && (
            <div className="error-state">
              {error}
            </div>
          )}

          {/* =====================================
              TEST DETAILS
          ====================================== */}

         <section className="preview-card test-details-card">

  {/* Top section */}
  <div className="test-details-top">

    <div className="test-details-main">

      {/* Test type */}
      <span className="test-type-badge">
        {test.type || "Chapter Wise"}
      </span>

      {/* Chapter + difficulty */}
      <div className="test-title-row">

        <span className="chapter-icon">
          📚
        </span>

        <span className="test-name">
          {test.name || "Chapter 1"}
        </span>

        <span className="difficulty-badge">
          {test.difficulty || "Easy"}
        </span>

      </div>

    </div>

    {/* Edit */}
    <button
      type="button"
      className="test-edit-button"
      onClick={handleEditTest}
      aria-label="Edit test"
    >
      ✎
    </button>

  </div>


  {/* Test information */}
  <div className="test-details-info">

    <div className="test-detail-row">
      <span className="test-detail-label">
        Subject
      </span>

      <span className="test-detail-separator">
        :
      </span>

      <span className="test-detail-value">
        {test.subject || "English"}
      </span>
    </div>


    <div className="test-detail-row">
      <span className="test-detail-label">
        Topic
      </span>

      <span className="test-detail-separator">
        :
      </span>

      <span className="test-detail-value topic-value">
        {test.topic || "Grammar Writing"}
      </span>
    </div>


    <div className="test-detail-row">
      <span className="test-detail-label">
        Sub Topic
      </span>

      <span className="test-detail-separator">
        :
      </span>

      <span className="test-detail-value topic-value">
        {test.sub_topic || "Application"}
      </span>
    </div>

  </div>


  {/* Bottom statistics */}
  <div className="test-statistics">

    <div className="test-stat">
      <span className="stat-icon">◷</span>
      <span>{test.total_time || 60} Min</span>
    </div>

    <div className="stat-divider"></div>

    <div className="test-stat">
      <span className="stat-icon">▣</span>
      <span>{questions.length} Q's</span>
    </div>

    <div className="stat-divider"></div>

    <div className="test-stat">
      <span className="stat-icon">▤</span>
      <span>{test.total_marks || 250} Marks</span>
    </div>

  </div>

</section>

          {/* =====================================
              QUESTIONS
          ====================================== */}

          <section className="preview-card">

            <h2>
              Questions ({questions.length})
            </h2>

            {questions.length === 0 ? (

              <div className="empty-state">
                No questions have been added
                to this test.
              </div>

            ) : (

              <div className="questions-list">

                {questions.map(
                  (question, index) => (

                    <article
                      className="question-preview-card"
                      key={question.id}
                      id={question.id}
                    >

                      <div className="question-number">
                        Question {index + 1}
                      </div>

                      <p className="question-text">
                        {question.question}
                      </p>

                      <ol className="options-list">

                        <li>
                          {question.option1}
                        </li>

                        <li>
                          {question.option2}
                        </li>

                        <li>
                          {question.option3}
                        </li>

                        <li>
                          {question.option4}
                        </li>

                      </ol>

                      <div className="correct-answer">
                        Correct answer:{" "}
                        <strong>
                          {question.correct_option}
                        </strong>
                      </div>

                      {question.explanation && (
                        <div className="explanation">
                          <strong>
                            Explanation:
                          </strong>{" "}
                          {question.explanation}
                        </div>
                      )}

                      <div className="question-meta">

                        <span className="meta-badge">
                          {question.type}
                        </span>

                        {question.difficulty && (
                          <span className="meta-badge">
                            {question.difficulty}
                          </span>
                        )}

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

          </section>

          {/* =====================================
              BOTTOM ACTIONS
          ====================================== */}

          <div className="preview-actions preview-bottom-actions">
              <button
              type="button"
              className="secondary-button"
              onClick={handleEditTest}
            >
              Edit Test
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleBack}
            >
              Next
            </button>

          

           

          </div>

        </div>
      </main>
    </AppLayout>
  );
}