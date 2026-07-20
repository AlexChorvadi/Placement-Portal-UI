import React, { useState } from 'react';
import axios from 'axios';
import { 
    Briefcase, AlignLeft, IndianRupee, 
    GraduationCap, Calendar, Send, ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';

export default function PostJob() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        package: '',
        minCgpa: '',
        deadline: ''
    });

    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token missing. Please log in.');

            // The backend should ideally extract the companyId from the JWT user token
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/jobs/post`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus({ loading: false, error: '', success: 'Job posted successfully!' });
            
            // Clear form after successful submission
            setFormData({ title: '', description: '', package: '', minCgpa: '', deadline: '' });
            
            // Optional: Redirect back to dashboard after a delay
            // setTimeout(() => window.location.href = '/dashboard', 2000);

        } catch (err) {
            console.error('Job Posting Error:', err);
            setStatus({ 
                loading: false, 
                error: err.response?.data?.message || err.message || 'Failed to post job. Please try again.',
                success: '' 
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans relative overflow-hidden pb-12 selection:bg-violet-500/30">
            {/* Cinematic Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight">Placement Portal</h1>
                        <p className="text-xs text-zinc-500 font-medium">New Opportunity Creation</p>
                    </div>
                </div>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                </button>
            </nav>

            <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 mt-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-zinc-100 mb-2">Post a New Job</h2>
                    <p className="text-zinc-400">Fill in the details below to broadcast an opportunity to students.</p>
                </div>

                {/* Status Alerts */}
                {status.success && (
                    <div className="mb-6 bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 flex items-center space-x-3 text-emerald-400 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{status.success}</span>
                    </div>
                )}
                {status.error && (
                    <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center space-x-3 text-red-400 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{status.error}</span>
                    </div>
                )}

                {/* Job Posting Form */}
                <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="space-y-6">
                        
                        {/* Job Title */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-zinc-300 mb-2">
                                <Briefcase className="w-4 h-4 mr-2 text-zinc-500" />
                                Job Title <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input 
                                name="title"
                                type="text" 
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior React Developer" 
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all" 
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-zinc-300 mb-2">
                                <AlignLeft className="w-4 h-4 mr-2 text-zinc-500" />
                                Job Description <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea 
                                name="description"
                                required
                                rows="6" 
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the responsibilities, required skills, and daily tasks..." 
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Grid for Package, CGPA, and Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            
                            {/* Package */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-zinc-300 mb-2">
                                    <IndianRupee className="w-4 h-4 mr-2 text-zinc-500" />
                                    Package (LPA) <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input 
                                    name="package"
                                    type="number" 
                                    step="0.01"
                                    required
                                    value={formData.package}
                                    onChange={handleChange}
                                    placeholder="e.g., 6.5" 
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all" 
                                />
                            </div>

                            {/* Min CGPA */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-zinc-300 mb-2">
                                    <GraduationCap className="w-4 h-4 mr-2 text-zinc-500" />
                                    Min CGPA
                                    <span className="text-xs text-zinc-500 ml-2 font-normal">(Optional)</span>
                                </label>
                                <input 
                                    name="minCgpa"
                                    type="number" 
                                    step="0.01"
                                    value={formData.minCgpa}
                                    onChange={handleChange}
                                    placeholder="e.g., 7.5" 
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all" 
                                />
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-zinc-300 mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                                    Application Deadline
                                    <span className="text-xs text-zinc-500 ml-2 font-normal">(Optional)</span>
                                </label>
                                <input 
                                    name="deadline"
                                    type="date" 
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all [color-scheme:dark]" 
                                />
                            </div>

                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={status.loading}
                            className="flex items-center space-x-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-xl transition shadow-lg shadow-violet-900/20 w-full sm:w-auto justify-center"
                        >
                            <Send className="w-4 h-4" />
                            <span>{status.loading ? 'Publishing Job...' : 'Publish Job Post'}</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}