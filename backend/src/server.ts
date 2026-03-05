import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()

const app = express()
const port = 5000

app.use(cors())
app.use(express.json({ limit: "20mb" }))

const client = new OpenAI({
 baseURL: "https://openrouter.ai/api/v1",
 apiKey: process.env.OPENROUTER_API_KEY
})

app.post("/extract-invoice", async (req, res) => {
 try {

  const { image } = req.body

  if (!image) {
   return res.status(400).json({ error: "Image missing" })
  }

  const completion = await client.chat.completions.create({
   model: "qwen/qwen-2-vl-7b-instruct",
   messages: [
    {
     role: "user",
     content: [
      {
       type: "text",
       text: `
Extract invoice table items.

Return JSON only:

{
 "items":[
   {
    "description":"item name",
    "quantity":number,
    "unit_price":number,
    "total":number
   }
 ]
}
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
  })

  const raw = completion.choices?.[0]?.message?.content || ""

  const clean = raw
   .replace(/```json/g, "")
   .replace(/```/g, "")
   .trim()

  let data

  try {
   data = JSON.parse(clean)
  } catch {
   return res.status(500).json({
    error: "AI returned invalid JSON",
    raw: clean
   })
  }

  res.json(data)

 } catch (err: any) {

  res.status(500).json({
   error: "Extraction failed",
   details: err.message
  })

 }
})

app.listen(port, () => {
 console.log("Server running on http://localhost:5000")
})