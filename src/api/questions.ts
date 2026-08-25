
import api from "./client";
import type { QuestionPayload } from "../types/question";

export interface BulkQuestionsPayload {
  questions: QuestionPayload[];
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

