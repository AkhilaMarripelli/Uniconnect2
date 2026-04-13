import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        complaintText: {
            type: String,
            required: true,
            trim: true,
        },
        // AI analysis result stored alongside the complaint
        analysisResult: {
            label: { type: String, enum: ["hate", "offensive", "neutral"], default: "neutral" },
            score: { type: Number, default: 0 },
            allScores: {
                hate: { type: Number, default: 0 },
                offensive: { type: Number, default: 0 },
                neutral: { type: Number, default: 1 },
            },
            // SHAP token attributions: [{token, shap_score}]
            shapTokens: { type: Array, default: [] },
            // Lexicon hits: [{word, start, end}]
            lexiconHits: { type: Array, default: [] },
        },
        status: {
            type: String,
            enum: ["submitted", "under_review", "resolved"],
            default: "submitted",
        },
    },
    { timestamps: true }
);

// Index for efficient student queries
grievanceSchema.index({ studentId: 1, createdAt: -1 });

const Grievance = mongoose.model("Grievance", grievanceSchema);
export default Grievance;
