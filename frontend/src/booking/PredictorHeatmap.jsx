import React, { useState, useEffect } from 'react';
import { getPeakPrediction } from './bookingService';

export default function PredictorHeatmap({ resourceId }) {
    const [heatmap, setHeatmap] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!resourceId) return;
        const fetchHeatmap = async () => {
            setLoading(true);
            try {
                const data = await getPeakPrediction(resourceId);
                console.log(`[AI Predictor] ARIMA Results for Resource ID ${resourceId}:`, data.heatmap);
                setHeatmap(data.heatmap);
            } catch (err) {
                console.error("Heatmap fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, [resourceId]);

    if (!resourceId) return <div className="text-slate-500 italic p-4">Select a resource to view its peak prediction heatmap.</div>;
    if (loading) return <div className="p-4 animate-pulse">Running ARIMA forecasting model...</div>;
    if (!heatmap || heatmap.length === 0) return <div className="p-4 text-orange-500">Not enough historical data to predict peaks for this resource.</div>;

    // Heatmap is an array of 24 values (0.0 to 1.0)
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-slate-800 mb-2">AI Peak Predictor (ARIMA 24h Forecast)</h3>
            <p className="text-sm text-slate-500 mb-6">Darker colors indicate higher predicted booking probability.</p>
            
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {heatmap.map((value, idx) => {
                    // Create an RGB color scale from Light Yellow/Green to Deep Red based on intensity
                    // Alternatively, use fixed tailwind classes
                    let colorClass = "bg-emerald-50 text-emerald-800 border-emerald-100";
                    if (value > 0.8) colorClass = "bg-rose-500 text-white border-rose-600";
                    else if (value > 0.6) colorClass = "bg-orange-400 text-white border-orange-500";
                    else if (value > 0.4) colorClass = "bg-amber-300 text-amber-900 border-amber-400";
                    else if (value > 0.2) colorClass = "bg-green-300 text-green-900 border-green-400";
                    else if (value > 0.05) colorClass = "bg-emerald-200 text-emerald-900 border-emerald-300";

                    return (
                        <div key={idx} className={`relative group flex flex-col items-center justify-center p-2 rounded-xl border ${colorClass} transition-all hover:scale-110 shadow-sm cursor-help hover:z-10`}>
                            <span className="text-xs font-bold font-mono">{idx}:00</span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-slate-900 text-white text-xs p-2 rounded-lg text-center shadow-xl">
                                Intensity: {(value * 100).toFixed(1)}% <br/>
                                <span className="text-slate-400">ARIMA Predict</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200"></div> Low Demand</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-300 border border-amber-400"></div> Medium</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-rose-500 border border-rose-600"></div> Peak Busiest</span>
            </div>
        </div>
    );
}
