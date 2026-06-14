import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { guestPredict } from "../services/api";

export default function GuestAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ prediction: string, confidence: number, imageUrl: string, usageCount?: number, usageLimit?: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an ultrasound image to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const prediction = await guestPredict(file);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfcff] text-[#131b2e] min-h-screen flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#434655] hover:text-[#2563eb] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Guest AI Analysis</h1>
          <p className="text-sm text-[#434655] mb-8">
            Upload a renal ultrasound scan for a rapid AI prediction. (Records are not saved).
          </p>

          {!result ? (
            <form onSubmit={handleUpload} className="space-y-6">
              <div 
                className={`w-full ${file ? 'h-auto' : 'h-48'} bg-[#f2f3ff] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-colors ${file ? 'border-[#2563eb] bg-[#eaedff]' : 'border-[#c3c6d7] hover:border-[#2563eb]/60'} overflow-hidden relative`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                  }}
                  className="hidden" 
                  id="guest-upload"
                />
                
                {previewUrl ? (
                  <div className="w-full relative">
                    <img
                      src={previewUrl}
                      alt="Uploaded Scan"
                      className="w-full h-auto object-contain rounded-lg"
                    />
                    <label htmlFor="guest-upload" className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors rounded-lg">
                       <span className="sr-only">Change Image</span>
                    </label>
                  </div>
                ) : (
                  <label htmlFor="guest-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                    <UploadCloud className="w-10 h-10 mb-3 text-[#737686]" />
                    <span className="text-sm font-semibold text-[#131b2e] mb-1">Click to browse or drag image here</span>
                    <span className="text-xs text-[#737686]">Supports standard ultrasound imaging formats (PNG, JPG)</span>
                  </label>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!file || loading}
                className="w-full bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {loading ? "Analyzing..." : "Analyze Image"}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-[fadeIn_300ms_ease-out]">
              <div className="aspect-video bg-[#eaedff] rounded-lg overflow-hidden flex items-center justify-center border border-[#c3c6d7]">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Uploaded Scan"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                )}
              </div>

              <div className="bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider mb-1">Diagnostic Output</h3>
                    <div className="text-xl font-bold text-[#131b2e] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2563eb]" />
                      {result.prediction}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider mb-1">Confidence Score</h3>
                    <div className="text-xl font-bold text-[#131b2e]">{result.confidence}%</div>
                  </div>
                </div>
              </div>

              {result.usageCount !== undefined && result.usageLimit !== undefined && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">
                      Guest Usage: {result.usageCount} of {result.usageLimit} free analyses used.
                    </p>
                    {result.usageCount >= result.usageLimit && (
                      <p className="text-sm text-amber-700 mt-1">
                        You have reached your limit! Please register to continue using the platform.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setResult(null); }}
                  className="flex-1 px-4 py-2 border border-[#c3c6d7] rounded-lg text-sm font-semibold text-[#434655] hover:bg-[#f2f3ff] transition-colors"
                >
                  Analyze Another
                </button>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Create Professional Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
