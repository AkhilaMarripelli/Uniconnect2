import React, { useState, useEffect } from 'react';
import { getResources, requestBooking, getMyRequests, getAdminRequests, decideRequest, getOccupiedSlots } from './bookingService';
import PredictorHeatmap from './PredictorHeatmap';

export default function BookingHub() {
    const [activeTab, setActiveTab] = useState('book'); // 'book', 'myRequests', 'admin', 'analytics'
    const [resources, setResources] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [adminRequests, setAdminRequests] = useState([]);
    const [userRole, setUserRole] = useState('student'); // 'student' or 'admin'
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [occupiedSlots, setOccupiedSlots] = useState([]);
    const [eventData, setEventData] = useState({ eventName: '', purpose: '', startTime: '', endTime: '' });
    const [error, setError] = useState('');

    const [branchFilter, setBranchFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        // Fetch user info to determine role
        fetch("http://localhost:5000/api/auth/check", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data && data.user) setUserRole(data.user.role || 'student');
            })
            .catch(console.error);

        fetchResources();
    }, []);

    useEffect(() => {
        if (activeTab === 'myRequests') fetchMyRequests();
        if (activeTab === 'admin' && userRole === 'admin') fetchAdminRequests();
    }, [activeTab]);

    const fetchResources = async () => {
        try { const data = await getResources(); setResources(data); } 
        catch (err) { console.error(err); }
    };

    const fetchMyRequests = async () => {
        try { const data = await getMyRequests(); setMyRequests(data); } 
        catch (err) { console.error(err); }
    };

    const fetchAdminRequests = async () => {
        try { const data = await getAdminRequests(); setAdminRequests(data); } 
        catch (err) { console.error(err); }
    };

    const handleRequestSlot = async (r) => {
        setSelectedResource(r);
        setShowModal(true);
        setError('');
        setEventData({ eventName: '', purpose: '', startTime: '', endTime: '' });
        setOccupiedSlots([]); // Clear previous
        
        try {
            const slots = await getOccupiedSlots(r._id);
            setOccupiedSlots(slots);
        } catch (err) {
            console.error(err);
        }
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await requestBooking({
                resourceId: selectedResource._id,
                ...eventData
            });
            setShowModal(false);
            alert("Booking request submitted successfully! Waiting for admin approval.");
            if (activeTab === 'myRequests') fetchMyRequests();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleAdminDecision = async (id, status, message) => {
        try {
            await decideRequest(id, status, message);
            fetchAdminRequests(); // Refresh
        } catch (err) {
            alert("Error processing decision");
        }
    };

    // Component for Student Requests table
    const renderMyRequests = () => (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
                    <tr>
                        <th className="p-4">Event</th>
                        <th className="p-4">Resource</th>
                        <th className="p-4">Date/Time</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {myRequests.map(r => (
                        <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{r.eventName}</td>
                            <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{r.resourceId?.name}</span></td>
                            <td className="p-4 text-sm text-slate-600">
                                {new Date(r.startTime).toLocaleString()} - {new Date(r.endTime).toLocaleTimeString()}
                            </td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    r.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {r.status.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {myRequests.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No booking requests found.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    // Component for Admin Approvals table
    const renderAdminRequests = () => (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
                    <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Event</th>
                        <th className="p-4">Resource</th>
                        <th className="p-4">Time</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {adminRequests.map(r => (
                        <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-sm font-bold font-mono text-slate-600">{r.studentId?.rollNo}</td>
                            <td className="p-4">
                                <span className="block font-medium text-slate-800">{r.eventName}</span>
                                <span className="block text-xs text-slate-500">{r.purpose}</span>
                            </td>
                            <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{r.resourceId?.name}</span></td>
                            <td className="p-4 text-xs text-slate-600">
                                {new Date(r.startTime).toLocaleString()} <br/>
                                to {new Date(r.endTime).toLocaleTimeString()}
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleAdminDecision(r._id, 'approved', 'Approved automatically')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 shadow-sm">Approve</button>
                                <button onClick={() => handleAdminDecision(r._id, 'rejected', 'Conflict')} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 shadow-sm">Reject</button>
                            </td>
                        </tr>
                    ))}
                    {adminRequests.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 italic">No pending requests for your branch.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const [analyticResId, setAnalyticResId] = useState('');

    // Component for Analytics / Heatmap
    const renderAnalytics = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Resource to Forecast</label>
                    <select 
                        className="w-full sm:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                        value={analyticResId} 
                        onChange={(e) => setAnalyticResId(e.target.value)}
                    >
                        <option value="">-- Choose Resource --</option>
                        {resources.map(r => <option key={r._id} value={r._id}>{r.name} ({r.block})</option>)}
                    </select>
                </div>
                <PredictorHeatmap resourceId={analyticResId} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 font-sans text-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Resource Booking</h1>
                        <p className="text-slate-500 font-medium mt-2">Book classrooms, labs, and monitor peak usage.</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    <button onClick={() => setActiveTab('book')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'book' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>Available Resources</button>
                    <button onClick={() => setActiveTab('myRequests')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'myRequests' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>My Requests</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                        ✨ Peak Predictor (AI)
                    </button>
                    {userRole === 'admin' && (
                        <button onClick={() => setActiveTab('admin')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ml-auto ${activeTab === 'admin' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
                            Admin Approvals
                        </button>
                    )}
                </div>

                {/* FILTERS (Only show on 'book' tab) */}
                {activeTab === 'book' && (
                    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Filter by Branch</label>
                            <select 
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-bold text-slate-700"
                            >
                                <option value="All">All Branches</option>
                                <option value="CSE">CSE (Computer Science)</option>
                                <option value="ECE">ECE (Electronics)</option>
                                <option value="MECH">MECH (Mechanical)</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Filter by Type</label>
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-bold text-slate-700"
                            >
                                <option value="All">All Types</option>
                                <option value="Classroom">Classroom</option>
                                <option value="Lab">Lab</option>
                                <option value="Seminar Hall">Seminar Hall</option>
                                <option value="Auditorium">Auditorium</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'book' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources
                                .filter(r => branchFilter === 'All' || r.branch === branchFilter)
                                .filter(r => typeFilter === 'All' || r.type === typeFilter)
                                .map(r => (
                                <div key={r._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-bl-full pointer-events-none -z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{r.name}</h3>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{r.block}</span>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-bold">{r.type}</span>
                                            </p>
                                            <p className="text-sm font-medium text-slate-600">Capacity: <span className="font-bold text-slate-800">{r.capacity} seats</span></p>
                                            <p className="text-sm font-medium text-slate-600">Branch: <span className="font-bold font-mono tracking-tighter text-slate-800">{r.branch}</span></p>
                                        </div>
                                        <button 
                                            onClick={() => handleRequestSlot(r)}
                                            className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-colors"
                                        >
                                            Request Slot
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {resources.filter(r => branchFilter === 'All' || r.branch === branchFilter).filter(r => typeFilter === 'All' || r.type === typeFilter).length === 0 && (
                            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                                <p className="text-slate-400 font-bold">No resources match your current filters.</p>
                                <button onClick={() => {setBranchFilter('All'); setTypeFilter('All');}} className="mt-4 text-emerald-600 font-black text-sm uppercase tracking-widest hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'myRequests' && renderMyRequests()}
                {activeTab === 'admin' && renderAdminRequests()}
                {activeTab === 'analytics' && renderAnalytics()}

            </div>

            {/* REQUEST SLOT MODAL */}
            {showModal && selectedResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-2xl font-black text-slate-800">Book Slot</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">{selectedResource.name} ({selectedResource.type})</p>
                        </div>
                        <form onSubmit={submitBooking} className="p-6 space-y-5">
                            {error && <div className="p-3 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl">{error}</div>}
                            
                            {occupiedSlots.length > 0 && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Already Occupied (Today/Upcoming)</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                        {occupiedSlots.map(s => (
                                            <div key={s._id} className="text-xs text-amber-900 flex justify-between bg-white/50 p-2 rounded-lg">
                                                <span className="font-bold">{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                <span className="italic">{new Date(s.startTime).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Event Name</label>
                                <input required type="text" value={eventData.eventName} onChange={e => setEventData({...eventData, eventName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" placeholder="e.g. AI Seminar" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Purpose</label>
                                <input required type="text" value={eventData.purpose} onChange={e => setEventData({...eventData, purpose: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" placeholder="Academic, Club, Internal..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                                    <input required type="datetime-local" value={eventData.startTime} onChange={e => setEventData({...eventData, startTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                                    <input required type="datetime-local" value={eventData.endTime} onChange={e => setEventData({...eventData, endTime: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
