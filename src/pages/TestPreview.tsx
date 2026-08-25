
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTestById } from "../api/tests";
import { fetchQuestionsBulk } from "../api/questions";

import type { Test } from "../types/test";

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

  const [test, setTest] = useState<Test | null>(
    null
  );

  const [questions, setQuestions] = useState<
    PreviewQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [publishing, setPublishing] =
    useState(false);

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

        // ------------------------------------------------
        // 1. Get test
        // GET /api/tests/:id
        // ------------------------------------------------

        const testData =
          await getTestById(testId);

        console.log(
          "TEST PREVIEW DATA:",
          testData
        );

        setTest(testData);

        // ------------------------------------------------
        // 2. Get question IDs from test
        // ------------------------------------------------

        const questionIds =
          Array.isArray(testData.questions)
            ? testData.questions
            : [];

        console.log(
          "QUESTION IDS:",
          questionIds
        );

        // No questions
        if (questionIds.length === 0) {
          setQuestions([]);
          return;
        }

        // ------------------------------------------------
        // 3. Fetch questions in bulk
        // POST /api/questions/fetchBulk
        // ------------------------------------------------

        const questionData =
          await fetchQuestionsBulk(
            questionIds
          );

        console.log(
          "FETCHED QUESTIONS:",
          questionData
        );

        setQuestions(
          Array.isArray(questionData)
            ? questionData
            : []
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

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleEditTest = () => {
    if (!testId) return;

    navigate(`/tests/${testId}/edit`);
  };

  const handleEditQuestions = () => {
    if (!testId) return;

    navigate(`/tests/${testId}/questions`);
  };

  const handlePublish = async () => {
    if (!testId) {
      setError("Test ID is missing.");
      return;
    }

    try {
      setPublishing(true);
      setError("");

      // Publishing will use:
      // PUT /api/tests/:id
      //
      // This is intentionally left until we verify
      // the exact updateTest API implementation.

      console.log(
        "READY TO PUBLISH TEST:",
        testId
      );

      setError(
        "Preview loaded successfully. Publish API is the next step."
      );
    } catch (error: any) {
      console.error(
        "PUBLISH ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      setError(
        error?.response?.data?.message ||
          "Failed to publish test."
      );
    } finally {
      setPublishing(false);
    }
  };

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

  if (!test) {
    return (
      <main className="test-preview-page">
        <div className="test-preview-container">
          <div className="error-state">
            {error || "Test not found."}
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

  return (
    <main className="test-preview-page">
      <div className="test-preview-container">

        {/* Header */}

        <header className="test-preview-header">

          <div>
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
              onClick={handleBack}
            >
              Dashboard
            </button>

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
              onClick={handleEditQuestions}
            >
              Edit Questions
            </button>

          </div>

        </header>

        {/* Error */}

        {error && (
          <div className="error-state">
            {error}
          </div>
        )}

        {/* Test Details */}

        <section className="preview-card">

          <h2>
            Test Details
          </h2>

          <div className="test-info-grid">

            <div className="info-item">
              <span className="info-label">
                Name
              </span>

              <span className="info-value">
                {test.name}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Subject
              </span>

              <span className="info-value">
                {test.subject}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Type
              </span>

              <span className="info-value">
                {test.type}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Difficulty
              </span>

              <span className="info-value">
                {test.difficulty}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Questions
              </span>

              <span className="info-value">
                {questions.length}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Total Marks
              </span>

              <span className="info-value">
                {test.total_marks}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Time
              </span>

              <span className="info-value">
                {test.total_time} minutes
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Status
              </span>

              <span className="info-value">
                {test.status || "draft"}
              </span>
            </div>

          </div>

        </section>

        {/* Questions */}

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
            questions.map(
              (question, index) => (

                <article
                  className="question-preview-card"
                  key={question.id}
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
            )
          )}

        </section>

        {/* Bottom Actions */}

        <div className="preview-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleEditQuestions}
          >
            Edit Questions
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              questions.length === 0 ||
              publishing
            }
            onClick={handlePublish}
          >
            {publishing
              ? "Publishing..."
              : "Publish Test"}
          </button>

        </div>

      </div>
    </main>
  );
}

