import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateTestPayload } from "../api/tests";
import { createTest } from "../api/tests";

import {
  testSchema,
  type TestFormValues,
} from "../validation/testSchema";

import type { Subject } from "../types/subject";
import type {
  Topic,
  SubTopic,
} from "../types/topic";

import { getSubjects } from "../api/subjects";

import {
  getTopicsBySubject,
  getSubTopicsByTopics,
} from "../api/topics";

import "./CreateTest.css";

export default function CreateTest() {
  const navigate = useNavigate();

  // -----------------------------
  // API DATA
  // -----------------------------

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [subTopics, setSubTopics] =
    useState<SubTopic[]>([]);

  // -----------------------------
  // LOADING STATES
  // -----------------------------

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [loadingTopics, setLoadingTopics] =
    useState(false);

  const [loadingSubTopics, setLoadingSubTopics] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  // -----------------------------
  // API ERROR
  // -----------------------------

  const [apiError, setApiError] =
    useState("");

  // -----------------------------
  // REACT HOOK FORM
  // -----------------------------

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {
      errors,
    },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),

    defaultValues: {
      name: "",

      subject: "",

      type: "",

      topics: [],

      sub_topics: [],

      difficulty: "",

      correct_marks: 4,

      wrong_marks: -1,

      unattempt_marks: 0,

      total_time: 60,

      total_marks: 40,

      total_questions: 10,
    },
  });

  // -----------------------------
  // WATCH FORM VALUES
  // -----------------------------

  const selectedSubject =
    watch("subject");

  const selectedTopics =
    watch("topics");

  // -----------------------------
  // LOAD SUBJECTS
  // -----------------------------

  useEffect(() => {
    loadSubjects();
  }, []);

  // -----------------------------
  // SUBJECT → TOPICS
  // -----------------------------

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);

      setSubTopics([]);

      setValue(
        "topics",
        []
      );

      setValue(
        "sub_topics",
        []
      );

      return;
    }

    loadTopics(selectedSubject);
  }, [
    selectedSubject,
    setValue,
  ]);

  // -----------------------------
  // TOPICS → SUB TOPICS
  // -----------------------------

  useEffect(() => {
    if (
      !selectedTopics ||
      selectedTopics.length === 0
    ) {
      setSubTopics([]);

      setValue(
        "sub_topics",
        []
      );

      return;
    }

    loadSubTopics(
      selectedTopics
    );
  }, [
    selectedTopics,
    setValue,
  ]);

  // -----------------------------
  // GET SUBJECTS
  // -----------------------------

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);

      setApiError("");

      const data =
        await getSubjects();

      console.log(
        "📚 SUBJECTS:",
        data
      );

      setSubjects(data);
    } catch (error) {
      console.error(
        "❌ SUBJECT ERROR:",
        error
      );

      setApiError(
        "Failed to load subjects"
      );
    } finally {
      setLoadingSubjects(false);
    }
  };

  // -----------------------------
  // GET TOPICS
  // -----------------------------

  const loadTopics = async (
    subjectId: string
  ) => {
    try {
      setLoadingTopics(true);

      setApiError("");

      // Clear old topics
      setTopics([]);

      // Clear old sub topics
      setSubTopics([]);

      // Clear selected values
      setValue(
        "topics",
        []
      );

      setValue(
        "sub_topics",
        []
      );

      console.log(
        "📚 LOADING TOPICS FOR SUBJECT:",
        subjectId
      );

      const data =
        await getTopicsBySubject(
          subjectId
        );

      console.log(
        "📚 TOPICS:",
        data
      );

      setTopics(data);
    } catch (error) {
      console.error(
        "❌ TOPICS ERROR:",
        error
      );

      setApiError(
        "Failed to load topics"
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  // -----------------------------
  // GET SUB TOPICS
  // -----------------------------

  const loadSubTopics = async (
    topicIds: string[]
  ) => {
    try {
      setLoadingSubTopics(true);

      setApiError("");

      setValue(
        "sub_topics",
        []
      );

      console.log(
        "📚 LOADING SUB TOPICS FOR:",
        topicIds
      );

      const data =
        await getSubTopicsByTopics(
          topicIds
        );

      console.log(
        "📚 SUB TOPICS:",
        data
      );

      setSubTopics(data);
    } catch (error) {
      console.error(
        "❌ SUB TOPICS ERROR:",
        error
      );

      setApiError(
        "Failed to load sub-topics"
      );
    } finally {
      setLoadingSubTopics(false);
    }
  };

  // -----------------------------
  // SUBMIT FORM
  // -----------------------------

  const onSubmit = async (
    data: TestFormValues
  ) => {
    console.log(
      "🔥 SUBMIT HANDLER FIRED"
    );

    console.log(
      "📝 FORM DATA:",
      data
    );

    setSubmitLoading(true);

    setApiError("");

    try {
      // -----------------------------
      // CREATE PAYLOAD
      // -----------------------------

    const payload: CreateTestPayload = {
  name: data.name.trim(),

 
  type:
    data.type === "subjectwise"
      ? "chapterwise"
      : data.type,

  subject: data.subject,

  topics: data.topics,

  sub_topics: data.sub_topics,

  correct_marks: Number(data.correct_marks),

  wrong_marks: Number(data.wrong_marks),

  unattempt_marks: Number(data.unattempt_marks),

  difficulty: data.difficulty,

  total_time: Number(data.total_time),

  total_marks: Number(data.total_marks),

  total_questions: Number(data.total_questions),

  status: "draft",
};

      console.log(
        "📦 CREATE TEST PAYLOAD:",
        payload
      );

      // -----------------------------
      // CALL POST /tests
      // -----------------------------

      console.log(
        "🚀 ABOUT TO CALL POST /tests"
      );

      const test =
        await createTest(
          payload
        );

      // -----------------------------
      // API RESPONSE
      // -----------------------------

      console.log(
        "✅ CREATED TEST:",
        test
      );

      // -----------------------------
      // CHECK TEST ID
      // -----------------------------

      if (!test?.id) {
        throw new Error(
          "Test created but test ID was not returned"
        );
      }

      // -----------------------------
      // SAVE TEST ID
      // -----------------------------

      sessionStorage.setItem(
        "currentTestId",
        test.id
      );

      console.log(
        "💾 SAVED TEST ID:",
        test.id
      );

      // -----------------------------
      // NAVIGATE TO QUESTIONS
      // -----------------------------

      navigate(
        `/tests/${test.id}/questions`
      );
    } catch (error) {
      console.error(
        "❌ CREATE TEST ERROR:",
        error
      );

      setApiError(
        "Failed to create test. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // -----------------------------
  // VALIDATION ERROR
  // -----------------------------

  const onValidationError = (
    formErrors: typeof errors
  ) => {
    console.log(
      "❌ FORM VALIDATION ERRORS:",
      formErrors
    );
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <main className="create-test-page">
      <div className="create-test-container">

        {/* =========================
            HEADER
        ========================== */}

        <div className="create-test-header">
          <div>
            <h1>
              Create New Test
            </h1>

            <p>
              Add test details before
              adding questions.
            </p>
          </div>
        </div>

        {/* =========================
            API ERROR
        ========================== */}

        {apiError && (
          <div className="api-error">
            {apiError}
          </div>
        )}

        {/* =========================
            FORM
        ========================== */}

        <form
          onSubmit={handleSubmit(
            onSubmit,
            onValidationError
          )}
        >

          {/* =========================
              BASIC INFORMATION
          ========================== */}

          <section className="form-card">

            <h2>
              Basic Information
            </h2>

            <div className="form-grid">

              {/* TEST NAME */}

              <div className="form-field full">

                <label>
                  Test Name
                </label>

                <input
                  {...register("name")}
                  placeholder="Enter test name"
                />

                {errors.name && (
                  <span className="field-error">
                    {
                      errors.name.message
                    }
                  </span>
                )}

              </div>

              {/* SUBJECT */}

              <div className="form-field">

                <label>
                  Subject
                </label>

                <select
                  {...register("subject")}
                  disabled={
                    loadingSubjects
                  }
                >

                  <option value="">
                    {loadingSubjects
                      ? "Loading subjects..."
                      : "Select subject"}
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    )
                  )}

                </select>

                {errors.subject && (
                  <span className="field-error">
                    {
                      errors
                        .subject
                        .message
                    }
                  </span>
                )}

              </div>

              {/* TEST TYPE */}

              <div className="form-field">

                <label>
                  Test Type
                </label>

                <select
                  {...register("type")}
                >

                  <option value="">
                    Select test type
                  </option>

                 <option value="chapterwise">
  Chapterwise
</option>

<option value="full_length">
  Full Length
</option>
                

                </select>

                {errors.type && (
                  <span className="field-error">
                    {
                      errors
                        .type
                        .message
                    }
                  </span>
                )}

              </div>

            </div>

          </section>

          {/* =========================
              TOPICS
          ========================== */}

          <section className="form-card">

            <h2>
              Topics
            </h2>

            <p className="section-description">
              Select the topics for this test.
            </p>

            {loadingTopics && (
              <p>
                Loading topics...
              </p>
            )}

            {!loadingTopics &&
              topics.length === 0 && (
                <p className="muted">
                  Select a subject first.
                </p>
              )}

            <div className="checkbox-grid">

              {topics.map(
                (topic) => (
                  <label
                    className="checkbox-item"
                    key={topic.id}
                  >

                    <input
                      type="checkbox"
                      value={topic.id}
                      {...register(
                        "topics"
                      )}
                    />

                    <span>
                      {topic.name}
                    </span>

                  </label>
                )
              )}

            </div>

            {errors.topics && (
              <span className="field-error">
                {
                  errors
                    .topics
                    .message
                }
              </span>
            )}

          </section>

          {/* =========================
              SUB TOPICS
          ========================== */}

          <section className="form-card">

            <h2>
              Sub-topics
            </h2>

            <p className="section-description">
              Select the sub-topics.
            </p>

            {loadingSubTopics && (
              <p>
                Loading sub-topics...
              </p>
            )}

            {!loadingSubTopics &&
              subTopics.length === 0 && (
                <p className="muted">
                  Select topics first.
                </p>
              )}

            <div className="checkbox-grid">

              {subTopics.map(
                (subTopic) => (
                  <label
                    className="checkbox-item"
                    key={subTopic.id}
                  >

                    <input
                      type="checkbox"
                      value={subTopic.id}
                      {...register(
                        "sub_topics"
                      )}
                    />

                    <span>
                      {
                        subTopic.name
                      }
                    </span>

                  </label>
                )
              )}

            </div>

            {errors.sub_topics && (
              <span className="field-error">
                {
                  errors
                    .sub_topics
                    .message
                }
              </span>
            )}

          </section>

          {/* =========================
              DIFFICULTY
          ========================== */}

          <section className="form-card">

            <h2>
              Test Configuration
            </h2>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Difficulty
                </label>

                <select
                  {...register(
                    "difficulty"
                  )}
                >

                  <option value="">
                    Select difficulty
                  </option>

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

                {errors.difficulty && (
                  <span className="field-error">
                    {
                      errors
                        .difficulty
                        .message
                    }
                  </span>
                )}

              </div>

            </div>

          </section>

          {/* =========================
              MARKING SCHEME
          ========================== */}

          <section className="form-card">

            <h2>
              Marking Scheme
            </h2>

            <div className="form-grid">

              {/* CORRECT MARKS */}

              <div className="form-field">

                <label>
                  Correct Marks
                </label>

                <input
                  type="number"
                  {...register(
                    "correct_marks",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.correct_marks && (
                  <span className="field-error">
                    {
                      errors
                        .correct_marks
                        .message
                    }
                  </span>
                )}

              </div>

              {/* WRONG MARKS */}

              <div className="form-field">

                <label>
                  Wrong Marks
                </label>

                <input
                  type="number"
                  step="0.5"
                  {...register(
                    "wrong_marks",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.wrong_marks && (
                  <span className="field-error">
                    {
                      errors
                        .wrong_marks
                        .message
                    }
                  </span>
                )}

              </div>

              {/* UNATTEMPT MARKS */}

              <div className="form-field">

                <label>
                  Unattempt Marks
                </label>

                <input
                  type="number"
                  {...register(
                    "unattempt_marks",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.unattempt_marks && (
                  <span className="field-error">
                    {
                      errors
                        .unattempt_marks
                        .message
                    }
                  </span>
                )}

              </div>

            </div>

          </section>

          {/* =========================
              TEST LIMITS
          ========================== */}

          <section className="form-card">

            <h2>
              Test Limits
            </h2>

            <div className="form-grid">

              {/* TOTAL TIME */}

              <div className="form-field">

                <label>
                  Total Time
                  <span>
                    {" "}
                    (minutes)
                  </span>
                </label>

                <input
                  type="number"
                  {...register(
                    "total_time",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.total_time && (
                  <span className="field-error">
                    {
                      errors
                        .total_time
                        .message
                    }
                  </span>
                )}

              </div>

              {/* TOTAL MARKS */}

              <div className="form-field">

                <label>
                  Total Marks
                </label>

                <input
                  type="number"
                  {...register(
                    "total_marks",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.total_marks && (
                  <span className="field-error">
                    {
                      errors
                        .total_marks
                        .message
                    }
                  </span>
                )}

              </div>

              {/* TOTAL QUESTIONS */}

              <div className="form-field">

                <label>
                  Total Questions
                </label>

                <input
                  type="number"
                  {...register(
                    "total_questions",
                    {
                      valueAsNumber: true,
                    }
                  )}
                />

                {errors.total_questions && (
                  <span className="field-error">
                    {
                      errors
                        .total_questions
                        .message
                    }
                  </span>
                )}

              </div>

            </div>

          </section>

          {/* =========================
              ACTIONS
          ========================== */}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitLoading}
            >

              {submitLoading
                ? "Creating..."
                : "Save & Add Questions"}

            </button>

          </div>

        </form>

      </div>
    </main>
  );
}