import groq from "./llm";
import { PROMPTS } from "./prompts";
import { GenerateAnswerRequest } from "./aiTypes";

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
    const prompt = `
    Title:
    ${data.title}

    Description:
    ${data.description}

    Tags:
    ${data.tags.join(", ")}

    Write the best possible Stack Overflow style answer.
    `;

    return this.askAI(PROMPTS.answer, prompt);
  }

  async improveQuestion(question: string) {
    return this.askAI(PROMPTS.improveQuestion, question);
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
