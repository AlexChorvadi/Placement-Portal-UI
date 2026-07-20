//this is admin dashboard

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Building2, Clock, CheckCircle,
    ShieldCheck, LogOut, ChevronRight, X, Mail, MapPin, Check, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Controls which detailed list is currently visible
    const [activeView, setActiveView] = useState(null); // 'students' | 'companies' | 'pending' | 'approved' | null

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("NoToken");

            // Replace with your actual admin stats endpoint
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Admin Dashboard Data:', response.data);
            setDashboardData(response.data.data);
        } catch (err) {
            if (err.message === "NoToken" || err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                setError('Failed to load admin dashboard data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleApproveCompany = async (companyId) => {
        if (!window.confirm("Are you sure you want to approve this company?")) return;

        try {
            const token = localStorage.getItem('token');
            // Add your approval endpoint logic here
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/approve-company/${companyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Company approved successfully!');
            fetchAdminData(); // Refresh data
        } catch (err) {
            alert('Failed to approve company.');
        }
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

    const { stats, lists } = dashboardData;

    // Helper to render the appropriate table based on activeView
    const renderDetailsTable = () => {
        if (!activeView) return null;

        const isStudentView = activeView === 'students';
        const dataList = lists[activeView] || [];

        if (activeView === 'interviews') {
            return (
                <div className="mt-8 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/40 font-bold text-lg">Interview Records</div>
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="text-zinc-400 uppercase text-[10px] bg-zinc-950/50">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {lists.interviews.map((int, i) => (
                                
                                <tr key={i}>
                                    {console.log(int)}
                                    <td className="px-6 py-4">{int.studentId?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{int.companyId?.companyProfile?.companyName || 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(int.scheduledTime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${int.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {int.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="mt-8 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/40">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            {isStudentView ? <Users className="w-4 h-4 text-blue-400" /> : <Building2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-white capitalize tracking-tight">
                            {activeView.replace(/([A-Z])/g, ' $1').trim()} Directory
                        </h3>
                    </div>
                    <button
                        onClick={() => setActiveView(null)}
                        className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-zinc-950/50 text-zinc-400 font-bold uppercase tracking-widest text-[10px] border-b border-zinc-800/80">
                            <tr>
                                <th className="px-6 py-4">Name & ID</th>
                                <th className="px-6 py-4">Contact</th>
                                {isStudentView ? (
                                    <>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">CGPA / Salary</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {dataList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 bg-zinc-900/20">
                                        No records found in this category.
                                    </td>
                                </tr>
                            ) : (
                                dataList.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-bold text-zinc-100 text-base">
                                                {isStudentView ? item.user.name : item.companyName}
                                            </p>
                                            <p className="text-xs font-medium text-zinc-500 mt-0.5">
                                                ID: {item._id.substring(0, 8)}...
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-zinc-300 font-medium">
                                                <Mail className="w-4 h-4 mr-2 text-zinc-500" />
                                                {item.user.email}
                                            </div>
                                        </td>

                                        {isStudentView ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                    {item.department || 'N/A'} <span className="text-zinc-500 ml-1">({item.gratuationYear || 'N/A'})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{item.cpga || 'N/A'}</span>
                                                        <span className="text-zinc-600 mx-3">|</span>
                                                        <span className="font-medium text-zinc-300">₹{item.expectedSalary?.toLocaleString() || 'N/A'}</span>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-300">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2 text-zinc-500" />
                                                        {item.location || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.status === 1 ? (
                                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center w-fit">
                                                            <CheckCircle className="w-3 h-3 mr-1.5" /> Approved
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center w-fit">
                                                            <Clock className="w-3 h-3 mr-1.5" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {item.status === 0 ? (
                                                        <button
                                                            onClick={() => handleApproveCompany(item._id)}
                                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5"
                                                        >
                                                            <Check className="w-4 h-4 mr-1.5" /> Approve
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-500 text-sm font-medium italic mr-2">No actions</span>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans relative overflow-hidden pb-12 selection:bg-violet-500/30">
            {/* Cinematic Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#0a0a0a]/70 backdrop-blur-xl px-6 py-4 flex justify-between items-center transition-all">
                <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-100 tracking-tight leading-tight">Admin Portal</h1>
                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                            System Overview
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} className="group flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-all bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline font-medium">Log out</span>
                </button>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-4">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Metrics</h2>
                    <p className="text-zinc-400 text-sm mt-1.5 font-medium">Monitor system statistics and manage pending company approvals.</p>
                </div>

                {/* Interactive Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Students Card */}
                    <div
                        onClick={() => setActiveView('students')}
                        className={`cursor-pointer group relative bg-zinc-900/60 backdrop-blur-sm border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${activeView === 'students' ? 'border-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] bg-blue-950/10' : 'border-zinc-800/80 hover:border-blue-500/30 hover:bg-zinc-800/40 shadow-xl'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                                <Users className="w-7 h-7 text-blue-400" />
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeView === 'students' ? 'text-blue-400 rotate-90' : 'text-zinc-600 group-hover:text-blue-400/70'}`} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white group-hover:text-blue-50 transition-colors">{stats.totalStudents}</h3>
                            <p className="text-xs font-bold text-blue-400 mt-2 uppercase tracking-widest">Total Students</p>
                        </div>
                    </div>

                    {/* All Companies Card */}
                    <div
                        onClick={() => setActiveView('companies')}
                        className={`cursor-pointer group relative bg-zinc-900/60 backdrop-blur-sm border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${activeView === 'companies' ? 'border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] bg-indigo-950/10' : 'border-zinc-800/80 hover:border-indigo-500/30 hover:bg-zinc-800/40 shadow-xl'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                                <Building2 className="w-7 h-7 text-indigo-400" />
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeView === 'companies' ? 'text-indigo-400 rotate-90' : 'text-zinc-600 group-hover:text-indigo-400/70'}`} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-white group-hover:text-indigo-50 transition-colors">{stats.totalCompanies}</h3>
                            <p className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">Total Companies</p>
                        </div>
                    </div>

                    {/* Pending Approvals Card */}
                    <div
                        onClick={() => setActiveView('pending')}
                        className={`cursor-pointer group relative bg-zinc-900/60 backdrop-blur-sm border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${activeView === 'pending' ? 'border-amber-500/50 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] bg-amber-950/10' : 'border-zinc-800/80 hover:border-amber-500/30 hover:bg-zinc-800/40 shadow-xl'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
                                <Clock className="w-7 h-7 text-amber-400" />
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeView === 'pending' ? 'text-amber-400 rotate-90' : 'text-zinc-600 group-hover:text-amber-400/70'}`} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-amber-400">{stats.pendingCompanies}</h3>
                            <p className="text-xs font-bold text-amber-500/80 mt-2 uppercase tracking-widest">Pending Approval</p>
                        </div>
                    </div>

                    {/* Approved Companies Card */}
                    <div
                        onClick={() => setActiveView('approved')}
                        className={`cursor-pointer group relative bg-zinc-900/60 backdrop-blur-sm border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${activeView === 'approved' ? 'border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] bg-emerald-950/10' : 'border-zinc-800/80 hover:border-emerald-500/30 hover:bg-zinc-800/40 shadow-xl'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                                <CheckCircle className="w-7 h-7 text-emerald-400" />
                            </div>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeView === 'approved' ? 'text-emerald-400 rotate-90' : 'text-zinc-600 group-hover:text-emerald-400/70'}`} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-emerald-400">{stats.approvedCompanies}</h3>
                            <p className="text-xs font-bold text-emerald-500/80 mt-2 uppercase tracking-widest">Approved Active</p>
                        </div>
                    </div>

                    <div onClick={() => setActiveView('interviews')} className="cursor-pointer bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 hover:border-indigo-500/50 transition shadow-xl">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase">Total Interviews</h4>
                        <p className="text-3xl font-black text-white">{stats.totalScheduled}</p>
                    </div>
                    <div onClick={() => setActiveView('interviews')} className="cursor-pointer bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 hover:border-emerald-500/50 transition shadow-xl">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase">Completed</h4>
                        <p className="text-3xl font-black text-emerald-400">{stats.done}</p>
                    </div>
                </div>

                {/* Detailed Table View */}
                {renderDetailsTable()}

            </main>
        </div>
    );
}