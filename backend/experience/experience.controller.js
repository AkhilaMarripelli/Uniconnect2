import Experience from "./experience.model.js";
import fetch from "node-fetch";
import ExtractedQuestion from "./extractedQuestion.model.js";


export const createExperience = async (req, res) => {
  try {
    const { companyName, rawText } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: "Experience text is required" });
    }

    const experience = new Experience({
      authorRollNo: req.user.rollNo,
      companyName,
      rawText,
    });

    await experience.save();

    // 🔵 ASYNC ML CALL (DO NOT AWAIT)
    triggerMLProcessing(experience);

    res.status(201).json({
      message: "Experience submitted successfully",
      experienceId: experience._id,
    });
  } catch (error) {
    console.error("Create Experience Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMyExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      authorRollNo: req.user.rollNo,
    }).sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error("Fetch Experiences Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const triggerMLProcessing = async (experience) => {
  try {
    const apiKey = process.env.GROK_API_KEY; // Keeping the env var name same for simplicity, though it contains a Groq key
    if (!apiKey) {
      console.warn("⚠️ API Key is not set. Skipping AI processing.");
      return;
    }

    console.log(`🤖 Triggering AI (Groq) for experience: ${experience._id}`);

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
"${experience.rawText}"
    `;

    // Using Groq API (compatible with OpenAI format)
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
      const errText = await response.text();
      console.error("❌ Grok API error:", errText);
      return;
    }

    const data = await response.json();
    console.log("🤖 Grok Raw Response:", JSON.stringify(data, null, 2));

    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("❌ No content received from Grok");
      return;
    }

    // Attempt to parse JSON (handling potential markdown code blocks)
    const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("🤖 Cleaned JSON String:", jsonString);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("❌ Failed Content:", content);
      return;
    }

    if (!parsedData.results || !Array.isArray(parsedData.results)) {
      console.error("❌ Invalid JSON structure from Grok:", content);
      return;
    }

    for (const item of parsedData.results) {
      await ExtractedQuestion.create({
        experienceId: experience._id,
        authorRollNo: experience.authorRollNo,
        companyName: experience.companyName,
        questionText: item.questionText,
        subjects: item.subjects || [item.subject], // Handle both new array and legacy single string if AI slips
        confidenceScore: item.confidence,
      });
      console.log(`📌 Extracted: [${item.subjects?.join(", ")}] ${item.questionText}`);
    }

    console.log("✅ AI processing completed for", experience._id);

  } catch (err) {
    console.error("❌ AI Service Failed:", err);
  }
};

// Function to fetch all experiences (with optional company filter)
export const getAllExperiences = async (req, res) => {
  try {
    const { company } = req.query;
    const query = {};

    if (company) {
      query.companyName = { $regex: company, $options: "i" };
    }

    const experiences = await Experience.find(query).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error("Fetch All Experiences Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchExtractedQuestions = async (req, res) => {
  try {
    const { subject, company } = req.query;

    if (!subject && !company) {
      return res.status(400).json({ message: "Please provide a subject or company name to search." });
    }

    const query = {};

    if (subject) {
      query.$or = [
        { subjects: subject }, // Search in new array
        { subject: subject }   // Search in old string field (backward compatibility)
      ];
    }

    if (company) {
      // Case-insensitive search for company
      query.companyName = { $regex: company, $options: "i" };
    }

    const results = await ExtractedQuestion.find(query)
      .sort({ confidenceScore: -1, createdAt: -1 })
      .limit(50);

    res.json(results);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



