import React, { useState, useEffect } from "react";
import { Mail, Lock, ShieldAlert, KeyRound, Loader2, X, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import { loginUser } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const response = await loginUser(email, password);
      // loginUser returns { token, user } or throws
      login(response.token, response.user);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid login credentials.");
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
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#39b8fd] rounded-full animate-pulse" />
                <span className="font-sans text-[11px] font-bold tracking-widest text-[#acedff] uppercase">
                  Real-time Scan Triage
                </span>
              </div>
            </div>
            <div className="aspect-video bg-black/45 rounded-xl relative group overflow-hidden border border-white/10 flex items-center justify-center">
              <img 
                alt="Nephrology contour scan visualization" 
                className="w-full h-full object-cover mix-blend-screen opacity-90 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
              />
            </div>
          </div>

          <div className="space-y-2 max-w-lg text-left">
            <h2 className="font-sans text-2xl lg:text-3xl font-semibold text-white tracking-tight">
              Advanced Nephrology AI
            </h2>
            <p className="font-sans text-xs md:text-sm text-white/70 leading-relaxed">
              Securely analyze renal scans with clinical-grade precision.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-white flex flex-col justify-between p-6 md:p-12 relative">
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

        <div className="max-w-md w-full mx-auto py-12 text-left">
          <div className="mb-8">
            <h1 className="font-sans text-2xl lg:text-3xl font-bold text-[#131b2e] tracking-tight mb-1">
              Welcome Back
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#434655]">
              Please enter your credentials to access the clinical portal.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]" htmlFor="email">
                Clinical Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white outline-none transition-all" 
                  id="email" 
                  name="email" 
                  placeholder="name@hospital.org" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#2563eb] hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white outline-none transition-all" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="w-full mt-4 bg-[#2563eb] text-white font-sans font-semibold text-sm py-3 rounded-xl shadow-lg shadow-[#2563eb]/15 hover:bg-[#004ac6] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
              ) : (
                <><Lock className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#c3c6d7]/50 text-center">
            <p className="font-sans text-xs text-[#434655]">
              Don't have clinical access?{" "}
              <Link to="/register" className="text-[#2563eb] font-semibold hover:underline cursor-pointer">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-[#eaedff] border border-[#2563eb]/20 px-4 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce cursor-pointer z-50">
          <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full animate-pulse" />
          <span className="font-sans text-xs font-bold text-[#2563eb]">Secure connection established</span>
        </div>
      )}
    </div>
  );
}
