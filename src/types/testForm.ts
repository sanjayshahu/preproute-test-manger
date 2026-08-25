export interface CreateTestForm {
  name: string;

  subject: string;

  type: string;

  topics: string[];

  sub_topics: string[];

  difficulty: string;

  correct_marks: number;

  wrong_marks: number;

  unattempt_marks: number;

  total_time: number;

  total_marks: number;
}