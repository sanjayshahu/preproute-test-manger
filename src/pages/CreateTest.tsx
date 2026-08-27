
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

import AppLayout from "../components/AppLayout";

import "./CreateTest.css";

/**
 * =========================================================
 * UI -> API TYPE MAPPING
 * =========================================================
 */

const TEST_TYPE_API_MAP: Record<string, string> = {
  chapterwise: "chapterwise",
  pyq: "pyq",
  mock_test: "mock_test",
  full_length: "full",
};

/**
 * =========================================================
 * BACKEND -> UI TYPE MAPPING
 * =========================================================
 */

const TEST_TYPE_UI_MAP: Record<string, string> = {
  chapterwise: "chapterwise",
  pyq: "pyq",
  mock_test: "mock_test",
  full: "full_length",
};

export default function CreateTest() {
  const navigate = useNavigate();

  const { testId } = useParams<{
    testId: string;
  }>();

  const isEditMode = Boolean(testId);

  // ==================================================
  // API DATA
  // ==================================================

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [subTopics, setSubTopics] =
    useState<SubTopic[]>([]);

  // ==================================================
  // LOADING
  // ==================================================

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

  // ==================================================
  // ERROR
  // ==================================================

  const [apiError, setApiError] =
    useState("");

  // ==================================================
  // EDIT HYDRATION
  // ==================================================

  const hydratingEdit = useRef(false);

  // ==================================================
  // FORM
  // ==================================================

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

  // ==================================================
  // WATCH
  // ==================================================

  const selectedSubject =
    watch("subject");

  const selectedTopics =
    watch("topics") || [];

  const selectedSubTopics =
    watch("sub_topics") || [];

  const selectedType =
    watch("type");

  // ==================================================
  // LOAD SUBJECTS
  // ==================================================

  useEffect(() => {
    loadSubjects();
  }, []);

  // ==================================================
  // EDIT MODE
  // ==================================================

  useEffect(() => {
    if (!testId) {
      return;
    }

    hydrateEditTest(testId);
  }, [testId]);

  // ==================================================
  // SUBJECT CHANGE
  // ==================================================

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

    loadTopicsForSubject(
      selectedSubject
    );
  }, [
    selectedSubject,
    setValue,
  ]);

  // ==================================================
  // TOPIC CHANGE
  // ==================================================

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

      const data =
        await getSubjects();

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

      setValue(
        "topics",
        [],
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      setValue(
        "sub_topics",
        [],
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      const data =
        await getTopicsBySubject(
          subjectId
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
          [],
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        );

        const data =
          await getSubTopicsByTopics(
            topicIds
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

      const test =
        await getTestById(id);

      console.log(
        "✏️ EDIT TEST RESPONSE:",
        test
      );

      // ----------------------------------------------
      // LOAD SUBJECTS
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
      // FIND SUBJECT
      // ----------------------------------------------

      const subjectObject =
        subjectList.find(
          (subject) =>
            subject.name
              .trim()
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

      // ----------------------------------------------
      // BASIC VALUES
      // ----------------------------------------------

      setValue(
        "name",
        test.name || ""
      );

      setValue(
        "subject",
        subjectId
      );

      // ----------------------------------------------
      // TEST TYPE
      // ----------------------------------------------

      const uiTestType =
        TEST_TYPE_UI_MAP[
          String(test.type || "")
        ] ?? "";

      setValue(
        "type",
        uiTestType
      );

      // ----------------------------------------------
      // DIFFICULTY
      // ----------------------------------------------

      setValue(
        "difficulty",
        test.difficulty || ""
      );

      // ----------------------------------------------
      // MARKING SCHEME
      // ----------------------------------------------

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

      // ----------------------------------------------
      // DURATION
      // ----------------------------------------------

      setValue(
        "total_time",
        Number(
          test.total_time ?? 60
        )
      );

      // ----------------------------------------------
      // TEST LIMITS
      // ----------------------------------------------

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
      // LOAD TOPICS
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

      setTopics(
        topicList
      );

      // ----------------------------------------------
      // TOPIC NAMES -> IDS
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

              return (
                topic?.id ?? null
              );
            }
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          );

      setValue(
        "topics",
        selectedTopicIds
      );

      setLoadingTopics(false);

      // ----------------------------------------------
      // LOAD SUB TOPICS
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

        setSubTopics(
          subTopicList
        );
      } else {
        setSubTopics([]);
      }

      // ----------------------------------------------
      // SUB TOPIC NAMES -> IDS
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

              return (
                subTopic?.id ?? null
              );
            }
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
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
          uiTestType,
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

      hydratingEdit.current = false;
    }
  };

  // ==================================================
  // TOPIC DROPDOWN CHANGE
  // ==================================================

  const handleTopicChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const topicId =
      event.target.value;

    setValue(
      "topics",
      topicId
        ? [topicId]
        : [],
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  // ==================================================
  // SUB TOPIC DROPDOWN CHANGE
  // ==================================================

  const handleSubTopicChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const subTopicId =
      event.target.value;

    setValue(
      "sub_topics",
      subTopicId
        ? [subTopicId]
        : [],
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
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
      // ----------------------------------------------
      // UI -> API TYPE
      // ----------------------------------------------

      const testType =
        TEST_TYPE_API_MAP[
          data.type
        ];

      if (!testType) {
        throw new Error(
          `Invalid test type: ${data.type}`
        );
      }

      // ----------------------------------------------
      // PAYLOAD
      // ----------------------------------------------

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
        "📦 FINAL API PAYLOAD:",
        payload
      );

      // ----------------------------------------------
      // EDIT
      // ----------------------------------------------

      if (
        isEditMode &&
        testId
      ) {
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
          `/tests/${testId}/confirmation`
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
          error?.message ||
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
      <AppLayout componentName="CreateTest">
        <main className="create-test-page">
          <div className="create-test-container">
            <div className="loading-state">
              Loading test...
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <AppLayout componentName="CreateTest">
      <main className="create-test-page">
        <div className="create-test-container">

          {/* ==========================================
              HEADER
          ========================================== */}

          <header className="create-test-header">
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
          </header>

          {/* ==========================================
              API ERROR
          ========================================== */}

          {apiError && (
            <div
              className="api-error"
              role="alert"
            >
              {apiError}
            </div>
          )}

          {/* ==========================================
              FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit(
              onSubmit,
              onValidationError
            )}
          >

            {/* =================================================
                ROW 1 — TEST TYPE
            ================================================= */}

            <section className="form-card">

              <div className="form-field">

                <label>
                  Test Type
                </label>

                <div className="test-type-options">

                  {/* CHAPTERWISE */}

                  <label
                    className={`test-type-badge ${
                      selectedType ===
                      "chapterwise"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="chapterwise"
                      {...register(
                        "type"
                      )}
                    />

                    <span>
                      Chapterwise
                    </span>
                  </label>

                  {/* PYQ */}

                  <label
                    className={`test-type-badge ${
                      selectedType ===
                      "pyq"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="pyq"
                      {...register(
                        "type"
                      )}
                    />

                    <span>
                      PYQ
                    </span>
                  </label>

                  {/* MOCK TEST */}

                  <label
                    className={`test-type-badge ${
                      selectedType ===
                      "mock_test"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      value="mock_test"
                      {...register(
                        "type"
                      )}
                    />

                    <span>
                      Mock Test
                    </span>
                  </label>

                </div>

                {errors.type && (
                  <span className="field-error">
                    {
                      errors.type.message
                    }
                  </span>
                )}

              </div>

            </section>

            {/* =================================================
                ROW 2 — SUBJECT + NAME OF TEST
            ================================================= */}

            <section className="form-card">

              <div className="form-grid">

                {/* SUBJECT */}

                <div className="form-field">

                  <label>
                    Subject
                  </label>

                  <select
                    {...register(
                      "subject"
                    )}
                    disabled={
                      loadingSubjects ||
                      loadingTest
                    }
                  >
                    <option
                      value=""
                      disabled
                    >
                      {loadingSubjects
                        ? "Loading subjects..."
                        : "Choose from Drop-down"}
                    </option>

                    {subjects.map(
                      (subject) => (
                        <option
                          key={
                            subject.id
                          }
                          value={
                            subject.id
                          }
                        >
                          {subject.name}
                        </option>
                      )
                    )}
                  </select>

                  {errors.subject && (
                    <span className="field-error">
                      {
                        errors.subject
                          .message
                      }
                    </span>
                  )}

                </div>

                {/* NAME */}

                <div className="form-field">

                  <label>
                    Name of Test
                  </label>

                  <input
                    type="text"
                    {...register(
                      "name"
                    )}
                    placeholder="Enter name of Test"
                  />

                  {errors.name && (
                    <span className="field-error">
                      {
                        errors.name
                          .message
                      }
                    </span>
                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                ROW 3 — TOPIC + SUB TOPIC
            ================================================= */}

            <section className="form-card">

              <div className="form-grid">

                {/* TOPIC */}

                <div className="form-field">

                  <label>
                    Topic
                  </label>

                  <select
                    value={
                      selectedTopics[0] ||
                      ""
                    }
                    onChange={
                      handleTopicChange
                    }
                    disabled={
                      loadingTopics ||
                      !selectedSubject
                    }
                  >
                    <option
                      value=""
                      disabled
                    >
                      {loadingTopics
                        ? "Loading topics..."
                        : !selectedSubject
                          ? "Select a subject first"
                          : "Choose from Drop-down"}
                    </option>

                    {topics.map(
                      (topic) => (
                        <option
                          key={
                            topic.id
                          }
                          value={
                            topic.id
                          }
                        >
                          {topic.name}
                        </option>
                      )
                    )}
                  </select>

                  {errors.topics && (
                    <span className="field-error">
                      {
                        errors.topics
                          .message
                      }
                    </span>
                  )}

                </div>

                {/* SUB TOPIC */}

                <div className="form-field">

                  <label>
                    Sub Topic
                  </label>

                  <select
                    value={
                      selectedSubTopics[0] ||
                      ""
                    }
                    onChange={
                      handleSubTopicChange
                    }
                    disabled={
                      loadingSubTopics ||
                      selectedTopics.length ===
                        0
                    }
                  >
                    <option
                      value=""
                      disabled
                    >
                      {loadingSubTopics
                        ? "Loading sub-topics..."
                        : selectedTopics.length ===
                            0
                          ? "Select a topic first"
                          : "Choose from Drop-down"}
                    </option>

                    {subTopics.map(
                      (
                        subTopic
                      ) => (
                        <option
                          key={
                            subTopic.id
                          }
                          value={
                            subTopic.id
                          }
                        >
                          {
                            subTopic.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  {errors.sub_topics && (
                    <span className="field-error">
                      {
                        errors
                          .sub_topics
                          .message
                      }
                    </span>
                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                ROW 4 — DURATION + DIFFICULTY
            ================================================= */}

            <section className="form-card">

              <div className="form-grid">

                {/* DURATION */}

                <div className="form-field">

                  <label>
                    Duration (Minutes)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    {...register(
                      "total_time",
                      {
                        setValueAs: (
                          value
                        ) =>
                          value === ""
                            ? undefined
                            : Number(
                                value
                              ),
                      }
                    )}
                    placeholder="Enter the time"
                  />

                  {errors.total_time && (
                    <span className="field-error">
                      {
                        errors.total_time
                          .message
                      }
                    </span>
                  )}

                </div>

                {/* DIFFICULTY */}

                <div className="form-field">

                  <label>
                    Test Difficulty Level
                  </label>

                  <div className="difficulty-options">

                    {/* EASY */}

                    <label className="difficulty-option">

                      <input
                        type="radio"
                        value="easy"
                        {...register(
                          "difficulty"
                        )}
                      />

                      <span>
                        Easy
                      </span>

                    </label>

                    {/* MEDIUM */}

                    <label className="difficulty-option">

                      <input
                        type="radio"
                        value="medium"
                        {...register(
                          "difficulty"
                        )}
                      />

                      <span>
                        Medium
                      </span>

                    </label>

                    {/* DIFFICULT */}

                    <label className="difficulty-option">

                      <input
                        type="radio"
                        value="hard"
                        {...register(
                          "difficulty"
                        )}
                      />

                      <span>
                        Difficult
                      </span>

                    </label>

                  </div>

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

            {/* =================================================
                ROW 5 — MARKING SCHEME
            ================================================= */}

            <section className="form-card">

              <div className="marking-scheme-section">

                <h2>
                  Marking Scheme
                </h2>

                <div className="marking-grid">

                  {/* WRONG ANSWER */}

                  <div className="form-field marking-field">

                    <label>
                      Wrong Answer
                    </label>

                    <input
                      type="number"
                      step="0.5"
                      {...register(
                        "wrong_marks",
                        {
                          valueAsNumber:
                            true,
                        }
                      )}
                      placeholder="-1"
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

                  {/* UNATTEMPTED */}

                  <div className="form-field marking-field">

                    <label>
                      Unattempted
                    </label>

                    <input
                      type="number"
                      step="0.5"
                      {...register(
                        "unattempt_marks",
                        {
                          valueAsNumber:
                            true,
                        }
                      )}
                      placeholder="+0"
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

                  {/* CORRECT ANSWER */}

                  <div className="form-field marking-field">

                    <label>
                      Correct Answer
                    </label>

                    <input
                      type="number"
                      step="0.5"
                      {...register(
                        "correct_marks",
                        {
                          valueAsNumber:
                            true,
                        }
                      )}
                      placeholder="+5"
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

                  {/* NO OF QUESTIONS */}

                  <div className="form-field marking-field">

                    <label>
                      No of Questions
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      {...register(
                        "total_questions",
                        {
                          setValueAs: (
                            value
                          ) =>
                            value === ""
                              ? undefined
                              : Number(
                                  value
                                ),
                        }
                      )}
                      placeholder="Ex: 25 Marks"
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

                  {/* TOTAL MARKS */}

                  <div className="form-field marking-field">

                    <label>
                      Total Marks
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      {...register(
                        "total_marks",
                        {
                          setValueAs: (
                            value
                          ) =>
                            value === ""
                              ? undefined
                              : Number(
                                  value
                                ),
                        }
                      )}
                      placeholder="Ex: 250 Marks"
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

                </div>

              </div>

            </section>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate(
                    isEditMode &&
                    testId
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
                    ? "Save"
                    : "Next"}
              </button>

            </div>

          </form>

        </div>
      </main>
    </AppLayout>
  );
}

