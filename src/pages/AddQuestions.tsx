import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import api from "../api/client";

import {
  createQuestionsBulk,
  fetchQuestionsBulk,
} from "../api/questions";

import { getTestById } from "../api/tests";

import type {
  QuestionFormValues,
  QuestionPayload,
} from "../types/question";

import "./AddQuestions.css";

interface ExistingQuestion extends QuestionPayload {
  id: string;
}

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
  const { testId } = useParams<{
    testId: string;
  }>();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /*
   * Supports:
   *
   * /tests/:testId/questions?editQuestionId=QUESTION_ID
   *
   * and also:
   *
   * /tests/:testId/questions?questionId=QUESTION_ID
   */
  const editQuestionId =
    searchParams.get("editQuestionId") ||
    searchParams.get("questionId");

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [testSubject, setTestSubject] =
    useState("");

  const [form, setForm] =
    useState<QuestionFormValues>({
      ...emptyQuestion,
    });

  const [questions, setQuestions] =
    useState<ExistingQuestion[]>([]);

  /*
   * ID of question currently being edited.
   */
  const [editingQuestionId, setEditingQuestionId] =
    useState<string | null>(null);

  /*
   * IMPORTANT:
   *
   * Store the actual array index of the question
   * being edited.
   *
   * This fixes:
   *
   * Q1 -> Q1
   * Q2 -> Q2
   * Q3 -> Q3
   *
   * instead of always using questions.length + 1.
   */
  const [editingQuestionIndex, setEditingQuestionIndex] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loadingTest, setLoadingTest] =
    useState(true);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [deletingQuestionId, setDeletingQuestionId] =
    useState<string | null>(null);

  /*
   * ==========================================
   * LOAD TEST + QUESTIONS
   * ==========================================
   */

  useEffect(() => {
    if (!testId) {
      setError("Test ID is missing.");
      setLoadingTest(false);
      return;
    }

    const loadTestAndQuestions = async () => {
      try {
        setLoadingTest(true);
        setLoadingQuestions(true);
        setError("");

        /*
         * LOAD TEST
         */

        const test =
          await getTestById(testId);

        console.log(
          "TEST FOR QUESTIONS:",
          test
        );

        if (!test?.subject) {
          throw new Error(
            "Test subject was not returned by the API."
          );
        }

        setTestSubject(test.subject);

        /*
         * GET QUESTION IDS
         */

        const questionIds =
          Array.isArray(test.questions)
            ? test.questions
            : [];

        console.log(
          "QUESTION IDS FROM TEST:",
          questionIds
        );

        /*
         * NO QUESTIONS
         */

        if (questionIds.length === 0) {
          setQuestions([]);
          return;
        }

        /*
         * FETCH ACTUAL QUESTIONS
         */

        const questionData =
          await fetchQuestionsBulk(
            questionIds
          );

        console.log(
          "EXISTING QUESTIONS:",
          questionData
        );

        if (!Array.isArray(questionData)) {
          setQuestions([]);
          return;
        }

        /*
         * NORMALIZE QUESTIONS
         */

        const existingQuestions =
          questionData
            .filter(
              (question: any) =>
                question?.id
            )
            .map(
              (question: any) => ({
                ...question,

                test_id:
                  question.test_id ||
                  testId,

                subject:
                  question.subject ||
                  test.subject,
              })
            );

        setQuestions(
          existingQuestions
        );

        /*
         * ======================================
         * AUTO OPEN QUESTION FOR EDIT
         * ======================================
         *
         * If URL is:
         *
         * ?editQuestionId=abc
         *
         * automatically populate that question.
         */

        if (editQuestionId) {
          const questionIndex =
            existingQuestions.findIndex(
              (question) =>
                question.id ===
                editQuestionId
            );

          if (questionIndex !== -1) {
            const question =
              existingQuestions[
                questionIndex
              ];

            setEditingQuestionId(
              question.id
            );

            setEditingQuestionIndex(
              questionIndex
            );

            setForm({
              question:
                question.question || "",

              option1:
                question.option1 || "",

              option2:
                question.option2 || "",

              option3:
                question.option3 || "",

              option4:
                question.option4 || "",

              correct_option:
                question.correct_option ||
                "option1",

              explanation:
                question.explanation ||
                "",

              difficulty:
                question.difficulty ||
                "medium",
            });

            console.log(
              "AUTO EDIT QUESTION:",
              question
            );
          }
        }
      } catch (error: any) {
        console.error(
          "FAILED TO LOAD TEST / QUESTIONS:",
          error
        );

        console.error(
          "SERVER RESPONSE:",
          error?.response?.data
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load test questions."
        );
      } finally {
        setLoadingTest(false);
        setLoadingQuestions(false);
      }
    };

    loadTestAndQuestions();
  }, [testId, editQuestionId]);

  /*
   * ==========================================
   * HANDLE FORM CHANGE
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
   * VALIDATE QUESTION
   * ==========================================
   */

  const validateQuestion = () => {
    if (!form.question.trim()) {
      setError("Question is required.");
      return false;
    }

    if (!form.option1.trim()) {
      setError("Option 1 is required.");
      return false;
    }

    if (!form.option2.trim()) {
      setError("Option 2 is required.");
      return false;
    }

    if (!form.option3.trim()) {
      setError("Option 3 is required.");
      return false;
    }

    if (!form.option4.trim()) {
      setError("Option 4 is required.");
      return false;
    }

    return true;
  };

  /*
   * ==========================================
   * START EDITING QUESTION
   * ==========================================
   */

  const editQuestion = (
    question: ExistingQuestion,
    index: number
  ) => {
    setError("");

    console.log(
      "EDITING QUESTION:",
      question
    );

    console.log(
      "EDITING QUESTION INDEX:",
      index
    );

    setEditingQuestionId(
      question.id
    );

    setEditingQuestionIndex(
      index
    );

    setForm({
      question:
        question.question || "",

      option1:
        question.option1 || "",

      option2:
        question.option2 || "",

      option3:
        question.option3 || "",

      option4:
        question.option4 || "",

      correct_option:
        question.correct_option ||
        "option1",

      explanation:
        question.explanation || "",

      difficulty:
        question.difficulty ||
        "medium",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================
   * CANCEL EDIT
   * ==========================================
   */

  const cancelEdit = () => {
    setEditingQuestionId(null);

    setEditingQuestionIndex(null);

    setForm({
      ...emptyQuestion,
    });

    setError("");

    /*
     * Remove edit query parameter.
     */
    if (testId) {
      navigate(
        `/tests/${testId}/questions`,
        {
          replace: true,
        }
      );
    }
  };

  /*
   * ==========================================
   * ADD NEW QUESTION
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

    if (!validateQuestion()) {
      return;
    }

    /*
     * If editing, update instead of adding.
     */
    if (editingQuestionId) {
      updateQuestionLocally();
      return;
    }

    const newQuestion: ExistingQuestion = {
      /*
       * Temporary local ID.
       */
      id: `new-${Date.now()}`,

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
      "NEW QUESTION:",
      newQuestion
    );

    setQuestions((previous) => [
      ...previous,
      newQuestion,
    ]);

    /*
     * Reset form.
     *
     * The next question number will automatically
     * become questions.length + 1 after render.
     */
    setForm({
      ...emptyQuestion,
    });
  };

  /*
   * ==========================================
   * UPDATE QUESTION LOCALLY
   * ==========================================
   */

  const updateQuestionLocally = () => {
    if (
      !editingQuestionId ||
      editingQuestionIndex === null
    ) {
      return;
    }

    if (!validateQuestion()) {
      return;
    }

    setQuestions((previous) =>
      previous.map(
        (question, index) => {
          if (
            index !==
            editingQuestionIndex
          ) {
            return question;
          }

          return {
            ...question,

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
              form.difficulty ||
              "medium",
          };
        }
      )
    );

    console.log(
      "QUESTION UPDATED LOCALLY:",
      editingQuestionId,
      "INDEX:",
      editingQuestionIndex
    );

    setEditingQuestionId(null);

    setEditingQuestionIndex(null);

    setForm({
      ...emptyQuestion,
    });

    setError("");

    /*
     * Remove edit query parameter.
     */
    if (testId) {
      navigate(
        `/tests/${testId}/questions`,
        {
          replace: true,
        }
      );
    }
  };

  /*
   * ==========================================
   * DELETE QUESTION
   * ==========================================
   */

  const deleteQuestion = async (
    question: ExistingQuestion,
    index: number
  ) => {
    setError("");

    /*
     * NEW UNSAVED QUESTION
     */

    if (
      question.id.startsWith("new-")
    ) {
      setQuestions((previous) =>
        previous.filter(
          (_, questionIndex) =>
            questionIndex !== index
        )
      );

      if (
        editingQuestionId ===
        question.id
      ) {
        cancelEdit();
      }

      return;
    }

    try {
      setDeletingQuestionId(
        question.id
      );

      console.log(
        "DELETING QUESTION:",
        question.id
      );

      await api.delete(
        `/questions/${question.id}`
      );

      setQuestions((previous) =>
        previous.filter(
          (item) =>
            item.id !== question.id
        )
      );

      if (
        editingQuestionId ===
        question.id
      ) {
        cancelEdit();
      }
    } catch (error: any) {
      console.error(
        "DELETE QUESTION ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      setError(
        error?.response?.data?.message ||
          "Failed to delete question."
      );
    } finally {
      setDeletingQuestionId(null);
    }
  };

  /*
   * ==========================================
   * SAVE ALL QUESTIONS
   * ==========================================
   */

  const saveQuestions = async () => {
    setError("");

    if (!testId) {
      setError("Test ID is missing.");
      return;
    }

    if (questions.length === 0) {
      setError(
        "Please add at least one question."
      );
      return;
    }

    if (!testSubject) {
      setError(
        "Test subject is not loaded yet."
      );
      return;
    }

    /*
     * Do not save while editing.
     *
     * User must click Update Question first.
     */
    if (editingQuestionId) {
      setError(
        "Please click Update Question before saving."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * EXISTING QUESTIONS
       */

      const existingQuestions =
        questions.filter(
          (question) =>
            !question.id.startsWith(
              "new-"
            )
        );

      /*
       * NEW QUESTIONS
       */

      const newQuestions =
        questions.filter(
          (question) =>
            question.id.startsWith(
              "new-"
            )
        );

      console.log(
        "EXISTING QUESTIONS TO UPDATE:",
        existingQuestions
      );

      console.log(
        "NEW QUESTIONS TO CREATE:",
        newQuestions
      );

      /*
       * ======================================
       * UPDATE EXISTING QUESTIONS
       * ======================================
       */

      for (
        const question of existingQuestions
      ) {
        const updatePayload = {
          type:
            question.type || "mcq",

          question:
            question.question,

          option1:
            question.option1,

          option2:
            question.option2,

          option3:
            question.option3,

          option4:
            question.option4,

          correct_option:
            question.correct_option,

          explanation:
            question.explanation || "",

          difficulty:
            question.difficulty ||
            "medium",

          test_id:
            testId,

          subject:
            testSubject,
        };

        console.log(
          "UPDATING QUESTION:",
          question.id,
          updatePayload
        );

        await api.put(
          `/questions/${question.id}`,
          updatePayload
        );
      }

      /*
       * ======================================
       * CREATE NEW QUESTIONS
       * ======================================
       */

      if (newQuestions.length > 0) {
        const payload = {
          questions:
            newQuestions.map(
              (question) => ({
                type:
                  question.type ||
                  "mcq",

                question:
                  question.question,

                option1:
                  question.option1,

                option2:
                  question.option2,

                option3:
                  question.option3,

                option4:
                  question.option4,

                correct_option:
                  question.correct_option,

                explanation:
                  question.explanation ||
                  "",

                difficulty:
                  question.difficulty ||
                  "medium",

                test_id:
                  testId,

                subject:
                  testSubject,
              })
            ),
        };

        console.log(
          "CREATING NEW QUESTIONS:",
          JSON.stringify(
            payload,
            null,
            2
          )
        );

        await createQuestionsBulk(
          payload
        );
      }

      console.log(
        "ALL QUESTIONS SAVED SUCCESSFULLY"
      );

      navigate(
        `/tests/${testId}/preview`
      );
    } catch (error: any) {
      console.error(
        "SAVE QUESTIONS ERROR:",
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
        `/tests/${testId}/preview`
      );
    } else {
      navigate("/dashboard");
    }
  };

  /*
   * ==========================================
   * CURRENT FORM QUESTION NUMBER
   * ==========================================
   *
   * THIS IS THE IMPORTANT FIX.
   *
   * Editing Q3:
   * editingQuestionIndex = 2
   * therefore display = 3
   *
   * Adding a new question:
   * display = questions.length + 1
   */

  const currentQuestionNumber =
    editingQuestionIndex !== null
      ? editingQuestionIndex + 1
      : questions.length + 1;

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
              Questions
            </h1>

            <p>
              Add or edit MCQ questions
              for your test.
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

        {/* LOADING TEST */}

        {loadingTest && (
          <section className="question-card">
            <p>
              Loading test information...
            </p>
          </section>
        )}

        {/* TEST INFORMATION */}

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

        {/* LOADING QUESTIONS */}

        {loadingQuestions && (
          <section className="question-card">

            <p>
              Loading existing questions...
            </p>

          </section>
        )}

        {/* QUESTION FORM */}

        {!loadingQuestions && (
          <section className="question-card">

            <h2>
              {editingQuestionId
                ? `Edit Question ${currentQuestionNumber}`
                : `Question ${currentQuestionNumber}`}
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

            {/* FORM BUTTONS */}

            <div className="question-actions">

              {editingQuestionId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    cancelEdit
                  }
                  disabled={saving}
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={
                  editingQuestionId
                    ? updateQuestionLocally
                    : addQuestion
                }
                disabled={
                  loadingTest ||
                  !testSubject ||
                  saving
                }
              >
                {editingQuestionId
                  ? `Update Question ${currentQuestionNumber}`
                  : `+ Add Question`}
              </button>

            </div>

          </section>
        )}

        {/* QUESTIONS LIST */}

        {!loadingQuestions &&
          questions.length > 0 && (

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
                    key={question.id}
                  >

                    <div className="question-preview-header">

                      <strong>
                        Question{" "}
                        {index + 1}
                      </strong>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            editQuestion(
                              question,
                              index
                            )
                          }
                          disabled={
                            saving ||
                            deletingQuestionId ===
                              question.id
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteQuestion(
                              question,
                              index
                            )
                          }
                          disabled={
                            saving ||
                            deletingQuestionId ===
                              question.id
                          }
                        >
                          {deletingQuestionId ===
                          question.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

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

                    {question.explanation && (
                      <div>
                        Explanation:{" "}

                        <strong>
                          {
                            question.explanation
                          }
                        </strong>
                      </div>
                    )}

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

        {/* BOTTOM ACTIONS */}

        <div className="bottom-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
            disabled={saving}
          >
            Back to Preview
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              questions.length === 0 ||
              saving ||
              loadingTest ||
              loadingQuestions ||
              !testSubject ||
              !!editingQuestionId
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