//this is registration page

import React, { useState } from 'react';
import axios from 'axios';
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  // Form State encapsulating all possible fields
  const [formData, setFormData] = useState({
    // Base User Fields
    role: 'student',
    name: '',
    email: '',
    password: '',

    // Company Fields
    companyName: '',
    website: '',
    location: '',
    description: '',

    // Student Fields
    cpga: '',
    department: '',
    gratuationYear: '',
    skills: '', // Will be converted to array on submit
    expectedSalary: '',
    experience: '',
    resumeFile: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrorMessage('');

    if (file) {
      // Validate File Type (PDF only)
      if (file.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are allowed for resumes.');
        e.target.value = null; // Clear the invalid selection
        return;
      }

      // Validate File Size (Max 5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage('File size must be less than 5MB.');
        e.target.value = null; // Clear the invalid selection
        return;
      }

      // If valid, save to state
      setFormData(prev => ({ ...prev, resumeFile: file }));
    } else {
      setFormData(prev => ({ ...prev, resumeFile: null }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // Create a FormData object (Required for file uploads)
      const submitData = new FormData();

      // Append base fields
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('role', formData.role);

      // Append role-specific fields
      if (formData.role === 'company') {
        submitData.append('companyName', formData.companyName);
        submitData.append('website', formData.website);
        submitData.append('location', formData.location);
        submitData.append('description', formData.description);
      } else if (formData.role === 'student') {
        submitData.append('cpga', formData.cpga);
        submitData.append('department', formData.department);
        submitData.append('gratuationYear', formData.gratuationYear);
        submitData.append('expectedSalary', formData.expectedSalary);
        submitData.append('experience', formData.experience);

        // Convert comma-separated string to an array and send as JSON string
        const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
        submitData.append('skills', JSON.stringify(skillsArray));

        // Append the file if it exists
        if (formData.resumeFile) {
          submitData.append('resume', formData.resumeFile);
        }
      } else if (formData.role === 'admin') {
        submitData.append('adminSecret', formData.adminSecret);
      }

      // Replace with your actual registration endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Tells the backend to expect files
        }
      });

      console.log('Registration successful:', response.data);
      alert('Account created successfully! Please log in.');
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(
        error.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 py-12 relative overflow-hidden selection:bg-violet-500/30">

      {/* Cinematic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl shadow-2xl p-8 sm:p-12 z-10 relative animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Create an Account
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            Join the platform to unlock your next opportunity.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 text-center">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;

                return (
                  <label
                    key={r.id}
                    className={`cursor-pointer rounded-2xl border flex flex-col items-center justify-center py-5 px-2 transition-all duration-300 select-none ${isSelected
                      ? 'bg-violet-500/10 border-violet-500/50 text-violet-400 shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)] scale-105'
                      : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon className={`mb-2.5 w-7 h-7 transition-colors ${isSelected ? 'text-violet-400' : 'text-zinc-600'}`} />
                    <span className="text-sm font-bold">{r.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-px bg-zinc-800/80 w-full max-w-md"></div>
          </div>

          {/* Base Fields (Required for all roles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- COMPANY SPECIFIC FIELDS ---------------- */}
          {formData.role === 'company' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-zinc-800/80 pb-3 mt-4">
                Company Profile Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Tech Corp Ltd."
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Website URL</label>
                  <input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Headquarters Location</label>
                  <input
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">About the Company</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe your company's mission..."
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------- STUDENT SPECIFIC FIELDS ---------------- */}
          {formData.role === 'student' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest border-b border-zinc-800/80 pb-3 mt-4">
                Academic & Professional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="gratuationYear"
                    type="number"
                    required
                    value={formData.gratuationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2024"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Current CGPA <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="cpga"
                    type="number"
                    step="0.01"
                    required
                    value={formData.cpga}
                    onChange={handleChange}
                    placeholder="e.g. 8.5"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Expected Salary (LPA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="expectedSalary"
                    type="number"
                    required
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    placeholder="e.g. 6.0"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Technical Skills <span className="text-red-500">*</span> <span className="text-zinc-600 font-normal ml-1">(Comma separated)</span>
                  </label>
                  <input
                    name="skills"
                    type="text"
                    required
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, Python"
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">Experience Summary <span className="text-zinc-600 font-normal ml-1">(Optional)</span></label>
                  <input
                    name="experience"
                    type="text"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Briefly mention any internships or projects..."
                    className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
                  />
                </div>

                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors">
                    Upload Resume <span className="text-zinc-600 font-normal ml-1">(PDF, Max 5MB)</span>
                  </label>
                  <input
                    name="resumeFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 hover:border-zinc-700 transition-all 
                    file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer shadow-inner"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------- ADMIN SPECIFIC FIELDS ---------------- */}
          {formData.role === 'admin' && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4">
              <label className="block text-sm font-semibold text-zinc-400 mb-2">
                Admin Secret Key <span className="text-red-500">*</span>
              </label>
              <input
                name="adminSecret"
                type="password"
                required
                value={formData.adminSecret || ''}
                onChange={handleChange}
                placeholder="Enter secret access key"
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-violet-500/30 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-900 font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 focus:outline-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin mr-3"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="mt-8 pt-8 border-t border-zinc-800/80 text-center">
          <p className="text-sm font-medium text-zinc-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-violet-400 hover:text-violet-300 font-bold transition-colors focus:outline-none"
            >
              Sign in to your portal
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}