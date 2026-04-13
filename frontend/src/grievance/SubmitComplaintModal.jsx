import React, { useState } from "react";
import ExplainabilityView from "./ExplainabilityView";
import { submitComplaint } from "./grievanceService";

const LABEL_CONFIG = {
    hate: {
        bg: "bg-red-50 border-red-300",
        badge: "bg-red-100 text-red-700",
        icon: "🚨",
        title: "Hate Speech Detected",
        desc: "This complaint contains language classified as hate speech. It has been flagged for review.",
    },
    offensive: {
        bg: "bg-orange-50 border-orange-300",
        badge: "bg-orange-100 text-orange-700",
        icon: "⚠️",
        title: "Offensive Language Detected",
        desc: "This complaint contains offensive language. Please consider rephrasing if possible.",
    },
    neutral: {
        bg: "bg-green-50 border-green-300",
        badge: "bg-green-100 text-green-700",
        icon: "✅",
        title: "No Offensive Language",
        desc: "Your complaint is clear and appropriate. It has been submitted successfully.",
    },
};

const SubmitComplaintModal = ({ onClose, onSubmitted }) => {
    const [title, setTitle] = useState("");
    const [complaintText, setComplaintText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // grievance doc after submit
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!title.trim() || !complaintText.trim()) {
            setError("Please fill in both title and complaint.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await submitComplaint({ title, complaintText });

            if (data.blocked) {
                setResult({
                    ...data,
                    complaintText: complaintText
                });
            } else {
                setResult(data);
                onSubmitted?.();
            }
        } catch (err) {
            setError(err.error || "Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRephrase = () => {
        setResult(null);
        setError("");
    };

    const labelCfg = result
        ? LABEL_CONFIG[result.analysisResult?.label || "neutral"]
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {result?.blocked ? "Submission Blocked" : "Submit Complaint"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                            AI will analyze for offensive language and explain its decision
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-5">
                    {!result ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Complaint Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Issue with exam scheduling"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Describe Your Complaint
                                </label>
                                <textarea
                                    placeholder="Describe your concern clearly and respectfully..."
                                    value={complaintText}
                                    onChange={(e) => setComplaintText(e.target.value)}
                                    rows={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            )}
                        </>
                    ) : (
                        /* ─── Analysis Result View ─── */
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Status Badge */}
                            <div className={`rounded-2xl border p-4 ${labelCfg.bg}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl">{labelCfg.icon}</span>
                                    <div>
                                        <p className={`font-bold text-sm px-2 py-0.5 rounded-full inline-block ${labelCfg.badge}`}>
                                            {result.analysisResult.label?.toUpperCase()}
                                        </p>
                                        <p className="font-semibold text-slate-800 mt-1">{result.blocked ? "Please Rephrase Your Language" : labelCfg.title}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {result.blocked
                                        ? "Our AI detected offensive language that violates campus policy. Complaints must be respectful to be submitted."
                                        : labelCfg.desc}
                                </p>

                                {/* Confidence scores */}
                                {result.analysisResult.allScores && (
                                    <div className="flex gap-3 mt-3 flex-wrap">
                                        {Object.entries(result.analysisResult.allScores).map(([k, v]) => (
                                            <span key={k} className="text-xs text-slate-500 bg-white/70 rounded-lg px-2 py-1 border border-white">
                                                <span className="font-bold capitalize">{k}</span>: {(v * 100).toFixed(1)}%
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Explainability */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">
                                    AI Explanation — Why was this flagged?
                                </p>
                                <ExplainabilityView
                                    text={result.complaintText}
                                    lexiconHits={result.analysisResult.lexiconHits || []}
                                    shapTokens={result.analysisResult.shapTokens || []}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-all"
                    >
                        {result && !result.blocked ? "Close" : "Cancel"}
                    </button>
                    {result?.blocked && (
                        <button
                            onClick={handleRephrase}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            Rephrase Complaint
                        </button>
                    )}
                    {!result && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                "Submit & Analyze"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitComplaintModal;
