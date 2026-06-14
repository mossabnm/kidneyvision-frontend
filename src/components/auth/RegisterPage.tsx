import React, { useState, useEffect } from "react";
import { Mail, Lock, ShieldAlert, Loader2, Eye, KeyRound } from "lucide-react";
import { registerUser } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [hospital, setHospital] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setErrorMsg("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    
    try {
      const response = await registerUser(email, fullName, hospital, password, passwordConfirmation);
      login(response.token, response.user);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-layout" className="min-h-screen flex flex-col md:flex-row bg-[#faf8ff] text-[#131b2e] selection:bg-[#b4c5ff]">
      
      {/* Visual Column */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-[#283044] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-40">
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(195,198,215,0.15) 1px, transparent 1px)`,
              backgroundSize: "24px 24px"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6]/20 via-transparent to-[#005e6e]/10" />
        </div>

        <div className="relative z-10 w-full max-w-2xl space-y-6">
          <div className="space-y-2 max-w-lg text-left">
            <h2 className="font-sans text-2xl lg:text-3xl font-semibold text-white tracking-tight">
              Join KidneyVision AI
            </h2>
            <p className="font-sans text-xs md:text-sm text-white/70 leading-relaxed">
              Create a clinical workspace under your medical facility to securely analyze and manage patient scans with AI assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-white flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer text-[#004ac6]">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#004ac6] transition-all">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-sans font-bold text-base text-[#131b2e] tracking-tight group-hover:text-[#2563eb] transition-colors">
              KidneyVision <span className="text-[#2563eb]">AI</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-8 text-left">
          <div className="mb-6">
            <h1 className="font-sans text-2xl lg:text-3xl font-bold text-[#131b2e] tracking-tight mb-1">
              Request Clinical Access
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#434655]">
              Submit details below to authorize a workspace account.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]">
                Full Name (M.D. / Specialist)
              </label>
              <input 
                className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none" 
                placeholder="Dr. S. Chen" 
                required 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]">
                Hospital / Organization
              </label>
              <input 
                className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none" 
                placeholder="Metropolitan Medical Center" 
                required 
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]">
                Clinical Email
              </label>
              <input 
                className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none" 
                placeholder="name@hospital.org" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]">
                Password
              </label>
              <input 
                className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none" 
                placeholder="••••••••" 
                required 
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]">
                Confirm Password
              </label>
              <input 
                className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none" 
                placeholder="••••••••" 
                required 
                type="password"
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>

            <button 
              className="w-full mt-4 bg-[#2563eb] text-white font-sans font-semibold text-sm py-3 rounded-xl shadow-lg hover:bg-[#004ac6] transition-all flex items-center justify-center gap-1.5 disabled:opacity-55" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
              ) : (
                "Request Portal Authorization"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#c3c6d7]/50 text-center">
            <p className="font-sans text-xs text-[#434655]">
              Already have authorized access?{" "}
              <Link to="/login" className="text-[#2563eb] font-semibold hover:underline">
                Sign In to Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
