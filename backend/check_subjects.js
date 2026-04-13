
import mongoose from "mongoose";
import dotenv from "dotenv";
import ExtractedQuestion from "./experience/extractedQuestion.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkSubjects() {
    try {
        await mongoose.connect(MONGO_URI);

        const subjects = await ExtractedQuestion.distinct("subject");
        console.log("Distinct Subjects found:", subjects);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSubjects();
