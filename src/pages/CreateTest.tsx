import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  CreateTestPayload,
} from "../api/tests";

import {
  createTest,
  getTestById,
  updateTest,
} from "../api/tests";

import {
  testSchema,
  type TestFormValues,
} from "../validation/testSchema";

import type { Subject } from "../types/subject";

import type {
  Topic,
  SubTopic,
} from "../types/topic";

import {
  getSubjects,
} from "../api/subjects";

import {
  getTopicsBySubject,
  getSubTopicsByTopics,
} from "../api/topics";

import "./CreateTest.css";

export default function CreateTest() {
  const navigate = useNavigate();

  const { testId } = useParams<{
    testId: string;
  }>();

  const isEditMode = Boolean(testId);

  // --------------------------------------------------
  // API DATA
  // --------------------------------------------------

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [subTopics, setSubTopics] =
    useState<SubTopic[]>([]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [loadingTopics, setLoadingTopics] =
    useState(false);

  const [loadingSubTopics, setLoadingSubTopics] =
    useState(false);

  const [loadingTest, setLoadingTest] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  const [apiError, setApiError] =
    useState("");

  // --------------------------------------------------
  // IMPORTANT:
  // Prevent normal subject/topic effects from
  // interfering while edit data is being populated.
  // --------------------------------------------------

  const hydratingEdit = useRef(false);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

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

  // --------------------------------------------------
  // WATCH
  // --------------------------------------------------

  const selectedSubject =
    watch("subject");

  const selectedTopics =
    watch("topics");

  // --------------------------------------------------
  // LOAD SUBJECTS
  // --------------------------------------------------

  useEffect(() => {
    loadSubjects();
  }, []);

  // --------------------------------------------------
  // EDIT MODE
  //
  // API returns:
  //
  // subject: "Political Science"
  // topics: ["Political Theory"]
  // sub_topics: ["Socialism"]
  //
  // We convert them to IDs here.
  // --------------------------------------------------

  useEffect(() => {
    if (!testId) {
      return;
    }

    hydrateEditTest(testId);
  }, [testId]);

  // --------------------------------------------------
  // NORMAL SUBJECT CHANGE
  // --------------------------------------------------

  useEffect(() => {
    if (hydratingEdit.current) {
      return;
    }

    if (!selectedSubject) {
      setTopics([]);
      setSubTopics([]);

      setValue("topics", []);
      setValue("sub_topics", []);

      return;
    }

    loadTopicsForSubject(selectedSubject);
  }, [
    selectedSubject,
    setValue,
  ]);

  // --------------------------------------------------
  // NORMAL TOPIC CHANGE
  // --------------------------------------------------

  useEffect(() => {
    if (hydratingEdit.current) {
      return;
    }

    if (
      !selectedTopics ||
      selectedTopics.length === 0
    ) {
      setSubTopics([]);
      setValue("sub_topics", []);

      return;
    }

    loadSubTopicsForTopicIds(
      selectedTopics
    );
  }, [
    selectedTopics,
    setValue,
  ]);

  // ==================================================
  // LOAD SUBJECTS
  // ==================================================

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      setApiError("");

      const data = await getSubjects();

      console.log(
        "📚 SUBJECTS:",
        data
      );

      setSubjects(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "❌ SUBJECT ERROR:",
        error
      );

      setApiError(
        "Failed to load subjects."
      );
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ==================================================
  // LOAD TOPICS
  // ==================================================

  const loadTopicsForSubject = async (
    subjectId: string
  ) => {
    try {
      setLoadingTopics(true);
      setApiError("");

      setTopics([]);
      setSubTopics([]);

      setValue("topics", []);
      setValue("sub_topics", []);

      console.log(
        "📚 LOADING TOPICS FOR SUBJECT ID:",
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

      setTopics(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "❌ TOPICS ERROR:",
        error
      );

      setApiError(
        "Failed to load topics."
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  // ==================================================
  // LOAD SUB TOPICS
  // ==================================================

  const loadSubTopicsForTopicIds =
    async (
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
          "📚 LOADING SUB TOPICS FOR TOPIC IDS:",
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

        setSubTopics(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "❌ SUB TOPICS ERROR:",
          error
        );

        setApiError(
          "Failed to load sub-topics."
        );
      } finally {
        setLoadingSubTopics(false);
      }
    };

  // ==================================================
  // HYDRATE EDIT TEST
  // ==================================================

  const hydrateEditTest = async (
    id: string
  ) => {
    hydratingEdit.current = true;

    try {
      setLoadingTest(true);
      setApiError("");

      console.log(
        "✏️ LOADING TEST FOR EDIT:",
        id
      );

      // ----------------------------------------------
      // 1. GET TEST
      // ----------------------------------------------

      const test =
        await getTestById(id);

      console.log(
        "✏️ EDIT TEST RESPONSE:",
        test
      );

      // ----------------------------------------------
      // 2. LOAD SUBJECTS IF NOT ALREADY LOADED
      // ----------------------------------------------

      let subjectList =
        subjects;

      if (
        !subjectList ||
        subjectList.length === 0
      ) {
        const subjectData =
          await getSubjects();

        subjectList =
          Array.isArray(subjectData)
            ? subjectData
            : [];

        setSubjects(
          subjectList
        );
      }

      // ----------------------------------------------
      // 3. API RETURNS SUBJECT NAME
      //
      // Example:
      // test.subject = "Political Science"
      //
      // Find:
      // "Political Science"
      //       ↓
      // UUID
      // ----------------------------------------------

      const subjectObject =
        subjectList.find(
          (subject) =>
            subject.name.trim()
              .toLowerCase() ===
            String(
              test.subject || ""
            )
              .trim()
              .toLowerCase()
        );

      if (!subjectObject) {
        throw new Error(
          `Subject "${test.subject}" was not found.`
        );
      }

      const subjectId =
        subjectObject.id;

      console.log(
        "✅ SUBJECT NAME:",
        test.subject
      );

      console.log(
        "✅ SUBJECT ID:",
        subjectId
      );

      // ----------------------------------------------
      // 4. SET BASIC TEST VALUES
      // ----------------------------------------------

      setValue(
        "name",
        test.name || ""
      );

      setValue(
        "subject",
        subjectId
      );

      setValue(
        "type",
        test.type || ""
      );

      setValue(
        "difficulty",
        test.difficulty || ""
      );

      setValue(
        "correct_marks",
        Number(
          test.correct_marks ?? 4
        )
      );

      setValue(
        "wrong_marks",
        Number(
          test.wrong_marks ?? -1
        )
      );

      setValue(
        "unattempt_marks",
        Number(
          test.unattempt_marks ?? 0
        )
      );

      setValue(
        "total_time",
        Number(
          test.total_time ?? 60
        )
      );

      setValue(
        "total_marks",
        Number(
          test.total_marks ?? 40
        )
      );

      setValue(
        "total_questions",
        Number(
          test.total_questions ?? 10
        )
      );

      // ----------------------------------------------
      // 5. LOAD TOPICS USING SUBJECT UUID
      // ----------------------------------------------

      setLoadingTopics(true);

      const topicData =
        await getTopicsBySubject(
          subjectId
        );

      const topicList =
        Array.isArray(topicData)
          ? topicData
          : [];

      console.log(
        "📚 TOPICS FOR EDIT:",
        topicList
      );

      setTopics(
        topicList
      );

      // ----------------------------------------------
      // 6. API RETURNS TOPIC NAMES
      //
      // Example:
      // ["Political Theory"]
      //
      // Convert:
      // Political Theory
      //       ↓
      // topic UUID
      // ----------------------------------------------

      const testTopicNames =
        Array.isArray(test.topics)
          ? test.topics
          : [];

      const selectedTopicIds =
        testTopicNames
          .map(
            (topicName: string) => {
              const topic =
                topicList.find(
                  (item) =>
                    item.name
                      .trim()
                      .toLowerCase() ===
                    String(topicName)
                      .trim()
                      .toLowerCase()
                );

              if (!topic) {
                console.warn(
                  "⚠️ TOPIC NOT FOUND:",
                  topicName
                );

                return null;
              }

              return topic.id;
            }
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          );

      console.log(
        "✅ TEST TOPIC NAMES:",
        testTopicNames
      );

      console.log(
        "✅ TEST TOPIC IDS:",
        selectedTopicIds
      );

      setValue(
        "topics",
        selectedTopicIds
      );

      setLoadingTopics(false);

      // ----------------------------------------------
      // 7. LOAD SUB TOPICS USING TOPIC UUIDS
      // ----------------------------------------------

      let subTopicList:
        SubTopic[] = [];

      if (
        selectedTopicIds.length > 0
      ) {
        setLoadingSubTopics(true);

        const subTopicData =
          await getSubTopicsByTopics(
            selectedTopicIds
          );

        subTopicList =
          Array.isArray(
            subTopicData
          )
            ? subTopicData
            : [];

        console.log(
          "📚 SUB TOPICS FOR EDIT:",
          subTopicList
        );

        setSubTopics(
          subTopicList
        );
      } else {
        setSubTopics([]);
      }

      // ----------------------------------------------
      // 8. API RETURNS SUB-TOPIC NAMES
      //
      // Example:
      // ["Socialism"]
      //
      // Convert:
      // Socialism
      //    ↓
      // sub-topic UUID
      // ----------------------------------------------

      const testSubTopicNames =
        Array.isArray(
          test.sub_topics
        )
          ? test.sub_topics
          : [];

      const selectedSubTopicIds =
        testSubTopicNames
          .map(
            (
              subTopicName: string
            ) => {
              const subTopic =
                subTopicList.find(
                  (item) =>
                    item.name
                      .trim()
                      .toLowerCase() ===
                    String(
                      subTopicName
                    )
                      .trim()
                      .toLowerCase()
                );

              if (!subTopic) {
                console.warn(
                  "⚠️ SUB TOPIC NOT FOUND:",
                  subTopicName
                );

                return null;
              }

              return subTopic.id;
            }
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          );

      console.log(
        "✅ TEST SUB TOPIC NAMES:",
        testSubTopicNames
      );

      console.log(
        "✅ TEST SUB TOPIC IDS:",
        selectedSubTopicIds
      );

      setValue(
        "sub_topics",
        selectedSubTopicIds
      );

      console.log(
        "🎯 EDIT FORM HYDRATED:",
        {
          subjectId,
          selectedTopicIds,
          selectedSubTopicIds,
        }
      );
    } catch (error: any) {
      console.error(
        "❌ EDIT TEST ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load test for editing."
      );
    } finally {
      setLoadingTest(false);
      setLoadingTopics(false);
      setLoadingSubTopics(false);

      // ----------------------------------------------
      // VERY IMPORTANT:
      // Allow normal user changes now.
      // ----------------------------------------------

      hydratingEdit.current = false;
    }
  };

  // ==================================================
  // SUBMIT
  // ==================================================

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
    /*
     * IMPORTANT:
     *
     * The UI uses "full_length", but the
     * database does not accept that value.
     *
     * Convert the frontend value to the
     * backend/database value here.
     */
    const testType =
      data.type === "full_length"
        ? "full"
        : data.type;

    const payload: CreateTestPayload = {
      name:
        data.name.trim(),

      type:
        testType,

      subject:
        data.subject,

      topics:
        data.topics,

      sub_topics:
        data.sub_topics,

      correct_marks:
        Number(
          data.correct_marks
        ),

      wrong_marks:
        Number(
          data.wrong_marks
        ),

      unattempt_marks:
        Number(
          data.unattempt_marks
        ),

      difficulty:
        data.difficulty,

      total_time:
        Number(
          data.total_time
        ),

      total_marks:
        Number(
          data.total_marks
        ),

      total_questions:
        Number(
          data.total_questions
        ),

      status:
        "draft",
    };

    console.log(
      "📦 FINAL CREATE/UPDATE PAYLOAD:",
      payload
    );

    // ----------------------------------------------
    // EDIT
    // ----------------------------------------------

    if (isEditMode && testId) {
      console.log(
        "✏️ UPDATING TEST:",
        testId
      );

      const updatedTest =
        await updateTest(
          testId,
          payload
        );

      console.log(
        "✅ UPDATED TEST:",
        updatedTest
      );

      sessionStorage.setItem(
        "currentTestId",
        testId
      );

      navigate(
        `/tests/${testId}/preview`
      );

      return;
    }

    // ----------------------------------------------
    // CREATE
    // ----------------------------------------------

    console.log(
      "🚀 CREATING TEST"
    );

    const test =
      await createTest(
        payload
      );

    console.log(
      "✅ CREATED TEST:",
      test
    );

    if (!test?.id) {
      throw new Error(
        "Test created but test ID was not returned."
      );
    }

    sessionStorage.setItem(
      "currentTestId",
      test.id
    );

    navigate(
      `/tests/${test.id}/questions`
    );

  } catch (error: any) {
    console.error(
      "❌ SAVE TEST ERROR:",
      error
    );

    console.error(
      "SERVER RESPONSE:",
      error?.response?.data
    );

    setApiError(
      error?.response?.data?.message ||
        "Failed to save test. Please try again."
    );

  } finally {
    setSubmitLoading(false);
  }
};

  // ==================================================
  // VALIDATION ERROR
  // ==================================================

  const onValidationError = (
    formErrors: typeof errors
  ) => {
    console.log(
      "❌ FORM VALIDATION ERRORS:",
      formErrors
    );
  };

  // ==================================================
  // LOADING EDIT TEST
  // ==================================================

  if (
    isEditMode &&
    loadingTest
  ) {
    return (
      <main className="create-test-page">
        <div className="create-test-container">
          <div className="loading-state">
            Loading test...
          </div>
        </div>
      </main>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="create-test-page">
      <div className="create-test-container">

        {/* HEADER */}

        <div className="create-test-header">
          <div>
            <h1>
              {isEditMode
                ? "Edit Test"
                : "Create New Test"}
            </h1>

            <p>
              {isEditMode
                ? "Update test details before managing questions."
                : "Add test details before adding questions."}
            </p>
          </div>
        </div>

        {/* ERROR */}

        {apiError && (
          <div className="api-error">
            {apiError}
          </div>
        )}

        {/* FORM */}

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
                    loadingSubjects ||
                    loadingTest
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
                      {subTopic.name}
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
                navigate(
                  isEditMode && testId
                    ? `/tests/${testId}/preview`
                    : "/dashboard"
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                submitLoading ||
                loadingTest
              }
            >
              {submitLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Test"
                  : "Save & Add Questions"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}