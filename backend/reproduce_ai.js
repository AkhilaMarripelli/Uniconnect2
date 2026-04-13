
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GROK_API_KEY;

const rawText = "what is binary tree and what is cloud";

const prompt = `
  Analyze the following interview experience and extract EVERY technical question or topic asked.
  
  CRITICAL INSTRUCTIONS:
  1. Extract specific coding problems (e.g., "reverse a string", "find count of a word") as distinct questions.
  2. If questions are listed in parentheses like "basic dsa questions (reverse a string, linked list reversal)", extract EACH one separately.
  3. Identify ALL relevant subjects (DSA, DBMS, OS, CN, OOP, Java, Python, React, System Design, HR, etc.) for each question.
  4. Ignore general statements like "asked about my project" unless a specific technical question is mentioned.
  
  Return ONLY a valid JSON object with this structure:
  {
    "results": [
      { "questionText": "Reverse a string", "subjects": ["DSA", "Java"], "confidence": 0.95 },
      { "questionText": "Find the count of a word in a file", "subjects": ["DSA", "File Handling"], "confidence": 0.90 },
      { "questionText": "Explain ACID properties", "subjects": ["DBMS"], "confidence": 0.98 }
    ]
  }

  Experience Text:
  "${rawText}"
`;

console.log("Analyzing...");

try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant", // Fast and capable model on Groq
            messages: [
                { role: "system", content: "You are a precise data extraction assistant. You only output valid JSON." },
                { role: "user", content: prompt },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" } // Groq supports JSON mode
        }),
    });

    if (!response.ok) {
        console.error("Error:", await response.text());
        process.exit(1);
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    const content = data.choices[0]?.message?.content;
    const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(jsonString);
    console.log("Parsed:", parsedData);

} catch (e) {
    console.error(e);
}
