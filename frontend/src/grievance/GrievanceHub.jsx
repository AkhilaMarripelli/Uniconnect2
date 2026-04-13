import React, { useEffect, useState } from "react";
import SubmitComplaintModal from "./SubmitComplaintModal";
import ExplainabilityView from "./ExplainabilityView";
import { fetchMyComplaints } from "./grievanceService";

const LABEL_BADGE = {
    hate: "bg-red-100 text-red-700 border-red-200",
    offensive: "bg-orange-100 text-orange-700 border-orange-200",
    neutral: "bg-green-100 text-green-700 border-green-200",
};

const LABEL_ICON = { hate: "🚨", offensive: "⚠️", neutral: "✅" };

const GrievanceHub = () => {
    const [open, setOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [expanded, setExpanded] = useState(null);

    const load = async () => {
        try {
            const data = await fetchMyComplaints();
            setComplaints(data);
        } catch {
            console.error("Failed to load complaints");
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent mb-4 tracking-tight">
                        Grievance Hub
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Submit your complaints securely. Our AI detects offensive language
                        and explains its reasoning — transparently.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: "Total", value: complaints.length, color: "text-slate-800" },
                        {
                            label: "Flagged",
                            value: complaints.filter(c => ["hate", "offensive"].includes(c.analysisResult?.label)).length,
                            color: "text-red-600",
                        },
                        {
                            label: "Resolved",
                            value: complaints.filter(c => c.status === "resolved").length,
                            color: "text-green-600",
                        },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                            <p className={`text-3xl font-black ${color}`}>{value}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Complaints List */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Your Complaints</h2>
                        <span className="text-sm text-slate-400 font-medium">{complaints.length} submitted</span>
                    </div>

                    {complaints.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-slate-500 font-medium">No complaints submitted yet.</p>
                            <p className="text-slate-400 text-sm mt-1">Click + to submit your first complaint.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((c) => {
                                const label = c.analysisResult?.label || "neutral";
                                const isExpanded = expanded === c._id;
                                return (
                                    <div
                                        key={c._id}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="p-5 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <h3 className="font-bold text-slate-800 truncate">{c.title}</h3>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LABEL_BADGE[label]}`}>
                                                        {LABEL_ICON[label]} {label.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 capitalize">
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-2">{c.complaintText}</p>
                                                <p className="text-xs text-slate-400 mt-1.5">
                                                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : c._id)}
                                                className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all"
                                            >
                                                {isExpanded ? "Hide" : "View AI Analysis"}
                                            </button>
                                        </div>

                                        {/* Expandable AI Analysis */}
                                        {isExpanded && (
                                            <div className="px-5 pb-5 border-t border-slate-50 pt-4">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                                    AI Explainability
                                                </p>
                                                {/* Confidence */}
                                                {c.analysisResult?.allScores && (
                                                    <div className="flex gap-2 flex-wrap mb-4">
                                                        {Object.entries(c.analysisResult.allScores).map(([k, v]) => (
                                                            <span key={k} className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
                                                                <span className="font-bold capitalize">{k}</span>: {(v * 100).toFixed(1)}%
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <ExplainabilityView
                                                    text={c.complaintText}
                                                    lexiconHits={c.analysisResult?.lexiconHits || []}
                                                    shapTokens={c.analysisResult?.shapTokens || []}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-8 bg-rose-600 text-white w-16 h-16 rounded-full text-3xl flex items-center justify-center shadow-2xl shadow-rose-300/50 hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
                title="Submit Complaint"
            >
                <div className="group-hover:rotate-90 transition-transform duration-300">+</div>
            </button>

            {open && (
                <SubmitComplaintModal
                    onClose={() => { setOpen(false); load(); }}
                    onSubmitted={() => load()}
                />
            )}
        </div>
    );
};

export default GrievanceHub;
