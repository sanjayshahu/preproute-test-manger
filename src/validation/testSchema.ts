import { z } from "zod";

export const testSchema = z.object({
  name: z
    .string()
    .min(1, "Test name is required")
    .min(3, "Test name must be at least 3 characters"),

  subject: z
    .string()
    .min(1, "Please select a subject"),

  type: z
    .string()
    .min(1, "Please select test type"),

  topics: z
    .array(z.string())
    .min(1, "Select at least one topic"),

  sub_topics: z
    .array(z.string())
    .min(1, "Select at least one sub-topic"),

  difficulty: z
    .string()
    .min(1, "Please select difficulty"),

  correct_marks: z
    .number()
    .min(0, "Marks cannot be negative"),

  wrong_marks: z
    .number(),

  unattempt_marks: z
    .number()
    .min(0, "Marks cannot be negative"),

  total_time: z
    .number()
    .min(1, "Total time must be greater than 0"),

  total_marks: z
    .number()
    .min(1, "Total marks must be greater than 0"),

    total_questions: z
  .number()
  .int("Number of questions must be a whole number")
  .positive("Number of questions must be greater than 0"),
});

export type TestFormValues = z.infer<
  typeof testSchema
>;