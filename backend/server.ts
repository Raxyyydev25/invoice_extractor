import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is missing in .env");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Smart Invoice Extractor"
  }
});

function extractTextContent(content) {
  if (!content) return "";

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text") return part.text || "";
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function safeParseJson(content) {
  const cleaned = String(content || "").replace(/```json|```/gi, "").trim();

  if (!cleaned) {
    throw new Error("Model returned empty content");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error(`Model did not return valid JSON. Raw output: ${cleaned}`);
  }
}

app.post("/extract-invoice", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Image is required" });
    }

    const response = await client.chat.completions.create({
      model: "qwen/qwen2.5-vl-72b-instruct",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You extract invoice data from images. Return only valid JSON. No markdown. No explanations. No code fences."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Extract ONLY what is visible in this invoice image.

Return exactly this JSON structure:
{
  "metadata": {
    "vendor": "",
    "customer": "",
    "invoice_no": "",
    "date": ""
  },
  "detected_columns": [],
  "items": [],
  "summary_rows": [],
  "grand_total": "",
  "raw_text": ""
}

Rules:
1. Do not invent values.
2. Preserve exact table headers if visible.
3. "items" must use the same detected column names.
4. "summary_rows" must be like:
   [{ "label": "", "value": "" }]
5. If no line-item table exists, return empty arrays.
6. "raw_text" should contain OCR-like plain text from the image.
7. Return JSON only.
              `
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ]
    });

    console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));

    const rawContent = extractTextContent(response?.choices?.[0]?.message?.content);
    console.log("RAW MODEL OUTPUT:", rawContent);

    const parsed = safeParseJson(rawContent);

    return res.json({
      metadata: parsed?.metadata || {
        vendor: "",
        customer: "",
        invoice_no: "",
        date: ""
      },
      detected_columns: Array.isArray(parsed?.detected_columns) ? parsed.detected_columns : [],
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      summary_rows: Array.isArray(parsed?.summary_rows) ? parsed.summary_rows : [],
      grand_total: parsed?.grand_total || "",
      raw_text: parsed?.raw_text || ""
    });
  } catch (err) {
    console.error("Extraction error:", err?.message || err);
    return res.status(500).json({
      error: "Mirroring failed",
      details: err?.message || "Unknown server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Mirror Engine running on http://localhost:${PORT}`);
});