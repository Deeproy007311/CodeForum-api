import questionModel from "../../question/questionModel";

interface SearchSimilarQuestionsInput {
  query: string;
  tags?: string[];
}

export interface SimilarQuestionResult {
  id: string;
  title: string;
  description: string;
  tags: string[];
  isSolved: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}

export const searchSimilarQuestions = async (
  input: SearchSimilarQuestionsInput,
): Promise<SimilarQuestionResult[]> => {
  const query = input.query.trim();

  if (!query) {
    return [];
  }

  const normalizedTags = (input.tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  const searchWords = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9#+.]/g, ""))
    .filter((word) => word.length >= 4)
    .filter(
      (word) =>
        ![
          "with",
          "from",
          "that",
          "this",
          "when",
          "what",
          "does",
          "work",
          "showing",
          "using",
          "please",
          "help",
        ].includes(word),
    )
    .slice(0, 6);

  const textConditions = searchWords.map((word) => ({
    $or: [
      {
        title: {
          $regex: word,
          $options: "i",
        },
      },
      {
        description: {
          $regex: word,
          $options: "i",
        },
      },
    ],
  }));

  const filter: Record<string, unknown> = {};

  if (textConditions.length > 0) {
    filter.$and = textConditions;
  }

  if (normalizedTags.length > 0) {
    filter.tags = {
      $in: normalizedTags,
    };
  }

  const questions = await questionModel
    .find(filter)
    .select("_id title description tags isSolved upvotes downvotes createdAt")
    .sort({
      isSolved: -1,
      upvotes: -1,
      createdAt: -1,
    })
    .limit(5)
    .lean();

  return questions.map((question) => ({
    id: question._id.toString(),
    title: question.title,
    description: question.description,
    tags: question.tags,
    isSolved: question.isSolved,
    upvotes: question.upvotes,
    downvotes: question.downvotes,
    createdAt: question.createdAt,
  }));
};
