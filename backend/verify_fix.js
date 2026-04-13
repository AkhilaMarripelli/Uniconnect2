import dotenv from "dotenv";
import mongoose from "mongoose";
import Experience from "./experience/experience.model.js";
import ExtractedQuestion from "./experience/extractedQuestion.model.js";
import { createExperience } from "./experience/experience.controller.js";

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// Create mock request/response
const mockReq = {
    user: { rollNo: "TEST123" },
    body: {
        companyName: "Test Company",
        rawText: "what is binary tree and what is cloud"
    }
};

const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log(`\nResponse Status: ${code}`);
            console.log("Response Data:", data);

            if (data.experienceId) {
                // Wait a few seconds for async AI processing
                console.log("\n⏳ Waiting for AI processing...");
                setTimeout(async () => {
                    const questions = await ExtractedQuestion.find({ experienceId: data.experienceId });
                    console.log("\n📌 Extracted Questions:");
                    questions.forEach(q => {
                        console.log(`  - [${q.subjects.join(", ")}] ${q.questionText} (confidence: ${q.confidenceScore})`);
                    });

                    // Cleanup
                    await Experience.deleteOne({ _id: data.experienceId });
                    await ExtractedQuestion.deleteMany({ experienceId: data.experienceId });
                    console.log("\n🧹 Cleaned up test data");

                    mongoose.connection.close();
                    console.log("✅ Test complete!");
                }, 8000);
            }
        }
    })
};

console.log("🚀 Submitting test experience...");
await createExperience(mockReq, mockRes);
