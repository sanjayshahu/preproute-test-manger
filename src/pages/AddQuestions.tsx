
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createQuestionsBulk,
} from "../api/questions";

import {
  getTestById,
} from "../api/tests";

import type {
  QuestionFormValues,
  QuestionPayload,
} from "../types/question";

import "./AddQuestions.css";

const emptyQuestion: QuestionFormValues = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: "option1",
  explanation: "",
  difficulty: "medium",
};

export default function AddQuestions() {
  /*
   * ==========================================
   * ROUTER
   * ==========================================
   */

  const { testId } =
    useParams<{ testId: string }>();

  const navigate = useNavigate();

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [testSubject, setTestSubject] =
    useState("");

  const [form, setForm] =
    useState<QuestionFormValues>(
      emptyQuestion
    );

  const [questions, setQuestions] =
    useState<QuestionPayload[]>([]);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loadingTest, setLoadingTest] =
    useState(true);

  /*
   * ==========================================
   * LOAD TEST
   * ==========================================
   */

  useEffect(() => {
    if (!testId) {
      setError("Test ID is missing.");
      setLoadingTest(false);
      return;
    }

    const loadTest = async () => {
      try {
        setLoadingTest(true);
        setError("");

        const test =
          await getTestById(testId);

        console.log(
          "TEST FOR QUESTIONS:",
          test
        );

        if (!test?.subject) {
          setError(
            "Test subject was not returned by the API."
          );
          return;
        }

        setTestSubject(test.subject);

      } catch (error) {
        console.error(
          "FAILED TO LOAD TEST:",
          error
        );

        setError(
          "Failed to load test information."
        );

      } finally {
        setLoadingTest(false);
      }
    };

    loadTest();
  }, [testId]);

  /*
   * ==========================================
   * HANDLE INPUT CHANGE
   * ==========================================
   */

  const handleChange = (
    field: keyof QuestionFormValues,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * ==========================================
   * ADD QUESTION
   * ==========================================
   */

  const addQuestion = () => {
    setError("");

    if (!testId) {
      setError("Test ID is missing.");
      return;
    }

    if (!testSubject) {
      setError(
        "Test subject is not loaded yet."
      );
      return;
    }

    if (!form.question.trim()) {
      setError("Question is required.");
      return;
    }

    if (!form.option1.trim()) {
      setError("Option 1 is required.");
      return;
    }

    if (!form.option2.trim()) {
      setError("Option 2 is required.");
      return;
    }

    if (!form.option3.trim()) {
      setError("Option 3 is required.");
      return;
    }

    if (!form.option4.trim()) {
      setError("Option 4 is required.");
      return;
    }

    const newQuestion: QuestionPayload = {
      type: "mcq",

      question:
        form.question.trim(),

      option1:
        form.option1.trim(),

      option2:
        form.option2.trim(),

      option3:
        form.option3.trim(),

      option4:
        form.option4.trim(),

      correct_option:
        form.correct_option,

      explanation:
        form.explanation.trim(),

      difficulty:
        form.difficulty || "medium",

      test_id:
        testId,

      subject:
        testSubject,
    };

    console.log(
      "QUESTION ADDED:",
      newQuestion
    );

    setQuestions((previous) => [
      ...previous,
      newQuestion,
    ]);

    setForm({
      ...emptyQuestion,
    });
  };

  /*
   * ==========================================
   * DELETE QUESTION
   * ==========================================
   */

  const deleteQuestion = (
    index: number
  ) => {
    setQuestions((previous) =>
      previous.filter(
        (_, questionIndex) =>
          questionIndex !== index
      )
    );
  };

  /*
   * ==========================================
   * SAVE QUESTIONS
   * ==========================================
   */



const saveQuestions = async () => {
  setError("");

  if (!testId) {
    setError("Test ID is missing.");
    return;
  }

  if (questions.length === 0) {
    setError("Please add at least one question.");
    return;
  }

  if (!testSubject) {
    setError("Test subject is not loaded yet.");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      questions: questions.map((question) => ({
        type: question.type,
        question: question.question,
        option1: question.option1,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        correct_option: question.correct_option,
        explanation: question.explanation || "",
        difficulty: question.difficulty || "medium",
        test_id: testId,
        subject: testSubject,
      })),
    };

    console.log(
      "FINAL BULK QUESTIONS PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await createQuestionsBulk(payload);

    console.log(
      "QUESTIONS CREATED:",
      response
    );

    navigate(`/tests/${testId}/preview`);

  } catch (error: any) {
    console.error(
      "SAVE QUESTIONS ERROR:",
      error
    );

    console.error(
      "SERVER RESPONSE:",
      error?.response?.data
    );

    setError(
      error?.response?.data?.message ||
      "Failed to save questions."
    );

  } finally {
    setSaving(false);
  }
};





  /*
   * ==========================================
   * BACK
   * ==========================================
   */

  const handleBack = () => {
    if (testId) {
      navigate(
        `/tests/${testId}`
      );
    } else {
      navigate("/dashboard");
    }
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <main className="add-questions-page">

      <div className="add-questions-container">

        {/* HEADER */}

        <header className="page-header">

          <div>

            <h1>
              Add Questions
            </h1>

            <p>
              Add MCQ questions to your test.
            </p>

          </div>

          <div className="question-count">
            {questions.length} Questions
          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="question-error">
            {error}
          </div>
        )}

        {/* TEST INFORMATION */}

        {loadingTest && (
          <section className="question-card">

            <p>
              Loading test information...
            </p>

          </section>
        )}

        {!loadingTest &&
          testSubject && (
            <section className="question-card">

              <h2>
                Test Information
              </h2>

              <p>
                <strong>
                  Subject:
                </strong>{" "}
                {testSubject}
              </p>

            </section>
          )}

        {/* QUESTION FORM */}

        <section className="question-card">

          <h2>
            Question{" "}
            {questions.length + 1}
          </h2>

          {/* QUESTION */}

          <div className="form-field full">

            <label>
              Question
            </label>

            <textarea
              value={
                form.question
              }
              onChange={(event) =>
                handleChange(
                  "question",
                  event.target.value
                )
              }
              placeholder="Enter your question"
              rows={4}
            />

          </div>

          {/* OPTIONS */}

          <div className="options-grid">

            <div className="form-field">

              <label>
                Option 1
              </label>

              <input
                value={
                  form.option1
                }
                onChange={(event) =>
                  handleChange(
                    "option1",
                    event.target.value
                  )
                }
                placeholder="Enter option 1"
              />

            </div>

            <div className="form-field">

              <label>
                Option 2
              </label>

              <input
                value={
                  form.option2
                }
                onChange={(event) =>
                  handleChange(
                    "option2",
                    event.target.value
                  )
                }
                placeholder="Enter option 2"
              />

            </div>

            <div className="form-field">

              <label>
                Option 3
              </label>

              <input
                value={
                  form.option3
                }
                onChange={(event) =>
                  handleChange(
                    "option3",
                    event.target.value
                  )
                }
                placeholder="Enter option 3"
              />

            </div>

            <div className="form-field">

              <label>
                Option 4
              </label>

              <input
                value={
                  form.option4
                }
                onChange={(event) =>
                  handleChange(
                    "option4",
                    event.target.value
                  )
                }
                placeholder="Enter option 4"
              />

            </div>

          </div>

          {/* CORRECT OPTION + DIFFICULTY */}

          <div className="form-grid">

            <div className="form-field">

              <label>
                Correct Option
              </label>

              <select
                value={
                  form.correct_option
                }
                onChange={(event) =>
                  handleChange(
                    "correct_option",
                    event.target.value
                  )
                }
              >

                <option value="option1">
                  Option 1
                </option>

                <option value="option2">
                  Option 2
                </option>

                <option value="option3">
                  Option 3
                </option>

                <option value="option4">
                  Option 4
                </option>

              </select>

            </div>

            <div className="form-field">

              <label>
                Difficulty
              </label>

              <select
                value={
                  form.difficulty
                }
                onChange={(event) =>
                  handleChange(
                    "difficulty",
                    event.target.value
                  )
                }
              >

                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>

              </select>

            </div>

          </div>

          {/* EXPLANATION */}

          <div className="form-field full">

            <label>
              Explanation
              <span>
                {" "}
                (optional)
              </span>
            </label>

            <textarea
              value={
                form.explanation
              }
              onChange={(event) =>
                handleChange(
                  "explanation",
                  event.target.value
                )
              }
              placeholder="Explain the correct answer"
              rows={3}
            />

          </div>

          {/* ADD */}

          <div className="question-actions">

            <button
              type="button"
              className="primary-button"
              onClick={addQuestion}
              disabled={
                loadingTest ||
                !testSubject
              }
            >
              + Add Question
            </button>

          </div>

        </section>

        {/* ADDED QUESTIONS */}

        {questions.length > 0 && (

          <section className="added-questions">

            <h2>
              Added Questions
            </h2>

            {questions.map(
              (
                question,
                index
              ) => (

                <article
                  className="question-preview"
                  key={index}
                >

                  <div className="question-preview-header">

                    <strong>
                      Question{" "}
                      {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        deleteQuestion(
                          index
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                  <p>
                    {question.question}
                  </p>

                  <ol>

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

                  <div>
                    Correct answer:{" "}

                    <strong>
                      {
                        question.correct_option
                      }
                    </strong>
                  </div>

                  <div>
                    Difficulty:{" "}

                    <strong>
                      {
                        question.difficulty
                      }
                    </strong>
                  </div>

                  <div>
                    Subject:{" "}

                    <strong>
                      {
                        question.subject
                      }
                    </strong>
                  </div>

                </article>

              )
            )}

          </section>

        )}

        {/* ACTIONS */}

        <div className="bottom-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
            disabled={saving}
          >
            Back
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              questions.length === 0 ||
              saving ||
              loadingTest ||
              !testSubject
            }
            onClick={
              saveQuestions
            }
          >

            {saving
              ? "Saving..."
              : "Save & Continue"}

          </button>

        </div>

      </div>

    </main>
  );
}

