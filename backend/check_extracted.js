
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExtractedQuestion from "./experience/extractedQuestion.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

import fs from "fs";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);

        // Sort by createdAt descending to get the latest 20 items (more coverage)
        const questions = await ExtractedQuestion.find({}).sort({ createdAt: -1 }).limit(20);

        let output = `Found ${questions.length} extracted questions.\n\n`;
        questions.forEach(q => {
            output += `[${q.subject}] ${q.questionText} (Score: ${q.confidenceScore || 'N/A'})\n`;
        });

        fs.writeFileSync("verification_results.txt", output, "utf-8");
        console.log("Written to verification_results.txt");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
