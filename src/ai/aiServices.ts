import groq from "./llm";
import { PROMPTS } from "./prompts";
import {
  GenerateAnswerRequest,
  ImproveQuestionRequest,
  ImproveQuestionResponse,
} from "./aiTypes";

class AIService {
  private async askAI(systemPrompt: string, userPrompt: string) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return completion.choices[0].message.content ?? "";
  }

  async generateAnswer(data: GenerateAnswerRequest) {
    const userPrompt = `
    A developer has posted the following programming question.

    Question Title:
    ${data.title}

    Question Description:
    ${data.description}

    Tags:
    ${data.tags.length > 0 ? data.tags.join(", ") : "None"}

    Please provide a helpful, accurate, and well-structured answer.

    Requirements:
    - Answer according to the technologies mentioned in the question and tags.
    - If the tags are missing, infer the technology from the title and description.
    - Explain your solution clearly.
    - Include code examples only when necessary.
    - Recommend best practices.
    - Mention common mistakes if they are relevant.
    - If the question is ambiguous or lacks important details, clearly mention your assumptions before answering.
    `;

    return this.askAI(PROMPTS.answer, userPrompt);
  }

  async improveQuestion(
    data: ImproveQuestionRequest,
  ): Promise<ImproveQuestionResponse> {
    const userPrompt = `
    A developer wants to improve the following programming question.

    Title:
    ${data.title}

    Description:
    ${data.description}

    Please improve it following the system instructions.
    `;

    const response = await this.askAI(PROMPTS.improveQuestion, userPrompt);

    try {
      const parsed = JSON.parse(response);

      return parsed as ImproveQuestionResponse;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async generateTitle(description: string) {
    return this.askAI(PROMPTS.generateTitle, description);
  }

  async generateTags(description: string) {
    return this.askAI(PROMPTS.generateTags, description);
  }

  async explainCode(code: string) {
    return this.askAI(PROMPTS.explainCode, code);
  }
}

export default new AIService();
