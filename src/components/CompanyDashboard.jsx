//this is company dashboard

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Briefcase, User, Settings, CheckCircle, Clock,
    LogOut, Edit2, Trash2, Plus, X, IndianRupee, MapPin, Globe, Save,
    Users, ArrowLeft, Mail, FileText, GraduationCap, Award, AlertCircle, Video, Calendar
} from 'lucide-react';

export default function CompanyDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({ profile: null, jobs: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Profile Edit States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({});

    // Job Form States
    const [editingJobId, setEditingJobId] = useState(null);
    const [jobFormData, setJobFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Applicants View States
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null); // Stores the job object
    const [applicantsData, setApplicantsData] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [selectingApplicant, setSelectingApplicant] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    // Interviews States
    const [interviews, setInterviews] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [schedulingFor, setSchedulingFor] = useState(null); // stores { studentId, jobId }
    const [scheduleForm, setScheduleForm] = useState({ title: 'Technical Round 1', date: '', time: '' });

    const [pdfState, setPdfState] = useState({
        show: false,
        url: "",
    });

    useEffect(() => {
        fetchDashboard();
        fetchSelectedCandidates();
        fetchInterviews();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("NoToken");

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/company/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDashboardData(response.data.data);
            setProfileFormData(response.data.data.profile);
        } catch (err) {
            if (err.message === "NoToken" || err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                setError('Failed to load dashboard data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/UpdateProfile`, profileFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchDashboard();
            setIsEditingProfile(false);
        } catch (err) { alert(err.response?.data?.message || 'Failed to update profile'); }
        finally {
            setIsSaving(false);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (editingJobId) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/company/jobs/${editingJobId}`, jobFormData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/jobs/post`, jobFormData, { headers: { Authorization: `Bearer ${token}` } });
            }
            await fetchDashboard();
            setEditingJobId(null);
            setJobFormData({});
            setActiveTab('jobs');
        } catch (err) { alert(err.response?.data?.message || 'Failed to process job request'); }
        finally { setIsSaving(false); }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/company/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboard();
        } catch (err) { alert('Failed to delete job'); }
    };

    const startJobEdit = (job) => {
        setJobFormData({
            title: job.title, description: job.description, package: job.package, minCgpa: job.minCgpa || '',
            deadline: job.deadline ? job.deadline.split('T')[0] : '', status: job.status
        });
        setEditingJobId(job._id);
        setActiveTab('post');
    };

    // --- NEW: FETCH APPLICANTS ---
    const handleViewApplicants = async (job) => {
        setViewingApplicantsFor(job);
        setLoadingApplicants(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/company/jobs/${job._id}/applicants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplicantsData(response.data.data);
        } catch (err) {
            alert('Failed to load applicants data.');
            setViewingApplicantsFor(null);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleSelectCandidate = async (applicationId) => {
        if (!window.confirm("Are you sure you want to select this candidate?")) return;

        setSelectingApplicant(applicationId);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/company/applications/${applicationId}/select`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Instantly update the local state so the UI changes without refreshing
            setApplicantsData(prev =>
                prev.map(app => app.applicationId === applicationId ? { ...app, isSelected: true } : app)
            );

            alert('Candidate selected successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to select candidate.');
        } finally {
            setSelectingApplicant(null);
        }
    };

    const fetchSelectedCandidates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/company/candidates/selected`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedCandidates(response.data.data);
        } catch (err) {
            console.error("Failed to fetch selected candidates");
        }
    };

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/interviews/company`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterviews(res.data.data || []);
        } catch (err) { console.error('Failed to fetch interviews:', err); }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const scheduledTime = new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString();

            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/interviews/schedule`, {
                jobId: schedulingFor.jobId,
                studentId: schedulingFor.studentId,
                title: scheduleForm.title,
                scheduledTime,
                duration: 30
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Interview Scheduled Successfully!');
            setShowScheduleModal(false);
            fetchInterviews();
        } catch (err) { alert('Failed to schedule interview.'); }
    };

    const updateInterviewStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/interviews/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchInterviews();
        } catch (err) { alert('Failed to update status.'); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    if (error || !dashboardData) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-300">
            <div className="text-center bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-lg font-medium">{error || 'Failed to load dashboard data.'}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors">
                    Try Again
                </button>
            </div>
        </div>
    );

    const { profile, jobs } = dashboardData;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans relative overflow-hidden pb-12 selection:bg-violet-500/30">
            {/* Cinematic Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#0a0a0a]/70 backdrop-blur-xl px-6 py-4 flex justify-between items-center transition-all">
                <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight">Company Portal</h1>
                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${profile?.status === 1 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                            {profile?.companyName || 'Recruiter Dashboard'}
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} className="group flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-all bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline font-medium">Log out</span>
                </button>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-2 shrink-0 bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/60 backdrop-blur-sm md:sticky top-28 shadow-xl">
                    <div className="mb-4 px-2">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dashboard Menu</p>
                    </div>
                    <button
                        onClick={() => { setActiveTab('overview'); setIsEditingProfile(false); setViewingApplicantsFor(null); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === 'overview' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
                    >
                        <User className={`w-5 h-5 ${activeTab === 'overview' ? 'text-violet-400' : ''}`} /> <span>Profile Overview</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('jobs'); setViewingApplicantsFor(null); }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === 'jobs' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <Briefcase className={`w-5 h-5 ${activeTab === 'jobs' ? 'text-violet-400' : ''}`} /> <span>Manage Jobs</span>
                        </div>
                        {jobs.length > 0 && (
                            <span className={`px-2.5 py-0.5 rounded-md text-xs border ${activeTab === 'jobs' ? 'bg-violet-500/20 text-violet-400 border-violet-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                {jobs.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setEditingJobId(null);
                            setJobFormData({ title: '', description: '', package: '', minCgpa: '', deadline: '' });
                            setViewingApplicantsFor(null);
                            setActiveTab('post');
                        }}
                        disabled={profile.status !== 1}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === 'post' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Plus className={`w-5 h-5 ${activeTab === 'post' ? 'text-violet-400' : ''}`} /> <span>Post a Job</span>
                    </button>

                    <div className="my-2 border-t border-zinc-800/80 mx-2"></div>

                    <button
                        onClick={() => { setActiveTab('selected'); setViewingApplicantsFor(null); }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === 'selected' ? 'bg-zinc-800 text-white shadow-md border border-emerald-500/30' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <Award className={`w-5 h-5 ${activeTab === 'selected' ? 'text-emerald-400' : ''}`} /> <span>Hired Students</span>
                        </div>
                        {selectedCandidates.length > 0 && (
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${activeTab === 'selected' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/10'}`}>
                                {selectedCandidates.length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { setActiveTab('interviews'); setViewingApplicantsFor(null); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-semibold ${activeTab === 'interviews' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}>
                        <div className="flex items-center space-x-3"><Video className={`w-5 h-5 ${activeTab === 'interviews' ? 'text-indigo-400' : ''}`} /> <span>Video Interviews</span></div>
                        {interviews.filter(i => i.status === 'scheduled').length > 0 && <span className="px-2.5 py-0.5 rounded-md text-xs font-bold border bg-indigo-500/20 text-indigo-400 border-indigo-500/20">{interviews.filter(i => i.status === 'scheduled').length}</span>}
                    </button>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 w-full">

                    {/* TAB: OVERVIEW & PROFILE */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {profile.status === 1 ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start sm:items-center space-x-4 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]">
                                    <div className="bg-emerald-500/20 p-2 rounded-xl shrink-0"><CheckCircle className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-emerald-300">Account Verified</h4>
                                        <p className="text-sm text-emerald-400/80 font-medium">Your company account is approved. You can post and manage jobs freely.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start sm:items-center space-x-4 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]">
                                    <div className="bg-amber-500/20 p-2 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-amber-300">Approval Pending</h4>
                                        <p className="text-sm text-amber-400/80 font-medium">Your account is pending admin approval. Job posting is temporarily disabled.</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500/50 to-indigo-500/50"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-zinc-800/80 pb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mr-4 border border-zinc-700">
                                            <Building2 className="w-6 h-6 text-zinc-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Company Profile</h2>
                                            <p className="text-sm text-zinc-400 font-medium">Manage how students see your organization.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center ${isEditingProfile ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 border-violet-500/20 hover:-translate-y-0.5'}`}>
                                        {isEditingProfile ? <><X className="w-4 h-4 mr-2" /> Cancel Edit</> : <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>}
                                    </button>
                                </div>

                                {isEditingProfile ? (
                                    <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="group">
                                                <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Company Name</label>
                                                <input type="text" value={profileFormData.companyName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, companyName: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                            </div>
                                            <div className="group">
                                                <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Website URL</label>
                                                <input type="text" placeholder="https://" value={profileFormData.website || ''} onChange={(e) => setProfileFormData({ ...profileFormData, website: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                            </div>
                                            <div className="group md:col-span-2">
                                                <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Headquarters Location</label>
                                                <input type="text" placeholder="City, Country" value={profileFormData.location || ''} onChange={(e) => setProfileFormData({ ...profileFormData, location: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                            </div>
                                            <div className="group md:col-span-2">
                                                <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">About the Company</label>
                                                <textarea rows="4" placeholder="Briefly describe your company's mission and culture..." value={profileFormData.description || ''} onChange={(e) => setProfileFormData({ ...profileFormData, description: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner resize-none" />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" disabled={isSaving} className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-zinc-900 rounded-xl font-bold flex items-center transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                                                <Save className="w-5 h-5 mr-2" /> {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-3xl font-bold text-white tracking-tight">{profile.companyName}</h3>
                                            <div className="flex flex-wrap gap-4 mt-4">
                                                {profile.location && (
                                                    <span className="flex items-center text-sm font-semibold text-zinc-300 bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800">
                                                        <MapPin className="w-4 h-4 mr-2 text-violet-400" /> {profile.location}
                                                    </span>
                                                )}
                                                {profile.website && (
                                                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-zinc-300 bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800 hover:border-violet-500/50 hover:text-violet-300 transition-colors">
                                                        <Globe className="w-4 h-4 mr-2 text-violet-400" /> {profile.website.replace(/(^\w+:|^)\/\//, '')}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-950/40 p-6 rounded-2xl border border-zinc-800/50">
                                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">About Us</h4>
                                            <p className="text-zinc-300 leading-relaxed font-medium whitespace-pre-line">
                                                {profile.description || 'No description added yet. Edit your profile to tell students about your company.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: MANAGE JOBS & VIEW APPLICANTS */}
                    {activeTab === 'jobs' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* IF Viewing Applicants List */}
                            {viewingApplicantsFor ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 p-6 rounded-3xl shadow-lg gap-4">
                                        <div>
                                            <p className="text-sm text-violet-400 font-bold tracking-wider uppercase mb-1">Applicant Pipeline</p>
                                            <h2 className="text-2xl font-bold text-white">{viewingApplicantsFor.title}</h2>
                                            <p className="text-sm text-zinc-400 font-medium mt-1">Reviewing {applicantsData.length} student applications.</p>
                                        </div>
                                        <button onClick={() => setViewingApplicantsFor(null)} className="flex items-center px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition border border-zinc-700 w-fit">
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
                                        </button>
                                    </div>

                                    {loadingApplicants ? (
                                        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {applicantsData.length === 0 ? (
                                                <div className="col-span-full py-16 text-center text-zinc-500 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl backdrop-blur-sm">
                                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p className="text-lg font-medium">No students have applied for this job yet.</p>
                                                </div>
                                            ) : (
                                                applicantsData.map((applicant, idx) => (
                                                    <div key={idx} className={`group bg-zinc-900/60 backdrop-blur-sm border ${applicant.isSelected ? 'border-emerald-500/50 shadow-[0_4px_30px_-5px_rgba(16,185,129,0.15)]' : 'border-zinc-800/80 hover:border-violet-500/40 hover:shadow-[0_4px_25px_-5px_rgba(139,92,246,0.1)]'} p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>

                                                        {applicant.isSelected && (
                                                            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-emerald-500/20 flex items-center">
                                                                <Award className="w-3 h-3 mr-1" /> Hired
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-start mb-5 mt-2">
                                                            <div>
                                                                <h3 className="font-bold text-white text-xl group-hover:text-violet-100 transition-colors">{applicant.user.name}</h3>
                                                                <a href={`mailto:${applicant.user.email}`} className="text-sm font-medium text-zinc-400 hover:text-violet-400 flex items-center mt-1.5 transition-colors">
                                                                    <Mail className="w-4 h-4 mr-1.5" /> {applicant.user.email}
                                                                </a>
                                                            </div>
                                                            <div className="bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800/80 text-center shadow-inner">
                                                                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-0.5">CGPA</p>
                                                                <p className="text-violet-400 font-black text-lg leading-none">{applicant.profile.cpga || 'N/A'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 text-sm text-zinc-300 font-medium flex-grow bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/50">
                                                            <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2.5 text-zinc-500" /> {applicant.profile.department || 'N/A'} (Class of {applicant.profile.gratuationYear || 'N/A'})</div>
                                                            <div className="flex items-center"><IndianRupee className="w-4 h-4 mr-2.5 text-zinc-500" /> Expected: {applicant.profile.expectedSalary || 'N/A'} LPA</div>
                                                            {applicant.profile.experience && (
                                                                <div className="flex items-start pt-1">
                                                                    <Briefcase className="w-4 h-4 mr-2.5 mt-0.5 text-zinc-500 shrink-0" />
                                                                    <span className="line-clamp-2 text-zinc-400">{applicant.profile.experience}</span>
                                                                </div>
                                                            )}

                                                            {applicant.profile.skills && applicant.profile.skills.length > 0 && (
                                                                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2">
                                                                    {applicant.profile.skills.slice(0, 3).map((s, i) => (
                                                                        <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/50">{s.trim()}</span>
                                                                    ))}
                                                                    {applicant.profile.skills.length > 3 && (
                                                                        <span className="text-xs bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-md border border-zinc-700/50">+{applicant.profile.skills.length - 3}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons Area */}
                                                        <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-800/80">
                                                            {applicant.profile.resumeUrl ? (
                                                                <button onClick={() => setPdfState({
                                                                    show: true,
                                                                    url: applicant.profile.resumeUrl,
                                                                })} className="flex-1 flex items-center justify-center py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700 shadow-sm">
                                                                    <FileText className="w-4 h-4 mr-2 text-violet-400" /> View CV
                                                                </button>
                                                            ) : (
                                                                <button disabled className="flex-1 py-3 bg-zinc-950 border border-zinc-800/80 text-zinc-600 rounded-xl cursor-not-allowed text-sm font-bold">No Resume</button>
                                                            )}

                                                            {applicant.isSelected ? (

                                                                <>
                                                                    {/* Interview Actions */}
                                                                    <button
                                                                        onClick={() => {
                                                                            setSchedulingFor({ studentId: applicant.user._id, jobId: viewingApplicantsFor._id });
                                                                            setShowScheduleModal(true);
                                                                        }}
                                                                        className="flex-1 flex items-center justify-center py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700 shadow-sm"
                                                                    >
                                                                        <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Schedule
                                                                    </button>

                                                                    <button disabled className="flex-1 flex items-center justify-center py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl cursor-default shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                                                                        <CheckCircle className="w-4 h-4 mr-2" /> Selected
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSelectCandidate(applicant.applicationId)}
                                                                    disabled={selectingApplicant === applicant.applicationId}
                                                                    className="flex-1 flex items-center justify-center py-3 bg-white hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] disabled:opacity-70 hover:-translate-y-0.5"
                                                                >
                                                                    {selectingApplicant === applicant.applicationId ? 'Processing...' : 'Hire Student'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* IF Viewing Jobs List */
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-sm mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Posted Opportunities</h2>
                                            <p className="text-sm text-zinc-400 mt-1 font-medium">Manage your job listings and view incoming applications.</p>
                                        </div>
                                        <span className="text-sm font-bold text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/20 shadow-sm whitespace-nowrap">
                                            {jobs.length} Active Listings
                                        </span>
                                    </div>

                                    {jobs.length === 0 ? (
                                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-16 text-center text-zinc-500 backdrop-blur-sm">
                                            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Briefcase className="w-10 h-10 text-zinc-600" />
                                            </div>
                                            <p className="text-lg font-medium">You haven't posted any jobs yet.</p>
                                            <p className="text-sm mt-2 mb-6">Create your first listing to start hiring students.</p>
                                            <button onClick={() => { setActiveTab('post'); setEditingJobId(null); setJobFormData({}); }} disabled={profile.status !== 1} className={"px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/20 disabled:opacity-50 disabled:cursor-not-allowed"}>
                                                Post a Job Now
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-5">
                                            {jobs.map(job => (
                                                <div key={job._id} className="group bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-6 sm:p-8 hover:border-violet-500/40 transition-all duration-300 shadow-lg flex flex-col md:flex-row justify-between gap-6 hover:shadow-[0_4px_25px_-5px_rgba(139,92,246,0.1)]">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                                            <h3 className="text-2xl font-bold text-white group-hover:text-violet-100 transition-colors">{job.title}</h3>
                                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${job.status === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                                {job.status === 1 ? 'Active' : 'Closed'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center text-sm font-semibold text-zinc-400 gap-4 mt-4">
                                                            <span className="flex items-center bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800"><IndianRupee className="w-4 h-4 mr-1.5 text-emerald-400" /> {job.package} LPA</span>
                                                            {job.minCgpa && <span className="flex items-center bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800"><GraduationCap className="w-4 h-4 mr-1.5 text-violet-400" /> Min CGPA: {job.minCgpa}</span>}
                                                            {job.deadline && <span className="flex items-center bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800"><Clock className="w-4 h-4 mr-1.5 text-amber-400" /> {new Date(job.deadline).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row md:flex-col justify-center items-stretch sm:items-center md:items-end md:border-l border-t md:border-t-0 border-zinc-800/80 pt-5 md:pt-0 md:pl-6 shrink-0 gap-3 min-w-[200px]">
                                                        {/* Clickable Applicants Count Badge */}
                                                        <button onClick={() => handleViewApplicants(job)} className="w-full flex items-center justify-center text-white font-bold transition-all bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl shadow-lg shadow-violet-900/20 hover:-translate-y-0.5">
                                                            <Users className="w-4 h-4 mr-2" /> View {job.applicantCount || 0} Applicants
                                                        </button>

                                                        <div className="flex items-center w-full gap-2">
                                                            <button onClick={() => startJobEdit(job)} className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-bold flex items-center justify-center transition-colors border border-zinc-700">
                                                                <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteJob(job._id)} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold flex items-center justify-center transition-colors border border-red-500/20" title="Delete Job">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB: POST / EDIT JOB */}
                    {activeTab === 'post' && (
                        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-3xl">
                            <div className="mb-8 border-b border-zinc-800/80 pb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{editingJobId ? 'Edit Job Posting' : 'Create New Opportunity'}</h2>
                                <p className="text-sm text-zinc-400 mt-1 font-medium">Fill in the details below to attract the best students.</p>
                            </div>

                            <form onSubmit={handleJobSubmit} className="space-y-6">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Job Title <span className="text-red-500">*</span></label>
                                    <input required type="text" placeholder="e.g. Full Stack Developer" value={jobFormData.title || ''} onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Description <span className="text-red-500">*</span></label>
                                    <textarea required rows="6" placeholder="Describe the role, responsibilities, and requirements..." value={jobFormData.description || ''} onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner resize-none" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Package (LPA) <span className="text-red-500">*</span></label>
                                        <input required type="number" step="0.01" placeholder="e.g. 5.5" value={jobFormData.package || ''} onChange={(e) => setJobFormData({ ...jobFormData, package: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Min CGPA <span className="text-zinc-500 font-normal">(Optional)</span></label>
                                        <input type="number" step="0.01" placeholder="e.g. 7.5" value={jobFormData.minCgpa || ''} onChange={(e) => setJobFormData({ ...jobFormData, minCgpa: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Application Deadline <span className="text-zinc-500 font-normal">(Optional)</span></label>
                                        <input type="date" value={jobFormData.deadline || ''} onChange={(e) => setJobFormData({ ...jobFormData, deadline: e.target.value })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner [color-scheme:dark]" />
                                    </div>
                                    {editingJobId && (
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Job Status</label>
                                            <select value={jobFormData.status} onChange={(e) => setJobFormData({ ...jobFormData, status: Number(e.target.value) })} className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner">
                                                <option value={1}>Active (Visible to Students)</option>
                                                <option value={0}>Closed (Hidden)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-end gap-4 border-t border-zinc-800/80 mt-8">
                                    {editingJobId && (
                                        <button type="button" onClick={() => setActiveTab('jobs')} className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-colors border border-zinc-700">
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" disabled={isSaving} className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl flex items-center transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                                        {isSaving ? 'Processing...' : (editingJobId ? 'Save Changes' : <><Plus className="w-5 h-5 mr-2" /> Publish Job</>)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: SELECTED CANDIDATES */}
                    {activeTab === 'selected' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-emerald-900/40 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
                                        <Award className="w-7 h-7 mr-3 text-emerald-400" />
                                        Hired Candidates Overview
                                    </h2>
                                    <p className="text-sm text-zinc-400 mt-2 font-medium">
                                        You have successfully selected <strong className="text-emerald-400 font-bold">{selectedCandidates.length}</strong> students across all your listings.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {selectedCandidates.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl backdrop-blur-sm">
                                        <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No candidates have been selected yet.</p>
                                        <p className="text-sm mt-2">Go to your job listings to review applications and select candidates.</p>
                                    </div>
                                ) : (
                                    selectedCandidates.map((candidate, idx) => (
                                        <div key={idx} className="bg-zinc-900/60 backdrop-blur-sm border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_4px_30px_-5px_rgba(16,185,129,0.1)] flex flex-col h-full transition-all relative">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="font-bold text-white text-2xl tracking-tight">{candidate.user.name}</h3>
                                                    <p className="text-sm text-emerald-400 font-bold mt-2 flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                                                        <Briefcase className="w-4 h-4 mr-2" /> Hired for: {candidate.jobTitle}
                                                    </p>
                                                </div>
                                                <div className="bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800/80 text-center shadow-inner">
                                                    <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-0.5">CGPA</p>
                                                    <p className="text-emerald-400 font-black text-lg leading-none">{candidate.profile.cpga || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm text-zinc-300 font-medium flex-grow bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/50">
                                                <div className="flex items-center"><Mail className="w-4 h-4 mr-2.5 text-zinc-500" /> {candidate.user.email || 'N/A'}</div>
                                                <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2.5 text-zinc-500" /> {candidate.profile.department || 'N/A'} (Class of {candidate.profile.gratuationYear || 'N/A'})</div>
                                                <div className="flex items-center"><IndianRupee className="w-4 h-4 mr-2.5 text-zinc-500" /> Expected: {candidate.profile.expectedSalary || 'N/A'} LPA</div>
                                            </div>

                                            <div className="mt-6 pt-5 border-t border-zinc-800/80 flex gap-3">
                                                <a href={`mailto:${candidate.user.email}`} className="flex-1 flex items-center justify-center py-3 bg-white hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-0.5">
                                                    <Mail className="w-4 h-4 mr-2" /> Contact
                                                </a>
                                                {candidate.profile.resumeUrl && (
                                                    <button onClick={() => setPdfState({
                                                        show: true,
                                                        url: candidate.profile.resumeUrl,
                                                    })} className="flex-1 flex items-center justify-center py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700 shadow-sm hover:-translate-y-0.5">
                                                        <FileText className="w-4 h-4 mr-2 text-violet-400" /> View CV
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'interviews' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-sm">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Interview Pipeline</h2>
                                    <p className="text-sm text-zinc-400 mt-1 font-medium">Manage and host your scheduled video interviews.</p>
                                </div>
                            </div>

                            {interviews.length === 0 ? (
                                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-16 text-center text-zinc-500 backdrop-blur-sm">
                                    <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No interviews scheduled.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {interviews.map(interview => (
                                        <div key={interview._id} className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 hover:border-indigo-500/40 transition-all">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-white">{interview.title}</h3>
                                                <p className="text-zinc-400 font-semibold mt-2 flex items-center">
                                                    <User className="w-4 h-4 mr-2 text-zinc-500" /> Candidate: {interview.studentId?.name}
                                                </p>
                                                <p className="text-zinc-400 font-semibold mt-1 flex items-center">
                                                    <Briefcase className="w-4 h-4 mr-2 text-zinc-500" /> Role: {interview.jobId?.title}
                                                </p>

                                                <div className="flex flex-wrap gap-4 mt-5">
                                                    <span className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 flex items-center text-sm font-semibold text-zinc-300">
                                                        <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> {new Date(interview.scheduledTime).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center gap-3 shrink-0 min-w-[200px] border-t md:border-t-0 border-zinc-800/80 pt-5 md:pt-0">
                                                {interview.status === 'scheduled' ? (
                                                    <>
                                                        <button onClick={() => navigate(`/interview/${interview.roomName}`)} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]">
                                                            <Video className="w-4 h-4 mr-2" /> Launch Room
                                                        </button>
                                                        <button onClick={() => updateInterviewStatus(interview._id, 'completed')} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all border border-zinc-700 text-sm">
                                                            Mark as Completed
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button disabled className="w-full py-3.5 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl flex items-center justify-center border border-emerald-500/20 cursor-default">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Interview Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >

            {showScheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Schedule Interview</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleScheduleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">Round / Title</label>
                                <input required type="text" value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Date</label>
                                    <input required type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Time</label>
                                    <input required type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white [color-scheme:dark]" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]">
                                Confirm & Notify Student
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {pdfState.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
                    <div className="relative h-full w-full max-w-6xl rounded-2xl bg-zinc-950 shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">

                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                            <h3 className="text-zinc-200 font-semibold flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-violet-400" /> Resume Document
                            </h3>
                            <button
                                onClick={() => setPdfState({ show: false, url: "" })}
                                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white transition-colors flex items-center text-sm font-semibold border border-zinc-700"
                            >
                                <X className="w-4 h-4 mr-1" /> Close
                            </button>
                        </div>

                        <div className="flex-1 bg-zinc-950 p-2 sm:p-4">
                            <iframe
                                src={import.meta.env.VITE_BASE_BACK_URL + pdfState.url}
                                title="PDF Viewer"
                                className="h-full w-full rounded-xl border border-zinc-800/50 bg-zinc-900"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}