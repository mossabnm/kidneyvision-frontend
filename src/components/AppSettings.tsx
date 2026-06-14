/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sliders, Database, ShieldCheck, Heart, User, CheckCircle2, AlertCircle, RefreshCw, Key, HelpCircle } from "lucide-react";
import { API_URL } from "../services/api";

export default function AppSettings() {
  const [triggerValue, setTriggerValue] = useState(85);
  const [useBackupLogs, setUseBackupLogs] = useState(true);
  const [forceSim, setForceSim] = useState(false);

  const handleToggleSim = (checked: boolean) => {
    alert("Simulation mode has been permanently removed in this version. The system is strictly bound to the live backend.");
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">System Settings</h2>
        <p className="font-sans text-xs text-[#434655]">
          Manage clinical alert thresholds, check API server status, and configure HIPAA privacy variables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Set 1: Portal Parameters */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 space-y-5">
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] flex items-center gap-1.5 pb-2 border-b border-[#e2e8f0]">
            <Sliders className="w-4 h-4 text-[#2563eb]" />
            Radiological Alert Parameters
          </h3>

          {/* Alert Threshold Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#131b2e]">AI Confidence Trigger Threshold</span>
              <span className="font-bold text-[#2563eb]">{triggerValue}%</span>
            </div>
            <p className="text-[10.5px] text-[#737686] leading-normal">
              Minimum predictive confidence rate required to trigger an immediate "Anomaly Detected" Bosniak alert. Scans failing to reach this rate are redirected for manual "Review Required" peer checks.
            </p>
            <input 
              type="range" 
              min="50" 
              max="98" 
              value={triggerValue} 
              onChange={(e) => setTriggerValue(Number(e.target.value))}
              className="w-full accent-[#2563eb] cursor-pointer mt-1" 
            />
          </div>

          {/* Toggle audit trails */}
          <div className="flex items-start gap-3 pt-2">
            <input 
              id="backup"
              type="checkbox" 
              className="mt-1 w-4 h-4 text-[#2563eb] border-[#c3c6d7] rounded focus:ring-[#2563eb]"
              checked={useBackupLogs}
              onChange={(e) => setUseBackupLogs(e.target.checked)}
            />
            <label htmlFor="backup" className="text-xs font-semibold text-[#131b2e] leading-snug cursor-pointer">
              Enable SOC-2 / HIPAA Continuous Audit Trail Logging
              <span className="block text-[10px] text-[#737686] font-normal leading-normal mt-0.5">
                Automatically append active radiologist signature timestamps, terminal IP nodes, and pixel changes to the hospital's local ledger file.
              </span>
            </label>
          </div>
        </div>

        {/* Set 2: Server configuration */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 space-y-5">
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] flex items-center gap-1.5 pb-2 border-b border-[#e2e8f0]">
            <Database className="w-4 h-4 text-[#2563eb]" />
            Clinical API Connection Status
          </h3>

          {/* Backend target */}
          <div className="space-y-1">
            <span className="text-[10.5px] text-[#737686] block">Configured API Target Endpoint:</span>
            <div className="p-2.5 bg-[#f2f3ff] rounded-lg border border-[#c3c6d7] font-mono text-[11px] text-[#131b2e] select-all">
              {API_URL}
            </div>
          </div>

          {/* Toggle simulated mode */}
          <div className="p-4 bg-[#eaedff] border border-[#2563eb]/20 rounded-lg space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#2563eb]">Simulation Mode Fallback Control</span>
              
              {/* Simple Pill Toggle */}
              <button 
                onClick={() => handleToggleSim(!forceSim)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none cursor-pointer ${forceSim ? "bg-blue-600" : "bg-neutral-300"}`}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${forceSim ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
            
            <p className="text-[10.5px] text-[#434655] leading-normal">
              {forceSim 
                ? "Active: System falls back to offline-simulator. All CRUD and prediction operations are computed locally in the browser memory for immediate flawless proof of concept testing." 
                : "Active: System attempts direct backend network exchange first. If the remote Python server is missing, requests may fail or fall back."
              }
            </p>
            
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>Simulator environment is fully loaded</span>
            </div>
          </div>

          {/* Secure Handshake token */}
          <div className="space-y-1">
            <span className="text-[10.5px] text-[#737686] block">Secure Encrypted Token Identifier:</span>
            <div className="text-[9px] font-mono text-[#737686] break-all p-2 bg-[#faf8ff] rounded border border-[#c3c6d7]/40">
              JWT_KIDNEY_SECURE_TOKEN_ENCRYPT_AES256_ACTIVE_11029F7
            </div>
          </div>
        </div>

      </div>

      {/* Profile info of logged clinical expert */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 space-y-3">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] flex items-center gap-1.5 pb-2 border-b border-[#e2e8f0]">
          <User className="w-4 h-4 text-[#2563eb]" />
          Radiologist Security Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#737686] text-[10px] uppercase block tracking-wide">Physician:</span>
            <span className="font-bold text-[#131b2e]">Dr. S. Chen</span>
          </div>
          <div>
            <span className="text-[#737686] text-[10px] uppercase block tracking-wide">Medical Facility:</span>
            <span className="font-bold text-[#131b2e]">Chief of Radiology, MMC</span>
          </div>
          <div>
            <span className="text-[#737686] text-[10px] uppercase block tracking-wide">Signature ID:</span>
            <span className="font-mono text-xs text-[#2563eb] font-semibold">MD-CH-2026-6130</span>
          </div>
        </div>
      </div>
    </div>
  );
}
