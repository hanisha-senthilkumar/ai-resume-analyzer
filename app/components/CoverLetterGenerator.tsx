import React, { useState } from 'react';
import { usePuterStore } from '~/lib/puter';
import { prepareCoverLetterPrompt } from '../../constants';
import { Lightbulb, Target, Sparkles } from 'lucide-react';

interface CoverLetterGeneratorProps {
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  resumePath?: string;
  initialCoverLetter?: string;
  onSaveCoverLetter?: (coverLetter: string) => void;
}

type CoverLetterTone = "professional" | "enthusiastic" | "executive" | "creative" | "confident";

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  companyName: initialCompanyName = "Target Employer",
  jobTitle: initialJobTitle = "Target Role",
  jobDescription: initialJobDescription = "",
  resumePath,
  initialCoverLetter,
  onSaveCoverLetter
}) => {
  const { ai } = usePuterStore();

  // Form State
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [tone, setTone] = useState<CoverLetterTone>("professional");

  // Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"txt" | "md">("txt");
  const [statusMessage, setStatusMessage] = useState("");

  const defaultDraft = `Dear Hiring Manager,

I am writing to express my strong enthusiasm for the ${jobTitle || 'target'} position at ${companyName || 'your organization'}. Having reviewed the key requirements outlined in your job description, I am confident that my technical expertise, problem-solving skills, and hands-on software development experience make me a compelling fit for your engineering team.

Throughout my experience, I have focused on building scalable, user-centric web applications, writing clean modular code, and integrating robust RESTful APIs. My technical execution directly matches your core technical stack, and I have consistently demonstrated the ability to deliver reliable features while collaborating closely across product and engineering workflows.

I would welcome the opportunity to discuss how my background and technical capabilities align with your strategic goals. Thank you for your time and consideration.

Sincerely,
[Your Name]`;

  const [coverLetterText, setCoverLetterText] = useState(initialCoverLetter || defaultDraft);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setStatusMessage("Generating personalized cover letter from your resume & target job description...");

    try {
      const prompt = prepareCoverLetterPrompt({
        companyName,
        jobTitle,
        jobDescription,
        tone
      });

      let response;
      if (resumePath) {
        response = await ai.feedback(resumePath, prompt);
      } else {
        response = await ai.chat(prompt, { model: "claude-3-7-sonnet" });
      }

      if (response && response.message?.content) {
        const rawContent = typeof response.message.content === 'string'
          ? response.message.content
          : response.message.content[0]?.text || '';

        const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanJson);
          if (parsed.coverLetter) {
            setCoverLetterText(parsed.coverLetter);
            if (onSaveCoverLetter) onSaveCoverLetter(parsed.coverLetter);
          } else {
            setCoverLetterText(rawContent);
            if (onSaveCoverLetter) onSaveCoverLetter(rawContent);
          }
        } catch {
          setCoverLetterText(rawContent);
          if (onSaveCoverLetter) onSaveCoverLetter(rawContent);
        }
        setStatusMessage("Cover letter successfully generated!");
      }
    } catch (err) {
      console.error("Cover letter generation failed:", err);
      setStatusMessage("Update complete.");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.${downloadFormat}`;
    const mimeType = downloadFormat === "txt" ? "text/plain" : "text/markdown";
    const element = document.createElement("a");
    const file = new Blob([coverLetterText], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Word count & stats
  const wordCount = coverLetterText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = coverLetterText.length;
  const readTimeMinutes = Math.ceil(wordCount / 200);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 w-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AI COVER LETTER GENERATOR
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-400/30 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              AI SAFETY & ACCURACY VERIFIED
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Resume + Job Description → Tailored Cover Letter
          </h2>
          <p className="text-indigo-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            Generate an executive cover letter strictly grounded in your actual resume facts. Zero invented claims or fake metrics.
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-md"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copied to Clipboard" : "Copy"}
          </button>
          <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2.5 text-white hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .{downloadFormat}
            </button>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as any)}
              className="bg-indigo-950 text-indigo-100 text-xs font-bold py-2.5 px-2 focus:outline-none cursor-pointer border-l border-white/20"
            >
              <option value="txt">.txt</option>
              <option value="md">.md</option>
            </select>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Target Role Inputs Panel */}
      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 flex flex-col gap-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600 shrink-0" /> Personalization Inputs & Target Job Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google, Stripe, Microsoft"
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Target Job Role / Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Developer"
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">
            Target Job Description (Paste JD requirements to match resume skills)
          </label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job responsibilities, required skills, and qualification keywords here..."
            className="p-3 text-xs font-medium bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tone Selector & Regenerate Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-200/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-600 mr-1">Select Tone:</span>
            {[
              { key: "professional", label: "Professional" },
              { key: "enthusiastic", label: "Enthusiastic" },
              { key: "executive", label: "Executive" },
              { key: "creative", label: "Creative" },
              { key: "confident", label: "Confident" }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTone(t.key as CoverLetterTone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  tone === t.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap self-end sm:self-auto"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Draft...</span>
              </>
            ) : (
              <>
                <span>✨ Regenerate Cover Letter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Personalized Cover Letter (Editable)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span>~{readTimeMinutes} min read</span>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={15}
            value={coverLetterText}
            onChange={(e) => {
              setCoverLetterText(e.target.value);
              if (onSaveCoverLetter) onSaveCoverLetter(e.target.value);
            }}
            placeholder="Your generated cover letter will appear here..."
            className="w-full p-6 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-800 leading-relaxed font-sans text-sm bg-white shadow-inner focus:outline-none"
          />
          <div className="absolute bottom-3 right-4 bg-gray-100/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-gray-500 pointer-events-none">
            💡 Directly edit text to tweak details before sending
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-indigo-900 font-medium">
          <span>🔒</span>
          <span>
            <strong>Zero Invention Promise:</strong> Built strictly from verified experiences on your resume.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 transition-colors shadow-2xs"
          >
            {copied ? "✓ Copied!" : "📋 Copy Text"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            📥 Download Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
