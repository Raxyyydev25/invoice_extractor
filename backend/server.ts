import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

app.post("/extract-invoice", async (req: Request, res: Response): Promise<any> => {
  try {
    const { image } = req.body;
    const response = await client.chat.completions.create({
      model: "qwen/qwen-2-vl-7b-instruct",
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Act as a 1:1 Mirror OCR. Extract EVERY detail from the invoice image.
              
              STRICT MAPPING:
              1. 'metadata': Find 'From/Vendor', 'Bill To/Customer', 'Invoice Number', and 'Date'.
              2. 'items': Every row in the main table (Description, Qty, Rate, Amount).
              3. 'summary_rows': Every row below the table (Subtotal, GST, Tax, Shipping, Benefits).
              4. 'grand_total': The final "Total Amount Due" figure.
              
              JSON OUTPUT:
              {
                "metadata": { "vendor": "string", "customer": "string", "invoice_no": "string", "date": "string" },
                "items": [{ "description": "string", "qty": "string", "rate": "string", "total": "string" }],
                "summary_rows": [{ "label": "string", "value": "string" }],
                "grand_total": "string"
              }`
            },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ]
    });

    const content = response.choices?.[0]?.message?.content || "";
    const cleanJson = content.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (err) {
    res.status(500).json({ error: "Mirroring failed" });
  }
});

app.listen(5000, () => console.log("Mirror Engine: Port 5000"));