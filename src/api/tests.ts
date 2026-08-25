import api from "./client";

import type {
  Test,
  TestsResponse,
} from "../types/test";





export interface CreateTestPayload {
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: string | null;
}


export const createTest = async (
  payload: CreateTestPayload
): Promise<Test> => {
  const response = await api.post("/tests", payload);

  return response.data.data;
};



export const getTests = async (): Promise<Test[]> => {
  const response = await api.get<TestsResponse>(
    "/tests"
  );

  return response.data.data;
};

