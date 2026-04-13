import React from "react";

/**
 * ExplainabilityView
 * Renders complaint text with two visual layers:
 *   - Red background highlight: words found in the offensive lexicon
 *   - Orange underline + tooltip: tokens with high SHAP score
 *
 * Props:
 *   text        {string}  - original complaint text
 *   lexiconHits {Array}   - [{word, start, end}]
 *   shapTokens  {Array}   - [{token, shap_score}]
 */
const ExplainabilityView = ({ text, lexiconHits = [], shapTokens = [] }) => {
    React.useEffect(() => {
        if (text && shapTokens.length > 0) {
            console.log("--- Grievance AI Analysis (SHAP Scores) ---");
            console.log("Original Text:", text);
            console.log("Token Scores:", shapTokens);
        }
    }, [text, shapTokens]);

    if (!text) return null;

    // Build lookup sets for fast matching
    const lexiconWords = new Set(lexiconHits.map((h) => h.word.toLowerCase()));

    /**
     * Aggregate SHAP scores for subwords (e.g., "clash" + "##ing" -> "clashing")
     * BERT tokenizes "clashing" as "clash", "##ing". 
     * This logic sums their scores to show word-level contribution.
     */
    const wordShapMap = {};
    let currentWord = "";
    let currentScore = 0;

    shapTokens.forEach(({ token, shap_score }) => {
        if (token.startsWith("##")) {
            currentWord += token.replace("##", "");
            currentScore += shap_score;
        } else {
            if (currentWord) wordShapMap[currentWord.toLowerCase()] = currentScore;
            currentWord = token;
            currentScore = shap_score;
        }
    });
    if (currentWord) wordShapMap[currentWord.toLowerCase()] = currentScore;

    // Tokenize text into segments preserving spaces/punctuation
    const segments = [];
    const regex = /(\w+|\W+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        segments.push(match[1]);
    }

    const getStyle = (word) => {
        const lower = word.toLowerCase();
        const inLexicon = lexiconWords.has(lower);

        // Find aggregate SHAP score (exact match or prefix match for subword cases)
        const shapScore = wordShapMap[lower] || 0;
        const highShap = shapScore > 0.05;

        let bg = "";
        let underline = "";
        let fontWeight = "";

        if (inLexicon) {
            bg = "bg-red-100 text-red-800 rounded px-0.5 shadow-sm";
            fontWeight = "font-bold";
        }
        if (highShap) {
            underline = "underline decoration-orange-500 decoration-wavy decoration-2 underline-offset-4";
            fontWeight = "font-bold";
        }

        return { bg, underline, fontWeight, inLexicon, shapScore, highShap };
    };

    return (
        <div className="space-y-6">
            {/* Highlighted Text */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 leading-[2] text-slate-800 text-base shadow-inner">
                {segments.map((segment, i) => {
                    if (!/\w/.test(segment)) return <span key={i} className="text-slate-400">{segment}</span>;

                    const { bg, underline, fontWeight, inLexicon, shapScore, highShap } = getStyle(segment);

                    return (
                        <span
                            key={i}
                            className={`${bg} ${underline} ${fontWeight} cursor-help transition-all duration-200 hover:brightness-95 relative group`}
                        >
                            {segment}
                            {/* Tooltip */}
                            {(inLexicon || highShap) && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col items-center z-50 pointer-events-none scale-in-center">
                                    <span className="bg-slate-900/95 backdrop-blur text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl border border-white/20">
                                        <div className="flex flex-col gap-1">
                                            {inLexicon && <span className="flex items-center gap-1.5"><span className="text-red-400">●</span> Found in Lexicon</span>}
                                            {highShap && <span className="flex items-center gap-1.5"><span className="text-orange-400">●</span> SHAP Influence: {shapScore.toFixed(3)}</span>}
                                        </div>
                                    </span>
                                    <span className="w-2 h-2 bg-slate-900/95 rotate-45 -mt-1 shadow-lg" />
                                </span>
                            )}
                        </span>
                    );
                })}
            </div>

            {/* Legend & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-300 ring-2 ring-red-50" />
                        <span>Lexicon Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-1 bg-orange-500 rounded-full shadow-sm" />
                        <span>Model Logic (SHAP)</span>
                    </div>
                </div>

                {shapTokens.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Top Driver:</span>
                        <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm font-bold text-slate-700">
                            {[...shapTokens].sort((a, b) => b.shap_score - a.shap_score)[0].token.replace("##", "")} ({Math.max(...shapTokens.map(t => t.shap_score)).toFixed(2)})
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplainabilityView;
