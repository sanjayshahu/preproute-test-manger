export interface QuestionFormValues {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option:
    | "option1"
    | "option2"
    | "option3"
    | "option4";
  explanation: string;
  difficulty: string;
}

export interface QuestionPayload {
  type: "mcq";
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option:
    | "option1"
    | "option2"
    | "option3"
    | "option4";
  explanation: string;
  difficulty: string;
  subject: string;
  test_id: string;
}