export interface GenerateAnswerRequest {
  title: string;
  description: string;
  tags: string[];
}
export interface ImproveQuestionRequest {
  title: string;
  description: string;
}

export interface ImproveQuestionResponse {
  title: string;
  description: string;
  suggestions: string[];
}
