import fetch from "node-fetch";
import Grievance from "./grievance.model.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─── Submit Complaint ────────────────────────────────────────────────────────
export const submitComplaint = async (req, res) => {
    try {
        const { title, complaintText } = req.body;
        const studentId = req.user.id;

        if (!title || !complaintText) {
            return res.status(400).json({ error: "Title and complaint text are required." });
        }

        // Call ML service for analysis
        let analysisResult = {
            label: "neutral",
            score: 0,
            allScores: { hate: 0, offensive: 0, neutral: 1 },
            shapTokens: [],
            lexiconHits: [],
        };

        try {
            const mlResponse = await fetch(`${ML_SERVICE_URL}/grievance/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: complaintText }),
            });

            if (mlResponse.ok) {
                const mlData = await mlResponse.json();
                analysisResult = {
                    label: mlData.label,
                    score: mlData.score,
                    allScores: mlData.all_scores || {},
                    shapTokens: mlData.shap_tokens || [],
                    lexiconHits: mlData.lexicon_hits || [],
                };
            }
        } catch (mlErr) {
            // ML service unavailable — save complaint anyway without analysis
            console.warn("[Grievance] ML service unreachable:", mlErr.message);
        }

        // Check if offensive — if so, block storage and return "200 OK" with blocked flag
        // (We use 200 instead of 400 to prevent red error logs in the browser console)
        if (analysisResult.label === "hate" || analysisResult.label === "offensive") {
            return res.status(200).json({
                error: "Offensive language detected. Please rephrase your complaint.",
                blocked: true,
                analysisResult: {
                    ...analysisResult,
                    label: analysisResult.label
                }
            });
        }

        const grievance = await Grievance.create({
            studentId,
            title,
            complaintText,
            analysisResult: {
                ...analysisResult,
                label: analysisResult.label
            },
        });

        res.status(201).json(grievance);
    } catch (err) {
        console.error("[Grievance] submitComplaint error:", err);
        res.status(500).json({ error: "Failed to submit complaint." });
    }
};

// ─── Get My Complaints ───────────────────────────────────────────────────────
export const getMyComplaints = async (req, res) => {
    try {
        const grievances = await Grievance.find({ studentId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(grievances);
    } catch (err) {
        console.error("[Grievance] getMyComplaints error:", err);
        res.status(500).json({ error: "Failed to fetch complaints." });
    }
};
