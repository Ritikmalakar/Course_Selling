import { GoogleGenAI } from "@google/genai";
import Course from "../models/courseModel.js";

const searchableFields = ["title", "subTitle", "description", "category", "level"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchWithAi(req, res) {
  try {
    const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";

    if (!input || input.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Search query must be between 1 and 500 characters"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI course search is not configured"
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        "Create 3 to 8 concise comma-separated keywords or short phrases for searching an online course catalog.",
        "Return only the keywords, with no explanation.",
        `Search query: ${JSON.stringify(input)}`
      ].join("\n")
    });

    const keywords = typeof response.text === "string"
      ? [...new Set(
        response.text
          .replace(/[\[\]"'`]/g, "")
          .split(/[,;\n]/)
          .map(keyword => keyword.trim().replace(/^[-*•]\s*/, ""))
          .filter(Boolean)
          .map(keyword => keyword.slice(0, 80))
      )].slice(0, 8)
      : [];

    if (keywords.length === 0) {
      return res.status(502).json({
        success: false,
        message: "Unable to generate search keywords"
      });
    }

    const searchConditions = keywords.flatMap(keyword => {
      const regex = new RegExp(escapeRegExp(keyword), "i");
      return searchableFields.map(field => ({ [field]: regex }));
    });

    const recommendation = await Course.find({
      isPublished: true,
      $or: searchConditions
    })
      .select("title subTitle description category level price thumbnail")
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Search completed",
      recommendation
    });
  } catch (error) {
    console.error("AI course search failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to search courses"
    });
  }
}
