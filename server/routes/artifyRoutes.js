import express from "express";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import "dotenv/config";

const router = express.Router();

console.log("Artify routes loaded");

// Helper: Hugging Face API (Free and reliable)
async function callHuggingFaceAPI(prompt) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  if (response.status === 429) throw new Error("quota_exceeded");

  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return { photo: base64 };
}

// Helper: Gemini API for image generation
async function callGeminiAPI(prompt) {
  try {
    const API_KEY = process.env.GEMINI_IMAGE;
    if (!API_KEY) {
      console.error(
        "GEMINI_API_KEY is not set. Please create a .env file with your API key."
      );
      throw new Error("GEMINI_API_KEY is not set.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
    });

    console.log("Generating image with prompt:", prompt);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const response = result.response;
    let generatedImageBuffer = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // This part contains image data (base64)
        generatedImageBuffer = part.inlineData.data;
        break;
      }
    }

    if (generatedImageBuffer) {
      return { photo: generatedImageBuffer };
    } else {
      throw new Error("No image data found in the response.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Gemini image generation failed: " + error.message);
  }
}

// Main route
router.route("/").post(async (req, res) => {
  const { prompt } = req.body;

  try {
    let result;

    // Try Hugging Face first (more reliable)
    if (process.env.HF_API_KEY) {
      try {
        result = await callHuggingFaceAPI(prompt);
        res.status(200).json(result);
        return;
      } catch (err) {
        console.log("Hugging Face failed, trying Gemini...");
      }
    }

    // Try Gemini as fallback
    if (process.env.GEMINI_IMAGE) {
      try {
        result = await callGeminiAPI(prompt);
        res.status(200).json(result);
        return;
      } catch (err) {
        console.log("Gemini failed...");
      }
    }

    // If no API keys or both failed
    throw new Error(
      "No valid API keys found. Please add HF_API_KEY or GEMINI_IMAGE to .env file"
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
});

export default router;
