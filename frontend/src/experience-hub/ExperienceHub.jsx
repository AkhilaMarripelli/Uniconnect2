import React, { useEffect, useState } from "react";
import AddExperienceModal from "./AddExperienceModal";
import { fetchMyExperiences, searchQuestions, fetchAllExperiences } from "./experienceService";

const ExperienceHub = () => {
  const [open, setOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [subject, setSubject] = useState("");
  const [company, setCompany] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      if (company) {
        // Search full experiences by company
        const data = await fetchAllExperiences(company);
        setResults(data);
      } else if (subject) {
        // Search specific questions by topic
        const data = await searchQuestions({ subject });
        setResults(data);
      }
    } catch {
      alert("Search failed");
    }
  };

  const loadExperiences = async () => {
    try {
      const data = await fetchMyExperiences();
      setExperiences(data);
    } catch {
      console.error("Failed to load experiences");
    }
  };

  useEffect(() => {
    (async () => {
      await loadExperiences();
    })();
  }, []);

  const categories = ["DSA", "OS", "DBMS", "CN", "OOPS", "SYSTEM_DESIGN", "CLOUD", "DEVOPS", "FRONTEND", "BACKEND", "HR", "Java", "Python", "OTHER"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Experience Hub
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Unlock insights from your peers. Share your interview journey and discover patterns in the chaos.
          </p>
        </div>

        {/* Search Toggle & Inputs */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 mb-12 transition-all duration-300">

          {/* Search Type Toggle */}
          <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
            <button
              onClick={() => { setResults([]); setCompany(""); }}
              className={`pb-2 px-4 font-bold text-sm transition-all ${subject !== "" || (!subject && !company) ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Search by Topic
            </button>
            <button
              onClick={() => { setResults([]); setSubject(""); }}
              className={`pb-2 px-4 font-bold text-sm transition-all ${company !== "" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Search by Company
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Topic Selector */}
            <div className={`relative flex-1 transition-all duration-300 ${company !== "" ? "hidden" : "block"}`}>
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setCompany(""); }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer hover:bg-slate-100"
              >
                <option value="">Select Topic</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Company Input */}
            <div className={`relative flex-[2] transition-all duration-300 ${subject !== "" && company === "" ? "hidden" : "block"}`}>
              <input
                type="text"
                placeholder="Search by Company (e.g. Google)..."
                value={company}
                onChange={(e) => { setCompany(e.target.value); setSubject(""); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {subject ? "Find Questions" : "Find Experiences"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-purple-500">✨</span> {subject ? "Extracted Questions" : "Full Experiences"}
            </h2>

            <div className={`grid gap-4 ${subject ? "grid-cols-1" : "md:grid-cols-2"}`}>
              {results.map((item) => (
                subject ? (
                  // Question List Item
                  <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                      <div>
                        <p className="font-medium text-slate-700 group-hover:text-purple-700 transition-colors">{item.questionText}</p>
                        <div className="flex gap-2 mt-1">
                          {item.subjects && item.subjects.length > 0 ? (
                            item.subjects.map((sub, idx) => (
                              <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {sub}
                              </span>
                            ))
                          ) : (
                            item.subject && (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {item.subject}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {item.companyName && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-4 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        🏢 {item.companyName}
                      </span>
                    )}
                  </div>
                ) : (
                  // Full Experience Card
                  <div key={item._id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{item.companyName}</h3>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience Shared</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed text-sm border border-slate-100">
                      {item.rawText}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}


        {/* Recent Experiences */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Your Shared Journey</h2>
            <span className="text-sm font-semibold text-slate-500">{experiences.length} Experiences</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-slate-500 font-medium">Your portfolio is empty. Share your first experience!</p>
              </div>
            ) : (
              experiences.map((exp) => (
                <div key={exp._id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{exp.companyName || "General Interview"}</h3>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-semibold text-slate-700">{new Date(exp.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    <p className="text-slate-600 text-sm leading-relaxed mt-4 line-clamp-4 relative">
                      {exp.rawText}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => setSelectedExperience(exp)}
                      className="text-purple-600 text-sm font-bold hover:text-purple-700 flex items-center gap-1 transition-colors"
                    >
                      Read Full Story <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-900 text-white w-16 h-16 rounded-full text-3xl flex items-center justify-center shadow-2xl shadow-slate-400/50 hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <div className="group-hover:rotate-90 transition-transform duration-300">+</div>
      </button>

      {open && (
        <AddExperienceModal
          onClose={() => {
            setOpen(false);
            loadExperiences();
          }}
        />
      )}

      {/* Read Full Story Modal */}
      {selectedExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedExperience.companyName}</h3>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {new Date(selectedExperience.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedExperience(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                {selectedExperience.rawText}
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedExperience(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceHub;
