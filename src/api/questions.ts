
import api from "./client";

import type {
  QuestionPayload,
} from "../types/question";

export interface BulkQuestionsPayload {
  questions: QuestionPayload[];
}

export interface FetchBulkQuestionsPayload {
  question_ids: string[];
}

export const createQuestionsBulk = async (
  payload: BulkQuestionsPayload
) => {
  const response = await api.post(
    "/questions/bulk",
    payload
  );

  return response.data;
};

export const fetchQuestionsBulk = async (
  questionIds: string[]
) => {
  const response = await api.post(
    "/questions/fetchBulk",
    {
      question_ids: questionIds,
    }
  );

  return response.data.data;
};

