import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { 
  Activity, ShieldCheck, History, Settings, LogOut, FileText, 
  LayoutDashboard, User, HelpCircle, Eye, Menu, X, PlusCircle, BrainCircuit
} from "lucide-react";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import React, { Suspense } from "react";
import LoadingSkeleton from "./components/common/LoadingSkeleton";

const AppDashboard = React.lazy(() => import("./components/AppDashboard"));
const AppNewAnalysis = React.lazy(() => import("./components/AppNewAnalysis"));
const AppHistory = React.lazy(() => import("./components/AppHistory"));
const AppReports = React.lazy(() => import("./components/AppReports"));
const AppSettings = React.lazy(() => import("./components/AppSettings"));
const GuestAnalysis = React.lazy(() => import("./components/GuestAnalysis"));
const ForgotPassword = React.lazy(() => import("./components/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./components/ResetPassword"));

import { AuthProvider, useAuth } from "./contexts/AuthContext";

function PortalLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/analysis")) return "analysis";
    if (path.includes("/history")) return "history";
    if (path.includes("/reports")) return "reports";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <div id="portal-full-layout" className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col lg:flex-row font-sans selection:bg-[#b4c5ff]">
      
      {/* Mobile Bar Controls */}
      <header className="lg:hidden bg-white border-b border-[#c3c6d7] px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-sm text-[#131b2e] tracking-tight">
            KidneyVision <span className="text-[#2563eb]">AI</span>
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-[#434655] hover:text-[#131b2e]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SideNavBar */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-[#f2f3ff] border-r border-[#c3c6d7]/70 w-64 p-6 flex flex-col justify-between z-30 transform lg:transform-none lg:static transition-transform duration-300 lg:h-screen lg:sticky lg:top-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-sans text-base font-extrabold text-[#111827] tracking-tight leading-none">
                KidneyVision <span className="text-[#2563eb]">AI</span>
              </h1>
              <p className="font-sans text-[10px] text-[#737686] uppercase tracking-wider mt-1.5 font-bold">
                Clinical Portal
              </p>
            </div>
          </div>

          <div className="px-1.5">
            <button 
              onClick={() => {
                window.location.href = "/analysis";
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#004ac6] text-white rounded-xl py-2.5 px-4 text-xs font-semibold hover:shadow-md transition-all active:scale-[0.98] duration-100 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              New Analysis
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 px-1 font-sans text-xs">
            <a href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === "dashboard" ? "bg-[#eaedff] text-[#2563eb] font-bold shadow-sm translate-x-1" : "text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/45"
            }`}>
              <LayoutDashboard className="w-4.5 h-4.5 shrink-0" /> Dashboard
            </a>
            <a href="/analysis" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === "analysis" ? "bg-[#eaedff] text-[#2563eb] font-bold shadow-sm translate-x-1" : "text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/45"
            }`}>
              <Activity className="w-4.5 h-4.5 shrink-0" /> New Analysis
            </a>
            <a href="/history" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === "history" ? "bg-[#eaedff] text-[#2563eb] font-bold shadow-sm translate-x-1" : "text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/45"
            }`}>
              <History className="w-4.5 h-4.5 shrink-0" /> History
            </a>
            <a href="/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === "reports" ? "bg-[#eaedff] text-[#2563eb] font-bold shadow-sm translate-x-1" : "text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/45"
            }`}>
              <FileText className="w-4.5 h-4.5 shrink-0" /> Reports
            </a>
            <a href="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === "settings" ? "bg-[#eaedff] text-[#2563eb] font-bold shadow-sm translate-x-1" : "text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/45"
            }`}>
              <Settings className="w-4.5 h-4.5 shrink-0" /> Settings
            </a>
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 px-1 pt-4 border-t border-[#c3c6d7]/30">
          <button
            onClick={() => alert("Simulation help desk ticket generated with diagnostic logs package. A clinical specialist will attend your request shortly.")}
            className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/40 rounded-xl transition-colors text-left cursor-pointer"
          >
            <HelpCircle className="w-4.5 h-4.5 shrink-0" />
            Help Center
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-[#434655] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-neutral-500 hover:text-red-500" />
            Logout
          </button>

          <div className="mt-4 px-2 py-2 flex items-center gap-3 border-t border-[#c3c6d7]/20 pt-4">
            <img 
              alt="Clinician Avatar Badge" 
              className="w-9 h-9 rounded-full object-cover border border-[#c3c6d7]" 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"}
            />
            <div className="flex flex-col min-w-0 text-left">
              <span className="font-sans text-xs text-[#131b2e] font-bold truncate">
                {user?.name || "Dr. S. Chen"}
              </span>
              <span className="text-[10px] text-[#737686] font-semibold tracking-wider font-sans mt-0.5 uppercase">
                Radiology
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AppDashboard />} />
            <Route path="/analysis" element={<AppNewAnalysis onAddSuccess={() => window.location.href = "/history"} />} />
            <Route path="/history" element={<AppHistory />} />
            <Route path="/reports" element={<AppReports />} />
            <Route path="/settings" element={<AppSettings />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigateToAuth={() => window.location.href = "/login"} onEnterPortalDirectly={() => window.location.href = "/guest"} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<Suspense fallback={<LoadingSkeleton />}><ForgotPassword /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<LoadingSkeleton />}><ResetPassword /></Suspense>} />
          <Route path="/guest" element={<GuestAnalysis />} />

          {/* Protected Routes rendered inside PortalLayout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
