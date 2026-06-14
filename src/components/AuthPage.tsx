/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Mail, Lock, ShieldCheck, Milestone, ArrowRight, Eye, ShieldAlert, KeyRound, Loader2, RefreshCw, X } from "lucide-react";
import { loginUser, registerUser } from "../services/api";
import { User } from "../types";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onGoBackHome: () => void;
}

export default function AuthPage({ onAuthSuccess, onGoBackHome }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("dr.chen@kidneyvision.org");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("");
  const [hospital, setHospital] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Custom toast animation states
  const [showToast, setShowToast] = useState(true);
  
  // Auto-hide the security established toast after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (isLogin) {
        // Clinical Portal Login
        const user = await loginUser(email, password);
        onAuthSuccess(user);
      } else {
        // Clinical Request Access (Registration)
        if (!fullName || !hospital) {
          setErrorMsg("S'il vous plaît remplir tous les champs requis.");
          setLoading(false);
          return;
        }
        const user = await registerUser(email, fullName, hospital);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur s'est produite lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-layout" className="min-h-screen flex flex-col md:flex-row bg-[#faf8ff] text-[#131b2e] selection:bg-[#b4c5ff]">
      
      {/* Visual Column (Medical Imaging HUD Simulation - Identical to Screen 1 Left Side) */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-[#283044] relative overflow-hidden items-center justify-center p-12">
        {/* Subtle grid mesh overlays & radial blurs */}
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

        {/* Real-time scan card */}
        <div className="relative z-10 w-full max-w-2xl space-y-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#39b8fd] rounded-full animate-pulse" />
                <span className="font-sans text-[11px] font-bold tracking-widest text-[#acedff] uppercase">
                  Real-time Scan Triage
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#acedff]" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Simulated Ultrasound Display with contour overlays */}
            <div className="aspect-video bg-black/45 rounded-xl relative group overflow-hidden border border-white/10 flex items-center justify-center">
              <img 
                alt="Nephrology contour scan visualization" 
                className="w-full h-full object-cover mix-blend-screen opacity-90 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
              />
              {/* Scan Reticle Focus HUD */}
              <div className="absolute inset-0 border-[2px] border-dashed border-[#acedff]/30 m-8 rounded-lg pointer-events-none" />
              
              {/* Floating diagnostic variables */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-[#acedff] border border-white/10 font-mono leading-relaxed">
                PATHOLOGY_DETECTED: 0.042s <br />
                CONFIDENCE: 99.8%
              </div>

              {/* Top-right scanning frequency */}
              <div className="absolute top-3 right-3 text-[9px] font-mono text-white/50 bg-black/30 px-2 py-0.5 rounded">
                FREQ: 8.5MHz
              </div>
            </div>
          </div>

          {/* Copy texts from screenshot */}
          <div className="space-y-2 max-w-lg text-left">
            <h2 className="font-sans text-2xl lg:text-3xl font-semibold text-white tracking-tight">
              Advanced Nephrology AI
            </h2>
            <p className="font-sans text-xs md:text-sm text-white/70 leading-relaxed">
              Securely analyze renal scans with clinical-grade precision. KidneyVision AI leverages high-resolution neural networks to support radiologists in early pathology detection.
            </p>
          </div>

          {/* Certification indicators */}
          <div className="pt-6 border-t border-white/15 flex gap-12 text-left">
            <div className="flex flex-col">
              <span className="font-sans text-[10px] uppercase tracking-wider text-white/50">
                Security Standard
              </span>
              <span className="font-sans text-sm font-semibold text-white flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4.5 h-4.5 text-[#acedff]" />
                HIPAA Compliant
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[10px] uppercase tracking-wider text-white/50">
                Encryption
              </span>
              <span className="font-sans text-sm font-semibold text-white flex items-center gap-1.5 mt-1">
                <KeyRound className="w-4.5 h-4.5 text-[#acedff]" />
                AES-256 Bit Crypts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Login / Register Form Side (Identical look to Screen 1 Right Column) */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-white flex flex-col justify-between p-6 md:p-12 relative">
        
        {/* Form Column Header */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onGoBackHome}
            className="flex items-center gap-2 group cursor-pointer text-[#004ac6]"
          >
            <div id="side-branding-logo" className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#004ac6] transition-all">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-sans font-bold text-base text-[#131b2e] tracking-tight group-hover:text-[#2563eb] transition-colors">
              KidneyVision <span className="text-[#2563eb]">AI</span>
            </span>
          </button>
        </div>

        {/* Central Auth Canvas */}
        <div className="max-w-md w-full mx-auto py-12 text-left">
          <div className="mb-8">
            <h1 className="font-sans text-2xl lg:text-3xl font-bold text-[#131b2e] tracking-tight mb-1">
              {isLogin ? "Welcome Back" : "Request Clinical Access"}
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#434655]">
              {isLogin 
                ? "Please enter your credentials to access the clinical portal." 
                : "Submit details below to authorize a workspace account under your medical facility."
              }
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Conditional fields for Registration */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]" htmlFor="reg-name">
                    Full Name (M.D. / Specialist)
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white outline-none transition-all" 
                      id="reg-name" 
                      placeholder="Dr. S. Chen" 
                      required 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]" htmlFor="reg-hospital">
                    Medical Association / Hospital
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full pl-4 pr-4 py-2 bg-[#f2f3ff] border border-[#c3c6d7] rounded-xl text-xs focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white outline-none transition-all" 
                      id="reg-hospital" 
                      placeholder="Metropolitan Medical Center" 
                      required 
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-[#434655]" htmlFor="password">
                  Password
                </label>
                {isLogin && (
                  <a 
                    onClick={() => alert("Simulated password reset instructions sent with HIPAA verification logs.")}
                    className="font-sans text-xs text-[#2563eb] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </a>
                )}
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

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input 
                  className="w-4 h-4 rounded border-[#c3c6d7] text-[#2563eb] focus:ring-[#2563eb]" 
                  id="remember" 
                  type="checkbox"
                  defaultChecked
                />
                <label className="ml-2 font-sans text-xs text-[#434655] cursor-pointer" htmlFor="remember">
                  Remember device for 30 days
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <button 
              id="submit-auth-btn"
              className="w-full mt-4 bg-[#2563eb] text-white font-sans font-semibold text-sm py-3 rounded-xl shadow-lg shadow-[#2563eb]/15 hover:bg-[#004ac6] transition-all active:scale-[0.98] duration-100 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:pointer-events-none" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting Clinical Authentication...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Request Portal Authorization"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Tab Footer Link */}
          <div className="mt-6 pt-6 border-t border-[#c3c6d7]/50 text-center">
            <p className="font-sans text-xs text-[#434655]">
              {isLogin ? "Don't have clinical access?" : "Already have authorized access?"}{" "}
              <button 
                onClick={() => {
                  setErrorMsg(null);
                  setIsLogin(!isLogin);
                }}
                className="text-[#2563eb] font-semibold hover:underline cursor-pointer"
              >
                {isLogin ? "Request Access" : "Sign In to Portal"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#434655]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans font-medium">Clinically Verified Environment</span>
          </div>
          <div className="flex gap-4 text-[#737686]">
            <a className="hover:text-primary transition-colors hover:underline" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors hover:underline" href="#">Terms</a>
            <a className="hover:text-primary transition-colors hover:underline" href="#">Support</a>
          </div>
        </div>
      </div>

      {/* Floating security Established Toast (Identical to Screen 1 Toast) */}
      {showToast && (
        <div 
          id="security-toast" 
          className="fixed bottom-4 right-4 bg-[#eaedff] border border-[#2563eb]/20 px-4 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce cursor-pointer z-50 transition-all duration-300"
        >
          <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full animate-pulse" />
          <span className="font-sans text-xs font-bold text-[#2563eb]">Secure connection established</span>
          <button 
            className="text-[#737686] hover:text-[#131b2e] ml-2 cursor-pointer"
            onClick={() => setShowToast(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
