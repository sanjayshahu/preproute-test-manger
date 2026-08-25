import api from "./client";
import type {
  Topic,
  SubTopic,
} from "../types/topic";

interface TopicsResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: Topic[];
}

interface SubTopicsResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: SubTopic[];
}

export const getTopicsBySubject = async (
  subjectId: string
): Promise<Topic[]> => {
  const response = await api.get<TopicsResponse>(
    `/topics/subject/${subjectId}`
  );

  console.log(
    "TOPICS RESPONSE:",
    response.data
  );

  return response.data.data;
};

export const getSubTopicsByTopics = async (
  topicIds: string[]
): Promise<SubTopic[]> => {
  const response = await api.post<SubTopicsResponse>(
    "/sub-topics/multi-topics",
    {
      topicIds,
    }
  );

  console.log(
    "SUB TOPICS RESPONSE:",
    response.data
  );

  return response.data.data;
};