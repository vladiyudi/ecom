import OpenAI from "openai";
import {restructureToJson} from "../helpers/restractionJSON";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,});

export async function analyzeImage(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "You have 2 tasks: 1. Describe this garment in a simple phrase, such as 't-shirt with round neck' (Provide only the description, no other text). 2. Determine if outfit is for male or female. Provide only the gender. stracture output in JSON. Example: {\"gender\":\"male\", \"description\":\"t-shirt with round neck\"}" },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    return restructureToJson(response.choices[0].message.content.trim());
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Error analyzing image";
  }
}