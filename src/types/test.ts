export interface Test {
  id: string;
  name: string;
  type: string;

  subject: string;

  topics: string[];
  sub_topics: string[];

  questions: string[];

  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;

  difficulty: "easy" | "medium" | "hard" | string;

  total_marks: number;
  total_time: number;
  total_questions: number;

  slot: string | null;
  hidden_from_moderator: boolean | null;

  created_by: number;
  created_at: string;

  updated_by: number;
  updated_at: string;

  paragraph_question: string | null;

  status: string;

  scheduled_date: string | null;
  expiry_date: string | null;
}

export interface TestsResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: Test[];
}

export interface CreateTestFormData {
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  difficulty: string;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  total_time: number;
  total_marks: number;
}