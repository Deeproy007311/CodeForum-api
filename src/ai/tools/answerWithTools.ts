import Groq from "groq-sdk";
import groq from "../llm";
import { PROMPTS } from "../prompts";
import { AI_TOOLS } from "./toolDefinitions";
import { runTool } from "./toolDispatcher";
import { validateAIResponse } from "../validators/responseValidator";
import { GenerateAnswerRequest } from "../aiTypes";

export const generateAnswerWithTools = async (
  data: GenerateAnswerRequest,
): Promise<string> => {
  const userPrompt = `
A developer has posted the following programming question.

Question Title:
${data.title}

Question Description:
${data.description}

Tags:
${data.tags.length > 0 ? data.tags.join(", ") : "None"}

Before answering, check whether searching similar CodeForum questions would improve the answer.

Use search_similar_questions only when relevant existing discussions may help.

If tool results are returned:
- Use them only as supporting context.
- Do not claim a similar question exists unless the tool returned one.
- Mention at most 3 related questions.
- Do not copy their descriptions verbatim.
- Still answer the user's question directly.
`;

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: PROMPTS.answer,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const firstCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages,
    tools: [...AI_TOOLS],
    tool_choice: "auto",
  });

  const firstMessage = firstCompletion.choices[0]?.message;

  if (!firstMessage) {
    throw new Error("AI did not return a response.");
  }

  messages.push(firstMessage);

  const toolCalls = firstMessage.tool_calls ?? [];

  console.log(`🔧 Tool calls requested: ${toolCalls.length}`);

  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") {
      continue;
    }

    console.log(`🔍 Running tool: ${toolCall.function.name}`);
    console.log(`📦 Tool arguments: ${toolCall.function.arguments}`);
    const toolResult = await runTool(
      toolCall.function.name,
      toolCall.function.arguments,
    );

    console.log("📚 Tool result:", JSON.stringify(toolResult, null, 2));

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResult),
    });
  }

  if (toolCalls.length === 0) {
    const directAnswer = firstMessage.content?.trim() ?? "";

    const validation = validateAIResponse(directAnswer);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    return directAnswer;
  }

  const finalCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages,
  });

  const finalAnswer =
    finalCompletion.choices[0]?.message?.content?.trim() ?? "";

  const validation = validateAIResponse(finalAnswer);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return finalAnswer;
};
