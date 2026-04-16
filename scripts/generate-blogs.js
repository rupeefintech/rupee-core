import fs from "fs"
import path from "path"

// 👉 Replace with your OpenAI key
const API_KEY = "YOUR_API_KEY"

const topic = process.argv[2]

if (!topic) {
  console.log("❌ Please provide a topic")
  process.exit(1)
}

const slug = topic
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")

const prompt = `
Generate a finance blog in JSON format.

Rules:
- Output ONLY valid JSON array
- Use blocks: title, h2, paragraph, info, success, warning, table, list
- Include:
  - 1 title
  - 3 h2 sections
  - 1 table
  - 2 highlight boxes (info/success/warning)
- Keep it simple for Indian audience

Topic: ${topic}
`

async function generate() {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  })

  const data = await res.json()

  const content = data.choices[0].message.content

  const filePath = path.join("public/content", `${slug}.json`)

  fs.writeFileSync(filePath, content)

  console.log(`✅ Blog generated: ${filePath}`)
}

generate()