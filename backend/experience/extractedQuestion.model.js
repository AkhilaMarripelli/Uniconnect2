import mongoose from "mongoose";

const extractedQuestionSchema = new mongoose.Schema(
  {
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
      index: true,
    },

    authorRollNo: {
      type: String,
      required: true,
      index: true,
    },

    companyName: {
      type: String,
      default: "",
    },

    questionText: {
      type: String,
      required: true,
    },

    subjects: {
      type: [String],
      required: true,
      index: true,
    },

    confidenceScore: {
      type: Number,
    },
  },
  { timestamps: true }
);

/* 🔹 ADD INDEXES HERE */
extractedQuestionSchema.index({ companyName: 1 });
extractedQuestionSchema.index({ confidenceScore: -1 });

const ExtractedQuestion = mongoose.model(
  "ExtractedQuestion",
  extractedQuestionSchema
);

export default ExtractedQuestion;
