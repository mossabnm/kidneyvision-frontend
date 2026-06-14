/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileDown, Printer, Clipboard, Sparkles, CheckSquare, Search, Award, CheckCircle2 } from "lucide-react";

export default function AppReports() {
  const reports = [
    { title: "MM_RE_CYST_CLASSIFICATION_SUMMARY_MAY.pdf", date: "May 28, 2026", type: "PDF Document", size: "2.4 MB" },
    { title: "BOSNIAK_III_IV_TRIAGE_SURVEILLANCE_INDEX.xlsx", date: "Jun 10, 2026", type: "Excel Data", size: "1.2 MB" },
    { title: "MMC_DEEP_NEPHROLOGY_COMPLIANCE_SOC2_REPORT.pdf", date: "Jun 11, 2026", type: "PDF Document", size: "4.8 MB" }
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-sans text-2xl font-bold text-[#131b2e] tracking-tight">Clinical Reports</h2>
        <p className="font-sans text-xs text-[#434655]">
          Manage and export generated PDF medical sheets or database spreadsheets signed by the hospital.
        </p>
      </div>

      <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 space-y-4">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#131b2e] pb-2 border-b border-[#e2e8f0]">
          Available Documents &amp; Exports
        </h3>

        <div className="space-y-3">
          {reports.map((doc, idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#faf8ff] border border-[#c3c6d7]/70 rounded-lg hover:bg-[#f2f3ff] transition-all text-xs gap-3"
            >
              <div className="flex items-start gap-3">
                <FileDown className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#131b2e]">{doc.title}</div>
                  <div className="text-[10.5px] text-[#737686] mt-0.5">
                    Generated on {doc.date} • {doc.type} • {doc.size}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert(`Downloading document simulation: ${doc.title}`)}
                  className="px-3 py-1.5 bg-white border border-[#c3c6d7] text-[#131b2e] hover:bg-neutral-50 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download
                </button>
                <button 
                  onClick={() => alert("Simulation output generated to medical network printer successfully.")}
                  className="p-1.5 bg-white border border-[#c3c6d7] text-[#434655] hover:text-[#2563eb] rounded-lg transition-all cursor-pointer"
                  title="Direct Network Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#eaedff]/40 border border-[#2563eb]/20 p-5 rounded-xl space-y-2">
        <h4 className="font-sans text-xs font-bold text-[#0053db] flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5" />
          SOC-2 Signed Electronic Attestations
        </h4>
        <p className="font-sans text-[11px] text-[#434655] leading-relaxed">
          All reports processed inside KidneyVision AI are backed by certified digital trust handshakes. The system embeds pixel check values in the report header blocks to assure third-party clinics that values are free of manual tampering.
        </p>
      </div>
    </div>
  );
}
