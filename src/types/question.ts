export type CorrectOption =
  | "option1"
  | "option2"
  | "option3"
  | "option4";

export interface Question {
  id?: string;
  type: "mcq";
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  test_id: string;
  topic_id?: string;
  sub_topic_id?: string;
  media_url?: string;
}