import React, { useState } from "react";
import { Download, FileText, Printer, Layers, Maximize2, Sparkles, Eye, EyeOff } from "lucide-react";
import { useToast } from "~/components/Toast";

interface ResumePreviewDocumentProps {
  rebuiltResult: RebuiltResume;
  editedSummary?: string;
  bulletEdits?: Record<string, string>;
  bulletStatuses?: Record<string, "accepted" | "rejected" | "editing">;
}

const ResumePreviewDocument: React.FC<ResumePreviewDocumentProps> = ({
  rebuiltResult,
  editedSummary,
  bulletEdits = {},
  bulletStatuses = {}
}) => {
  const { addToast } = useToast();
  const [pageLayoutMode, setPageLayoutMode] = useState<"1page" | "2page">("1page");
  const [showAtsKeywords, setShowAtsKeywords] = useState<boolean>(true);

  const finalSummary = editedSummary || rebuiltResult.professionalSummary;

  // Process final experience bullets considering user Accept / Reject / Edit decisions
  const finalExperience = rebuiltResult.experience?.map((exp, expIdx) => {
    const bullets = exp.optimizedBullets.map((optBullet, bIdx) => {
      const bulletKey = `${expIdx}_${bIdx}`;
      const status = bulletStatuses[bulletKey] || "accepted";
      if (status === "rejected") {
        return exp.originalBullets?.[bIdx] || optBullet;
      }
      return bulletEdits[bulletKey] !== undefined ? bulletEdits[bulletKey] : optBullet;
    });
    return { ...exp, bullets };
  }) || [];

  // Keywords list to highlight matching target Job Description
  const keywordsToHighlight = Array.from(new Set([
    ...(rebuiltResult.injectedKeywordsList || []),
    ...(rebuiltResult.technicalSkills || []),
    ...(rebuiltResult.domainKeywords || []),
    ...(rebuiltResult.softSkills || [])
  ])).filter(k => k && k.trim().length >= 2);

  const renderHighlightedText = (text: string) => {
    if (!showAtsKeywords || !keywordsToHighlight.length || !text) {
      return text;
    }

    try {
      const sortedKeywords = [...keywordsToHighlight].sort((a, b) => b.length - a.length);
      const patterns = sortedKeywords.map(k => {
        const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const startB = /^\w/.test(k) ? '\\b' : '(?:^|\\s|[^\\w])';
        const endB = /\w$/.test(k) ? '\\b' : '(?:$|\\s|[^\\w])';
        return `${startB}${escaped}${endB}`;
      });

      const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, i) => {
        const isMatch = keywordsToHighlight.some(k => k.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={i}
              className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-black border border-emerald-300 print:bg-transparent print:border-none print:text-inherit print:p-0 print:font-normal"
              title="Matching Target Job Description Keyword"
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    } catch (e) {
      return text;
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    const fileName = `${rebuiltResult.candidateName.replace(/\s+/g, '_')}_ATS_Resume.docx`;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${rebuiltResult.candidateName} — Resume</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.35; margin: 0.5in; }
          h1 { font-size: 20pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 4pt; color: #0f172a; }
          .contact { font-size: 9.5pt; text-align: center; color: #475569; margin-bottom: 12pt; }
          h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5pt solid #0f172a; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 6pt; color: #0f172a; }
          p { margin-top: 0; margin-bottom: 4pt; text-align: justify; }
          ul { margin-top: 2pt; margin-bottom: 6pt; padding-left: 18pt; }
          li { margin-bottom: 2pt; }
        </style>
      </head>
      <body>
        <h1>${rebuiltResult.candidateName}</h1>
        <div class="contact">${rebuiltResult.contactInfo}</div>
        ${rebuiltResult.targetJobTitle ? `<div style="text-align:center; font-weight:bold; font-size:10pt; color:#3730a3; margin-bottom:12pt;">Target Role: ${rebuiltResult.targetJobTitle} ${rebuiltResult.targetCompany ? `| ${rebuiltResult.targetCompany}` : ''}</div>` : ''}

        <h2>PROFESSIONAL SUMMARY</h2>
        <p>${finalSummary}</p>

        <h2>TECHNICAL & CORE SKILLS</h2>
        <p><strong>Technical Skills:</strong> ${rebuiltResult.technicalSkills?.join(' • ')}</p>
        ${rebuiltResult.softSkills?.length ? `<p><strong>Soft Skills & Leadership:</strong> ${rebuiltResult.softSkills.join(' • ')}</p>` : ''}
        ${rebuiltResult.domainKeywords?.length ? `<p><strong>Domain Competencies:</strong> ${rebuiltResult.domainKeywords.join(' • ')}</p>` : ''}

        <h2>PROFESSIONAL EXPERIENCE</h2>
        ${finalExperience.map(exp => `
          <div style="margin-bottom: 8pt;">
            <div style="font-weight: bold;">${exp.role} — <span style="font-weight: normal;">${exp.company}</span> <span style="float: right;">(${exp.dates})</span></div>
            <ul>
              ${exp.bullets.map((b: string) => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}

        ${rebuiltResult.projects?.length ? `
          <h2>PROJECTS & TECHNICAL ACHIEVEMENTS</h2>
          ${rebuiltResult.projects.map(p => `
            <div style="margin-bottom: 8pt;">
              <div style="font-weight: bold;">${p.projectName} <span style="font-weight: normal; font-size: 9.5pt;">[${p.techStack?.join(', ')}]</span></div>
              ${p.description ? `<p style="font-style: italic; font-size: 10pt;">${p.description}</p>` : ''}
              <ul>
                ${p.optimizedBullets?.map((b: string) => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        ` : ''}

        <h2>EDUCATION & CERTIFICATIONS</h2>
        <ul>
          ${rebuiltResult.education?.map(e => `<li>${e}</li>`).join('')}
          ${rebuiltResult.certifications?.map(c => `<li>${c}</li>`).join('')}
        </ul>

        ${rebuiltResult.achievements?.length ? `
          <h2>KEY ACHIEVEMENTS</h2>
          <ul>
            ${rebuiltResult.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        ` : ''}

        ${rebuiltResult.otherSections?.map(sec => `
          <h2>${sec.sectionTitle.toUpperCase()}</h2>
          <ul>
            ${sec.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        `).join('') || ''}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Toolbar / Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left Side Controls: Page Mode & ATS Keywords Toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Page Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Layout:
            </span>
            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setPageLayoutMode("1page")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  pageLayoutMode === "1page"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1 Page</span>
              </button>

              <button
                onClick={() => setPageLayoutMode("2page")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  pageLayoutMode === "2page"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>2 Pages</span>
              </button>
            </div>
          </div>

          {/* ATS Keywords Highlighting Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Show ATS Keywords:
            </span>
            <button
              onClick={() => setShowAtsKeywords(!showAtsKeywords)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                showAtsKeywords
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {showAtsKeywords ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showAtsKeywords ? "ON (Highlighted)" : "OFF (Normal)"}</span>
            </button>
          </div>

        </div>

        {/* EXPLICIT DOWNLOAD BUTTONS: DOWNLOAD PDF & DOWNLOAD DOCX */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Download clean professional PDF (no scores, no AI comments)"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Download Word Document .docx (no scores, no AI comments)"
          >
            <Download className="w-4 h-4" />
            <span>Download DOCX</span>
          </button>
        </div>
      </div>

      {/* Real-time Document Paper Canvas Container */}
      <div className="w-full flex justify-center bg-gray-200/70 dark:bg-slate-950 p-4 md:p-8 rounded-3xl border border-gray-300 dark:border-slate-800 shadow-inner overflow-x-auto">
        
        {/* Paper Sheet Document Canvas */}
        <div 
          id="printable-resume-canvas"
          className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 font-sans mx-auto ${
            pageLayoutMode === "1page"
              ? "w-full max-w-[800px] min-h-[1050px] p-7 md:p-10 text-[11px] leading-snug"
              : "w-full max-w-[850px] min-h-[1400px] p-10 md:p-14 text-xs leading-relaxed"
          }`}
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
          {/* HEADER: NAME & CONTACT INFO */}
          <header className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <h1 className={`!font-black !tracking-tight !text-slate-900 uppercase !bg-none !leading-tight ${
              pageLayoutMode === "1page" ? "!text-xl md:!text-2xl mb-1" : "!text-2xl md:!text-3xl mb-1.5"
            }`}>
              {rebuiltResult.candidateName}
            </h1>
            <p className="text-slate-700 font-semibold tracking-wide text-[11px] md:text-xs">
              {rebuiltResult.contactInfo}
            </p>
            {rebuiltResult.targetJobTitle && (
              <p className="text-indigo-800 font-black uppercase text-[10px] md:text-[11px] tracking-wider mt-1">
                Target Role: {rebuiltResult.targetJobTitle} {rebuiltResult.targetCompany ? `| ${rebuiltResult.targetCompany}` : ""}
              </p>
            )}
          </header>

          {/* SECTION 1: PROFESSIONAL SUMMARY */}
          {finalSummary && (
            <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
              <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-1.5">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-slate-800 font-medium leading-normal text-justify">
                {renderHighlightedText(finalSummary)}
              </p>
            </section>
          )}

          {/* SECTION 2: TECHNICAL & CORE SKILLS */}
          <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
            <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-1.5">
              TECHNICAL & CORE SKILLS
            </h2>
            <div className="flex flex-col gap-1 text-slate-800">
              {rebuiltResult.technicalSkills?.length > 0 && (
                <p>
                  <strong className="font-black text-slate-900">Technical Skills: </strong>
                  {rebuiltResult.technicalSkills.map((sk, idx) => (
                    <React.Fragment key={idx}>
                      {renderHighlightedText(sk)}
                      {idx < rebuiltResult.technicalSkills.length - 1 ? " • " : ""}
                    </React.Fragment>
                  ))}
                </p>
              )}
              {rebuiltResult.softSkills?.length > 0 && (
                <p>
                  <strong className="font-black text-slate-900">Soft Skills & Leadership: </strong>
                  {rebuiltResult.softSkills.map((sk, idx) => (
                    <React.Fragment key={idx}>
                      {renderHighlightedText(sk)}
                      {idx < rebuiltResult.softSkills.length - 1 ? " • " : ""}
                    </React.Fragment>
                  ))}
                </p>
              )}
              {rebuiltResult.domainKeywords?.length > 0 && (
                <p>
                  <strong className="font-black text-slate-900">Domain Competencies: </strong>
                  {rebuiltResult.domainKeywords.map((sk, idx) => (
                    <React.Fragment key={idx}>
                      {renderHighlightedText(sk)}
                      {idx < rebuiltResult.domainKeywords.length - 1 ? " • " : ""}
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>
          </section>

          {/* SECTION 3: WORK EXPERIENCE */}
          {finalExperience?.length > 0 && (
            <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
              <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className={pageLayoutMode === "1page" ? "space-y-2.5" : "space-y-4"}>
                {finalExperience.map((exp, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between font-black text-slate-900">
                      <span>{renderHighlightedText(exp.role)} — <span className="text-slate-800 font-bold">{renderHighlightedText(exp.company)}</span></span>
                      <span className="text-slate-600 font-bold text-[10px] md:text-[11px]">{exp.dates}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {renderHighlightedText(bullet)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: PROJECTS */}
          {rebuiltResult.projects?.length > 0 && (
            <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
              <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">
                PROJECTS & TECHNICAL ACHIEVEMENTS
              </h2>
              <div className={pageLayoutMode === "1page" ? "space-y-2" : "space-y-3.5"}>
                {rebuiltResult.projects.map((proj, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between font-black text-slate-900">
                      <span>{renderHighlightedText(proj.projectName)}</span>
                      {proj.techStack?.length > 0 && (
                        <span className="text-slate-600 font-bold text-[10px]">
                          [{proj.techStack.map((tech, tIdx) => (
                            <React.Fragment key={tIdx}>
                              {renderHighlightedText(tech)}
                              {tIdx < proj.techStack.length - 1 ? ", " : ""}
                            </React.Fragment>
                          ))}]
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-700 italic text-[10px] md:text-[11px] font-medium">
                        {renderHighlightedText(proj.description)}
                      </p>
                    )}
                    <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                      {proj.optimizedBullets?.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {renderHighlightedText(b)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 5: EDUCATION & CERTIFICATIONS */}
          <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
            <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-1.5">
              EDUCATION & CERTIFICATIONS
            </h2>
            <div className="flex flex-col gap-1 text-slate-800 font-medium">
              {rebuiltResult.education?.map((edu, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  <span>{renderHighlightedText(edu)}</span>
                </div>
              ))}
              {rebuiltResult.certifications?.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  <span>{renderHighlightedText(cert)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: KEY ACHIEVEMENTS (IF PRESENT) */}
          {rebuiltResult.achievements && rebuiltResult.achievements.length > 0 && (
            <section className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
              <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-1.5">
                KEY ACHIEVEMENTS & METRICS
              </h2>
              <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                {rebuiltResult.achievements.map((ach, idx) => (
                  <li key={idx} className="leading-snug">
                    {renderHighlightedText(ach)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SECTION 7: OTHER SECTIONS (IF PRESENT) */}
          {rebuiltResult.otherSections?.map((sec, idx) => (
            <section key={idx} className={pageLayoutMode === "1page" ? "mb-3.5" : "mb-5"}>
              <h2 className="!text-[12px] md:!text-[13px] !font-extrabold !uppercase tracking-wider !text-slate-900 border-b-2 border-slate-800 pb-1 mb-1.5">
                {sec.sectionTitle.toUpperCase()}
              </h2>
              <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                {sec.items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-snug">
                    {renderHighlightedText(item)}
                  </li>
                ))}
              </ul>
            </section>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ResumePreviewDocument;
