//this is student dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2, GraduationCap, ShieldCheck, MapPin, Globe, Clock,
    CheckCircle, FileText, AlertCircle, LogOut, Edit2, X, Save,
    Mail, Briefcase, User, BriefcaseBusiness, IndianRupee, Send, Award, Video, Calendar
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    // Student Specific States
    const [activeStudentTab, setActiveStudentTab] = useState('profile'); // 'profile' or 'jobs'
    const [jobs, setJobs] = useState([]);
    const [applyingTo, setApplyingTo] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [interviews, setInterviews] = useState([]); // NEW: Interviews state

    const [showPdf, setShowPdf] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("NoToken");

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/GetProfile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedProfile = response.data.data;
            setProfile(fetchedProfile);

            // If the user is a student, also fetch the available active jobs
            if (fetchedProfile.user.role === 'student') {
                fetchJobs(token);
                fetchInterviews(token); // Fetch interviews
            }
        } catch (err) {
            if (err.message === "NoToken" || err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                setError('Failed to load profile data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (token) => {
        try {
            // Fetch jobs and applied job IDs simultaneously
            const [jobsRes, appliedRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/student/jobs`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/student/applications/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setJobs(jobsRes.data.data || []);
            setAppliedJobs(appliedRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch jobs/applications:', err);
        }
    };

    const fetchInterviews = async (token) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/interviews/student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterviews(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch interviews:', err);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingTo(jobId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/student/apply/${jobId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Push the new object structure into the state so UI updates instantly
            setAppliedJobs(prev => [...prev, { jobId: jobId, isSelected: false }]);
            alert('Successfully applied to the job!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to apply for this job.');
        } finally {
            setApplyingTo(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // --- EDIT FUNCTIONS ---
    const handleEditToggle = () => {
        if (!isEditing) {
            const initialData = { ...profile.profileDetails, name: profile.user.name };
            if (profile.user.role === 'student' && Array.isArray(initialData.skills)) {
                initialData.skills = initialData.skills.join(', ');
            }
            setEditData(initialData);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();

        Object.keys(editData).forEach((key) => {
            formData.append(key, editData[key]);
        });

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/UpdateProfile`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate File Type (PDF only)
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are allowed for resumes.');
                e.target.value = null; // Clear the invalid selection
                return;
            }

            // Validate File Size (Max 5MB = 5 * 1024 * 1024 bytes)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size must be less than 5MB.');
                e.target.value = null; // Clear the invalid selection
                return;
            }

            // If valid, save to state
            setEditData(prev => ({ ...prev, resume: file }));
        } else {
            setEditData(prev => ({ ...prev, resume: null }));
        }
    };

    // Helper: Check if interview is within 10 minutes of starting
    const isJoinable = (scheduledTime) => {
        const start = new Date(scheduledTime).getTime();
        const now = new Date().getTime();
        return now >= (start - 10 * 60000); // 10 minutes in milliseconds
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-300">
            <div className="text-center bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-lg font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors">
                    Try Again
                </button>
            </div>
        </div>
    );

    const { user, profileDetails } = profile;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans relative overflow-hidden pb-12 selection:bg-violet-500/30">
            {/* Cinematic Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#0a0a0a]/70 backdrop-blur-xl px-6 py-4 flex justify-between items-center transition-all">
                <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight">Placement Portal</h1>
                        <p className="text-xs text-zinc-400 font-medium capitalize flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {user.role} Dashboard
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} className="group flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-all bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline font-medium">Log out</span>
                </button>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">

                {/* Profile Header Banner */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="h-40 bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-zinc-900/40 relative border-b border-zinc-800/50">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                    </div>

                    <div className="px-6 sm:px-10 pb-8 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-6">
                            <div className="flex items-end space-x-5">
                                <div className="w-28 h-28 rounded-2xl bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center shadow-xl ring-1 ring-white/10 relative group">
                                    <span className="text-4xl font-bold bg-gradient-to-br from-violet-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
                                    <div className="flex items-center text-zinc-400 text-sm mt-2 font-medium bg-zinc-950/50 w-fit px-3 py-1.5 rounded-lg border border-zinc-800/50">
                                        <Mail className="w-4 h-4 mr-2 text-violet-400" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            {user.role !== 'admin' && activeStudentTab === 'profile' && (
                                <div className="mb-2 w-full sm:w-auto">
                                    {isEditing ? (
                                        <button onClick={handleEditToggle} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-all border border-zinc-700 font-medium shadow-lg">
                                            <X className="w-4 h-4" />
                                            <span>Cancel Edit</span>
                                        </button>
                                    ) : (
                                        <button onClick={handleEditToggle} className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-lg shadow-violet-900/30 font-medium hover:-translate-y-0.5 hover:shadow-violet-900/40">
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edit Profile</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= EDIT MODE FORM ================= */}
                {isEditing && (
                    <form onSubmit={handleSave} className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center mb-8 border-b border-zinc-800/80 pb-5">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mr-4 border border-violet-500/20">
                                <Edit2 className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-100">Update Information</h3>
                                <p className="text-sm text-zinc-400 mt-1">Keep your profile updated to match with the best opportunities.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            <div className="md:col-span-2 group">
                                <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Full Name</label>
                                <input name="name" type="text" value={editData.name || ''} onChange={handleChange} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                            </div>

                            {user.role === 'student' && (
                                <>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Department</label>
                                        <input name="department" type="text" value={editData.department || ''} onChange={handleChange} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Graduation Year</label>
                                        <input name="gratuationYear" type="number" value={editData.gratuationYear || ''} onChange={handleChange} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">CGPA</label>
                                        <input name="cpga" type="number" step="0.01" value={editData.cpga || ''} onChange={handleChange} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Expected Salary (LPA)</label>
                                        <input name="expectedSalary" type="number" value={editData.expectedSalary || ''} onChange={handleChange} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="md:col-span-2 group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Skills <span className="text-zinc-600 font-normal">(Comma separated)</span></label>
                                        <input name="skills" type="text" value={editData.skills || ''} onChange={handleChange} placeholder="e.g. React, Node.js, Python" className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Experience / Bio</label>
                                        <input name="experience" type="text" value={editData.experience || ''} onChange={handleChange} placeholder="Briefly describe your experience" className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Upload Resume (PDF)</label>
                                        <input
                                            name="resumeFile"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 hover:border-zinc-700 transition-all 
                                            file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer shadow-inner"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-10 flex justify-end border-t border-zinc-800/80 pt-6">
                            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-8 py-3.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-600 text-zinc-900 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5">
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* ================= READ ONLY VIEWS ================= */}
                {!isEditing && (
                    <div className="space-y-8">

                        {/* STUDENT VIEW */}
                        {user.role === 'student' && profileDetails && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

                                {/* Student Custom Navigation Tabs */}
                                <div className="flex space-x-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800/60 w-fit backdrop-blur-md shadow-lg">
                                    <button
                                        onClick={() => setActiveStudentTab('profile')}
                                        className={`flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeStudentTab === 'profile' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'}`}
                                    >
                                        <User className={`w-4 h-4 mr-2 ${activeStudentTab === 'profile' ? 'text-violet-400' : ''}`} /> Academic Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveStudentTab('jobs')}
                                        className={`flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeStudentTab === 'jobs' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'}`}
                                    >
                                        <BriefcaseBusiness className={`w-4 h-4 mr-2 ${activeStudentTab === 'jobs' ? 'text-violet-400' : ''}`} /> Job Board
                                        {jobs.length > 0 && (
                                            <span className="ml-2.5 bg-violet-500/20 text-violet-400 py-0.5 px-2 rounded-md text-xs border border-violet-500/20">{jobs.length}</span>
                                        )}
                                    </button>
                                    <button onClick={() => setActiveStudentTab('interviews')} className={`flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeStudentTab === 'interviews' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'}`}>
                                        <Video className={`w-4 h-4 mr-2 ${activeStudentTab === 'interviews' ? 'text-violet-400' : ''}`} /> My Interviews
                                        {interviews.filter(i => i.status === 'scheduled').length > 0 && <span className="ml-2.5 bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-md text-xs border border-indigo-500/20">{interviews.filter(i => i.status === 'scheduled').length}</span>}
                                    </button>
                                </div>

                                {activeStudentTab === 'profile' && (
                                    <>
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-in fade-in">
                                            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 shadow-lg hover:bg-zinc-900 transition-colors group">
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors">Department</p>
                                                <p className="text-xl font-bold text-zinc-100 truncate">{profileDetails.department || 'Not Set'}</p>
                                            </div>
                                            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 shadow-lg hover:bg-zinc-900 transition-colors group">
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors">Class of</p>
                                                <p className="text-xl font-bold text-zinc-100">{profileDetails.gratuationYear || 'Not Set'}</p>
                                            </div>
                                            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 shadow-lg hover:bg-zinc-900 transition-colors group relative overflow-hidden">
                                                <div className="absolute right-0 top-0 w-24 h-24 bg-violet-500/5 blur-[40px] rounded-full"></div>
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors relative z-10">CGPA</p>
                                                <div className="flex items-baseline relative z-10">
                                                    <span className="text-3xl font-black text-violet-400">{profileDetails.cpga || '0.00'}</span>
                                                    <span className="text-sm font-semibold text-zinc-600 ml-1.5">/ 10</span>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 shadow-lg hover:bg-zinc-900 transition-colors group relative overflow-hidden">
                                                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full"></div>
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors relative z-10">Expected Salary</p>
                                                <p className="text-xl font-bold text-emerald-400 relative z-10">
                                                    {profileDetails.expectedSalary ? `₹${profileDetails.expectedSalary.toLocaleString()} LPA` : 'Not Set'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                                            {/* Left Column */}
                                            <div className="md:col-span-2 space-y-6">
                                                <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
                                                    <div className="flex items-center mb-6">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mr-4 border border-zinc-700">
                                                            <Briefcase className="w-5 h-5 text-zinc-300" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-zinc-100">Experience Profile</h3>
                                                    </div>
                                                    <div className="text-zinc-300 leading-relaxed bg-zinc-950/60 border border-zinc-800/50 p-6 rounded-2xl font-medium">
                                                        {profileDetails.experience || 'Currently looking for entry-level opportunities as a Fresher. Ready to learn and grow in a fast-paced environment.'}
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
                                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Technical Arsenal</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {profileDetails.skills && profileDetails.skills.length > 0 ? (
                                                            profileDetails.skills.map((skill, index) => (
                                                                <span key={index} className="px-4 py-2 bg-zinc-950/80 border border-zinc-800 hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-300 transition-all rounded-xl text-sm font-semibold text-zinc-300 shadow-sm cursor-default">
                                                                    {skill.trim()}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-zinc-600 text-sm font-medium italic">No skills added yet. Edit profile to add.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="md:col-span-1 space-y-6">
                                                <div className="bg-gradient-to-b from-violet-900/10 to-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
                                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                                                    <div className="w-20 h-20 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                                                        <FileText className="w-10 h-10 text-violet-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-zinc-100 mb-3">Curriculum Vitae</h3>
                                                    <p className="text-sm text-zinc-400 mb-8 font-medium leading-relaxed">View your uploaded resume document to ensure it reflects your latest achievements.</p>

                                                    {profileDetails.resumeUrl ? (
                                                        <button onClick={() => setShowPdf(true)} className="w-full flex justify-center items-center px-5 py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl transition-all font-bold shadow-lg hover:-translate-y-0.5">
                                                            View Resume PDF
                                                        </button>
                                                    ) : (
                                                        <button disabled className="w-full px-5 py-3.5 bg-zinc-800/80 text-zinc-500 rounded-xl cursor-not-allowed font-semibold border border-zinc-700/50">
                                                            No Resume Uploaded
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeStudentTab === 'jobs' && (
                                    /* JOB BOARD SECTION FOR STUDENTS */
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-sm">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white tracking-tight">Available Opportunities</h2>
                                                <p className="text-sm text-zinc-400 mt-1 font-medium">Keep an eye on your email for updates regarding interview links.</p>
                                            </div>
                                            <span className="text-sm font-bold text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/20 shadow-sm whitespace-nowrap">
                                                {jobs.length} Opportunities
                                            </span>
                                        </div>

                                        {jobs.length === 0 ? (
                                            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-16 text-center text-zinc-500 backdrop-blur-sm">
                                                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <BriefcaseBusiness className="w-10 h-10 text-zinc-600" />
                                                </div>
                                                <p className="text-lg font-medium">No jobs are currently available.</p>
                                                <p className="text-sm mt-2">New opportunities will appear here when companies post them.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-5">
                                                {jobs.map(job => {
                                                    // Check eligibility
                                                    const isEligible = !job.minCgpa || profileDetails.cpga >= job.minCgpa;

                                                    // Find if the student applied to this specific job
                                                    const applicationInfo = appliedJobs.find(app => app.jobId === job._id);
                                                    const hasApplied = !!applicationInfo;
                                                    const isSelected = hasApplied && applicationInfo.isSelected;

                                                    return (
                                                        <div key={job._id} className={`group bg-zinc-900/60 backdrop-blur-sm border ${isSelected ? 'border-emerald-500/40 shadow-[0_4px_30px_-5px_rgba(16,185,129,0.15)]' : isEligible ? 'border-zinc-800/80 hover:border-violet-500/40 hover:shadow-[0_4px_25px_-5px_rgba(139,92,246,0.1)]' : 'border-zinc-800/40 opacity-80'} rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-8 transition-all duration-300`}>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">{job.title}</h3>
                                                                        <p className="text-zinc-400 text-sm mt-2 flex items-center font-semibold">
                                                                            <Building2 className="w-4 h-4 mr-2 text-zinc-500" />
                                                                            {job.companyId?.companyName || 'Verified Company'}
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <span className="md:hidden flex items-center bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-bold rounded-lg border border-emerald-500/20">
                                                                            <Award className="w-3.5 h-3.5 mr-1" /> Selected
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <p className="text-zinc-300/90 mt-5 text-sm leading-relaxed whitespace-pre-line line-clamp-3 font-medium">
                                                                    {job.description}
                                                                </p>

                                                                <div className="flex flex-wrap gap-3 mt-6">
                                                                    <span className="flex items-center bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/20 text-xs font-bold">
                                                                        <IndianRupee className="w-3.5 h-3.5 mr-1" /> {job.package} LPA
                                                                    </span>
                                                                    {job.deadline && (
                                                                        <span className="flex items-center bg-amber-500/10 text-amber-400 px-3.5 py-1.5 rounded-full border border-amber-500/20 text-xs font-bold">
                                                                            <Clock className="w-3.5 h-3.5 mr-1" /> Ends: {new Date(job.deadline).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                    {job.minCgpa && (
                                                                        <span className="flex items-center bg-zinc-800 text-zinc-300 px-3.5 py-1.5 rounded-full border border-zinc-700 text-xs font-bold">
                                                                            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Min CGPA: {job.minCgpa}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col justify-center md:items-end md:border-l border-t md:border-t-0 border-zinc-800/80 pt-6 md:pt-0 md:pl-8 shrink-0 md:min-w-[200px]">
                                                                {isEligible ? (
                                                                    isSelected ? (
                                                                        // 🎉 SELECTED STATE
                                                                        <div className="w-full md:w-auto flex flex-col items-center md:items-end">
                                                                            <button
                                                                                disabled
                                                                                className="w-full px-6 py-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl cursor-default flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                                                            >
                                                                                <Award className="w-5 h-5 mr-2" /> Selected!
                                                                            </button>
                                                                            <p className="text-xs text-emerald-500/80 mt-3 font-semibold text-center md:text-right">Congratulations! Check email for next steps.</p>
                                                                        </div>
                                                                    ) : hasApplied ? (
                                                                        // ALREADY APPLIED STATE
                                                                        <button
                                                                            disabled
                                                                            className="w-full px-6 py-3.5 bg-zinc-800/50 text-emerald-400 border border-emerald-500/20 font-bold rounded-xl cursor-default flex items-center justify-center"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4 mr-2" /> Applied
                                                                        </button>
                                                                    ) : (
                                                                        // ELIGIBLE AND CAN APPLY STATE
                                                                        <button
                                                                            onClick={() => handleApply(job._id)}
                                                                            disabled={applyingTo === job._id}
                                                                            className="w-full px-8 py-3.5 bg-white hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] flex items-center justify-center disabled:opacity-70 hover:-translate-y-0.5"
                                                                        >
                                                                            {applyingTo === job._id ? 'Applying...' : <><Send className="w-4 h-4 mr-2" /> Apply Now</>}
                                                                        </button>
                                                                    )
                                                                ) : (
                                                                    // NOT ELIGIBLE STATE
                                                                    <div className="w-full flex flex-col items-center md:items-end">
                                                                        <button
                                                                            disabled
                                                                            className="w-full px-6 py-3.5 bg-zinc-900 text-zinc-600 font-bold rounded-xl cursor-not-allowed border border-zinc-800"
                                                                        >
                                                                            Not Eligible
                                                                        </button>
                                                                        <p className="text-red-400/80 text-xs mt-3 font-semibold flex items-center text-center md:text-right">
                                                                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                                                            Requires {job.minCgpa} CGPA
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Interview */}
                                {activeStudentTab === 'interviews' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-sm">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white tracking-tight">Interview Schedule</h2>
                                                <p className="text-sm text-zinc-400 mt-1 font-medium">Join your scheduled video interviews directly from here.</p>
                                            </div>
                                        </div>

                                        {interviews.length === 0 ? (
                                            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-16 text-center text-zinc-500 backdrop-blur-sm">
                                                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Calendar className="w-10 h-10 text-zinc-600" />
                                                </div>
                                                <p className="text-lg font-medium">No interviews scheduled yet.</p>
                                                <p className="text-sm mt-2">Companies will schedule interviews after reviewing your applications.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-5">
                                                {interviews.map(interview => {
                                                    const active = isJoinable(interview.scheduledTime) && interview.status === 'scheduled';

                                                    return (
                                                        <div key={interview._id} className="group bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-6 sm:p-8 hover:border-indigo-500/40 transition-all duration-300 shadow-lg flex flex-col md:flex-row justify-between gap-6">
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-100 transition-colors">{interview.title}</h3>
                                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${interview.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center text-zinc-400 mt-3 font-semibold">
                                                                    <Building2 className="w-4 h-4 mr-2 text-zinc-500" />
                                                                    {interview.companyId?.companyName || 'Company'} <span className="mx-2">|</span> {interview.jobId?.title || 'Job Role'}
                                                                </div>

                                                                <div className="flex flex-wrap items-center text-sm font-semibold text-zinc-300 gap-4 mt-5">
                                                                    <span className="flex items-center bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 shadow-inner">
                                                                        <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                                                                        {new Date(interview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                                    </span>
                                                                    <span className="flex items-center bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 shadow-inner">
                                                                        <Clock className="w-4 h-4 mr-2 text-amber-400" />
                                                                        {interview.duration} Minutes
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col justify-center items-stretch md:items-end md:border-l border-t md:border-t-0 border-zinc-800/80 pt-5 md:pt-0 md:pl-6 shrink-0 min-w-[220px]">
                                                                {interview.status === 'completed' ? (
                                                                    <button disabled className="w-full px-6 py-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl flex items-center justify-center cursor-default">
                                                                        <CheckCircle className="w-4 h-4 mr-2" /> Completed
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => navigate(`/interview/${interview.roomName}`)}
                                                                            disabled={!active}
                                                                            className={`w-full px-6 py-3.5 font-bold rounded-xl flex items-center justify-center transition-all ${active ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] hover:-translate-y-0.5' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'}`}
                                                                        >
                                                                            <Video className="w-5 h-5 mr-2" /> {active ? 'Join Call Now' : 'Join Call'}
                                                                        </button>
                                                                        {!active && interview.status === 'scheduled' && (
                                                                            <p className="text-xs text-zinc-500 mt-3 text-center md:text-right font-medium">Button activates 10 mins before start</p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Interview */}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* PDF Viewer Modal */}
            {showPdf && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
                    <div className="relative h-full w-full max-w-6xl rounded-2xl bg-zinc-950 shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">

                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                            <h3 className="text-zinc-200 font-semibold flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-violet-400" /> Resume Document
                            </h3>
                            <button
                                onClick={() => setShowPdf(false)}
                                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white transition-colors flex items-center text-sm font-semibold border border-zinc-700"
                            >
                                <X className="w-4 h-4 mr-1" /> Close
                            </button>
                        </div>

                        <div className="flex-1 bg-zinc-950 p-2 sm:p-4">
                            <iframe
                                src={import.meta.env.VITE_BASE_BACK_URL + profileDetails.resumeUrl}
                                title="PDF Viewer"
                                className="h-full w-full rounded-xl border border-zinc-800/50 bg-zinc-900"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}