import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
    const navigate = useNavigate();
    const [rollNo, setRollNo] = useState("Loading...");

    const handleLogout = async () => {
        await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        navigate("/", { replace: true });
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/auth/check", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setRollNo(data.user.rollNo);
            });
    }, []);

    const services = [
        {
            title: "Experience Hub",
            description: "Read and share interview experiences.",
            path: "/experience-hub",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            gradient: "from-blue-500 to-cyan-400",
            shadow: "shadow-blue-200"
        },
        {
            title: "Student Grievance",
            description: "Raise and track academic concerns.",
            path: "/grievance",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
            gradient: "from-rose-500 to-pink-500",
            shadow: "shadow-rose-200"
        },
        {
            title: "Resource Booking",
            description: "Book seminar halls and labs.",
            path: "/resource-booking",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            gradient: "from-emerald-500 to-green-400",
            shadow: "shadow-emerald-200"
        },
        {
            title: "Lost & Found",
            description: "Find lost items or report findings.",
            path: "/lost-found",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            gradient: "from-amber-500 to-orange-400",
            shadow: "shadow-amber-200"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 relative overflow-hidden">
            {/* Background Blobs - Restored "Premium" Style */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Glassmorphism Navbar */}
            <nav className="bg-white/60 backdrop-blur-lg border-b border-white/40 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-black text-xl">U</div>
                            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">UniConnect</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</span>
                                <span className="text-sm font-bold text-slate-700 font-mono tracking-tight">{rollNo}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Header Section */}
                <div className="mb-16 text-center sm:text-left relative">
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Welcome Back.
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                        Your personalized gateway to campus life. What would you like to achieve today?
                    </p>
                </div>

                {/* Glass Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(service.path)}
                            className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/50 p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex items-start gap-6 relative z-10">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg ${service.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                    {service.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 text-slate-300">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Decorative Gradient Overlay */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Section - Glassmorphism Style */}
                <div className="mt-20">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h4 className="text-3xl font-bold mb-2">Campus Hackathon 2024</h4>
                                <p className="text-indigo-100 text-lg">Join 500+ developers. Building next week.</p>
                            </div>
                            <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all">
                                View Details
                            </button>
                        </div>

                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-24 text-center text-slate-400 font-medium text-sm">
                    <p>&copy; 2024 UniConnect. Campus Life Simplified.</p>
                </div>
            </main>
        </div>
    );
};

export default Home;
