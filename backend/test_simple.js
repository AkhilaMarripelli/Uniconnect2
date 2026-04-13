import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GROK_API_KEY;

const rawText = "Reverse a linked list in Python";

const prompt = `
You are an interview experience analyzer.

Your task is to extract meaningful interview questions and asked topics from raw interview experience text.

Important rules:

1. The input may contain messy paragraphs, bullet points, headings, or incomplete sentences.
2. A question does NOT need to contain a '?'.
3. Any concept that was asked by the interviewer must be converted into a proper interview question.
4. Ignore personal discussion unless it is clearly an HR question.
5. Split combined sentences into multiple questions when necessary.
6. Keep each question short and clear.

For every extracted question:

- Convert it into a proper interview question sentence.
- Tag with ALL relevant subjects from this list (use multiple subjects when applicable):
  DSA, OS, DBMS, CN, OOPS, SYSTEM_DESIGN, CLOUD, DEVOPS, FRONTEND, BACKEND, HR, Java, Python, OTHER

IMPORTANT: Tag each question with ALL subjects that apply. For example:
- "Reverse a linked list in Python" → ["DSA", "Python"]
- "Explain ACID properties in MySQL" → ["DBMS"]
- "What is cloud computing?" → ["CLOUD"]
- "Design a scalable web application" → ["SYSTEM_DESIGN", "BACKEND", "CLOUD"]
- "Implement authentication in React" → ["FRONTEND", "BACKEND"]

Return only valid JSON in this format:
{
  "results": [
    { "questionText": "What is polymorphism?", "subjects": ["OOPS"], "confidence": 0.95 },
    { "questionText": "Reverse a linked list", "subjects": ["DSA"], "confidence": 0.90 }
  ]
}

Experience Text:
"${rawText}"
`;

async function test() {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a precise data extraction assistant. You only output valid JSON." },
                { role: "user", content: prompt },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const result = JSON.parse(content);

    console.log(JSON.stringify(result, null, 2));
}

test();
