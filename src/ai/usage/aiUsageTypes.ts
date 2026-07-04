export type AIFeature = "answer" | "improve-question" | "explain-code";

export interface AIUsageDocument {
  user: string;
  month: string;
  answerCount: number;
  improveQuestionCount: number;
  explainCodeCount: number;
  totalRequests: number;
}