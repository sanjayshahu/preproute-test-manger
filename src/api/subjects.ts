import api from "./client";
import type {
  Subject,
  SubjectsResponse,
} from "../types/subject";

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<SubjectsResponse>(
    "/subjects"
  );

  console.log("SUBJECTS RESPONSE:", response.data);

  return response.data.data;
};