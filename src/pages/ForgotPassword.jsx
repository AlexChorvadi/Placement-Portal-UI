import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    const navigate = useNavigate();

    const handleNext = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (step === 1) {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, { email: formData.email });
                setStep(2);
            } else if (step === 2) {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/verify-otp`, { email: formData.email, otp: formData.otp });
                setStep(3);
            } else {
                if (formData.newPassword !== formData.confirmPassword) return alert("Passwords don't match");
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
                    email: formData.email, otp: formData.otp, newPassword: formData.newPassword
                });
                alert("Password updated successfully!");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>

                <form onSubmit={handleNext} className="space-y-4">
                    {step === 1 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 w-5 h-5 text-zinc-500" />
                                <input required type="email" className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-violet-500"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Informative Note */}
                            <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl">
                                <p className="text-xs text-violet-200 font-medium leading-relaxed">
                                    We've sent a 6-digit verification code to <span className="text-white font-bold">{formData.email}</span>. Please check your inbox (and spam folder) to continue.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Enter OTP</label>
                                <div className="relative flex items-center">
                                    <KeyRound className="absolute left-3 w-5 h-5 text-zinc-500" />
                                    <input
                                        required
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-violet-500 tracking-[0.5em] text-center"
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">New Password</label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 w-5 h-5 text-zinc-500" />
                                    <input required type="password" className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-violet-500"
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Confirm Password</label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 w-5 h-5 text-zinc-500" />
                                    <input required type="password" className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-violet-500"
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                        </>
                    )}

                    <button disabled={loading} className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl flex items-center justify-center transition-all">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (step === 3 ? "Update Password" : "Continue")}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </button>
                </form>
            </div>
        </div>
    );
}