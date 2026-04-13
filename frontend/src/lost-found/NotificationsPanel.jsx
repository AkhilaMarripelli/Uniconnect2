import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 1. Get Current User
        const authRes = await fetch("http://localhost:5000/api/auth/check", { credentials: "include" });
        const authData = await authRes.json();

        if (!authData.user) {
          setLoading(false);
          return;
        }
        setCurrentUser(authData.user);

        // 2. Fetch Notifications
        const res = await fetch(`http://localhost:5000/api/lost-found/notifications?userId=${authData.user.rollNo}`);
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No new notifications</h3>
            <p className="text-slate-500">You're all caught up! We'll let you know if we find any matches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif._id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer group flex items-start gap-4">
                <div
                  className="flex-1 flex items-start gap-4"
                  onClick={() => navigate(`/lost-found/${notif.matchedItemId}`)}
                >
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full shrink-0 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium text-lg leading-snug group-hover:text-blue-600 transition-colors">{notif.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-slate-400 text-sm">{new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this notification?")) {
                      try {
                        await fetch(`http://localhost:5000/api/lost-found/notifications/${notif._id}`, { method: "DELETE" });
                        setNotifications(notifications.filter(n => n._id !== notif._id));
                      } catch (err) {
                        alert("Failed to delete");
                      }
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                  title="Delete Notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;