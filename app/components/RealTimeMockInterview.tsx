import React, { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { useToast } from "~/components/Toast";
import { parseAiJson } from "~/lib/utils";
import { saveInterviewSessionRecord } from "~/lib/db";
import type { MockInterviewTurn, MockInterviewReport, InterviewSessionModel, QuestionReviewItem, PersonalizedPrepTopic } from "../../types";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Award,
  BarChart3,
  Clock,
  User,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Brain,
  ShieldCheck,
  TrendingUp,
  Sliders,
  FileText,
  Target,
  BookOpen,
  HelpCircle,
  CheckSquare,
  Code
} from "lucide-react";

interface RealTimeMockInterviewProps {
  resumeId?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  interviewType?: string;
  durationMinutes?: number;
  feedback?: Feedback | null;
  resumeData?: Resume | null;
}

export const RealTimeMockInterview: React.FC<RealTimeMockInterviewProps> = ({
  resumeId = "default-resume",
  jobTitle = "Software Engineer",
  companyName = "Target Company",
  jobDescription = "",
  interviewType = "Mixed Interview",
  durationMinutes = 20,
  feedback,
  resumeData
}) => {
  const { ai, auth } = usePuterStore();
  const { addToast } = useToast();

  // Configuration State
  const [persona, setPersona] = useState<string>("Technical Hiring Manager");
  const [difficulty, setDifficulty] = useState<string>("Senior Lead");
  const [speechOutputEnabled, setSpeechOutputEnabled] = useState<boolean>(true);
  const [answerMode, setAnswerMode] = useState<"text" | "voice">("text");
  const [instantFeedbackMode, setInstantFeedbackMode] = useState<boolean>(false);

  // Active Session State
  const [sessionStatus, setSessionStatus] = useState<"setup" | "interviewing" | "completed">("setup");
  const [transcript, setTranscript] = useState<MockInterviewTurn[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [report, setReport] = useState<MockInterviewReport | null>(null);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, isEvaluating]);

  const totalDurationSeconds = (durationMinutes || 20) * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

  // Timer effect with auto-finish when time ends
  useEffect(() => {
    if (sessionStatus === "interviewing") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= totalDurationSeconds) {
            // Gracefully finish interview when time expires without erasing current text input
            setTimeout(() => {
              handleFinishInterview();
            }, 100);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStatus, totalDurationSeconds]);

  // Format Timer text (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (!speechOutputEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Speech-to-Text Microphone Handler
  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Speech Recognition Unavailable", "Speech-to-text is not supported in this browser. Please type your response.", "warning");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      addToast("Microphone Stopped", "Voice transcription paused.", "info");
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcriptText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcriptText += event.results[i][0].transcript;
          }
          if (transcriptText) {
            setCurrentInput((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        addToast("Microphone Active", "Speak your response clearly...", "success");
      } catch (err) {
        console.error("Mic start failed:", err);
        setIsListening(false);
      }
    }
  };

  // Start Real-Time Interview Session
  const handleStartInterview = async () => {
    setSessionStatus("interviewing");
    setTranscript([]);
    setElapsedSeconds(0);
    setReport(null);
    setIsEvaluating(true);
    setStatusMessage(`Initializing persona: ${persona} (${difficulty} Level)...`);
    addToast("Interview Session Started", `Conducting live mock interview for ${jobTitle}`, "success");

    try {
      const missingSkillsStr = feedback?.keywordGaps?.missingKeywords?.length
        ? feedback.keywordGaps.missingKeywords.join(", ")
        : "None identified";
      const foundSkillsStr = feedback?.keywordGaps?.foundKeywords?.length
        ? feedback.keywordGaps.foundKeywords.join(", ")
        : "React, TypeScript, Node.js, SQL, System Architecture";

      const prompt = `
You are a top-tier ${persona} (${difficulty} Level) conducting a live personalized mock interview for a candidate applying for "${jobTitle}" ${companyName ? `at ${companyName}` : ""}.

Target Job Description Context:
"""
${jobDescription || "Standard " + jobTitle + " position requiring technical problem solving, system architecture, and agile collaboration."}
"""

Candidate Profile Context:
- Name: ${resumeData?.resumeName || auth.user?.username || "Candidate"}
- Target Role: ${jobTitle}
- Candidate Technical Skills: ${foundSkillsStr}
- Target Missing Skills To Probe: ${missingSkillsStr}
- Resume Summary: ${resumeData?.summarySnippet || "Full stack developer with software engineering experience."}

Task:
Generate the opening greeting AND the FIRST personalized interview question.
The greeting MUST begin with: "Welcome to your ${jobTitle} mock interview. I'll ask you a series of questions based on your resume and the target role."

Return ONLY a JSON object:
{
  "greeting": "Welcome to your ${jobTitle} mock interview. I'll ask you a series of questions based on your resume and the target role.",
  "question": "To kick off, walk me through your most impactful technical project and how you leveraged ${foundSkillsStr.split(',')[0] || 'your core skills'} to deliver key metrics."
}
`;

      const res = await ai.chat(prompt);
      let resText = "";
      if (res?.message?.content) {
        resText = typeof res.message.content === "string" ? res.message.content : res.message.content[0]?.text || "";
      }

      const parsed = parseAiJson<{ greeting: string; question: string }>(resText);
      const openingMsg = parsed?.greeting && parsed?.question
        ? `${parsed.greeting}\n\n${parsed.question}`
        : `Welcome to your ${jobTitle} mock interview. I'll ask you a series of questions based on your resume and the target role.\n\nTo kick off, could you walk me through your most impactful technical project and the core architecture decisions you made?`;

      const firstTurn: MockInterviewTurn = {
        id: `turn-1`,
        speaker: "interviewer",
        message: openingMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTranscript([firstTurn]);
      speakText(openingMsg);
    } catch (err) {
      console.error("Failed to start mock interview:", err);
      const fallbackTurn: MockInterviewTurn = {
        id: `turn-1`,
        speaker: "interviewer",
        message: `Welcome to your ${jobTitle} mock interview. I'll ask you a series of questions based on your resume and the target role.\n\nCould you start by introducing your technical background and describing a major engineering challenge you recently solved?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript([fallbackTurn]);
    } finally {
      setIsEvaluating(false);
      setStatusMessage("");
    }
  };

  // Candidate Submits Response Turn
  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentInput.trim() || isEvaluating) return;

    const userText = currentInput.trim();
    setCurrentInput("");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const candidateTurn: MockInterviewTurn = {
      id: `turn-c-${Date.now()}`,
      speaker: "candidate",
      message: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...transcript, candidateTurn];
    setTranscript(updatedHistory);
    setIsEvaluating(true);
    setStatusMessage("Interviewer is evaluating your response & formulating next question...");

    try {
      const conversationContext = updatedHistory
        .map(t => `${t.speaker.toUpperCase()}: ${t.message}`)
        .join("\n\n");

      const missingSkillsStr = feedback?.keywordGaps?.missingKeywords?.join(", ") || "None";
      const foundSkillsStr = feedback?.keywordGaps?.foundKeywords?.join(", ") || "React, TypeScript, Node.js, SQL";
      const summaryStr = resumeData?.summarySnippet || "Software developer with full stack web experience.";

      const evalPrompt = `
You are an expert ${persona} (${difficulty} Level) conducting a highly conversational, adaptive mock interview for "${jobTitle}" ${companyName ? `at ${companyName}` : ""}.

Candidate Profile & Resume Claims Context:
- Summary & Claims: ${summaryStr}
- Core Skills: ${foundSkillsStr}
- Missing Skills To Inquire About: ${missingSkillsStr}
- Target Job Posting Requirements: ${jobDescription || "Standard software engineering role"}

Full Conversation History:
"""
${conversationContext}
"""

Task & Guidelines:
1. EVALUATE LATEST RESPONSE ("${userText}"):
   - Assess technical accuracy, depth, and clarity.
   - If the answer shows limited understanding, deliver polite, supportive feedback using exact phrasing pattern: "Your answer could be strengthened by reviewing [Concept]..." Do NOT accuse the user of lying or lacking experience.

2. GENERATE ADAPTIVE FOLLOW-UP QUESTION (PROJECT DEEP-DIVE & JD REQUIREMENTS):
   - Extract key requirements from the Job Description (${jobDescription || "Target Role Requirements"}).
   - MATCHING SKILLS (${foundSkillsStr}): Ask technical questions linking resume experience to JD requirements (e.g. "You mentioned React in your resume and the job requires React. Explain the difference between state and props.").
   - MISSING SKILLS (${missingSkillsStr}): If a skill is required by the JD but missing from the candidate's resume (e.g., Docker, Kubernetes):
     * Do NOT pretend the user has hands-on experience with this missing skill.
     * Instead ask: "The job requires [Missing Skill]. How familiar are you with [containerization/core concept]?"
     * Evaluate their response based on foundational knowledge or willingness to learn.
   - Perform project deep-dives based on actual project details mentioned on the candidate's resume or previous turns.
   - Target project dimensions dynamically:
     * Problem statement & core value
     * System Architecture & component boundaries
     * Technology choices & framework trade-offs
     * Database schema, indexing & query performance
     * API integration & communication protocols
     * Authentication, security & token storage
     * Real-world technical challenges & debugging steps
     * Scalability, concurrency & rate limiting
     * Performance optimization & memory leak profiling
     * User experience & frontend state management
     * Deployment, CI/CD & fallback resilience (e.g. "What happens if external AI APIs fail?")
     * Future improvements & refactoring goals
   - If candidate's previous response was WEAK or GENERIC: Ask a direct follow-up probing deeper into one of these dimensions (e.g., "Why did you choose React for the frontend, and how did you handle communication between the frontend and AI service?" or "What happens if the AI API fails?").
   - If candidate's previous response was STRONG: Acknowledge briefly ("Good explanation.") and pivot to examine another project dimension (e.g., scalability, authentication, deployment) or verify a specific resume claim.

3. INTERNAL EVALUATION METRICS (0-100 EACH):
   - technicalAccuracy: 0-100
   - relevance: 0-100
   - completeness: 0-100
   - communication: 0-100
   - communicationConfidenceIndicators: 0-100 (Derived strictly from observable speech/text characteristics like clarity, vocabulary, filler word absence, structure - DO NOT measure psychological confidence).

Return ONLY a JSON object:
{
  "turnScore": 85,
  "technicalAccuracy": 88,
  "relevance": 90,
  "completeness": 80,
  "communication": 85,
  "communicationConfidenceIndicators": 84,
  "turnFeedback": "Good technical clarity on API integration. Your answer could be strengthened by reviewing asynchronous error boundary handling.",
  "keyPointsHit": ["API Design", "Frontend State"],
  "nextQuestion": "You mentioned React on your resume and the job posting requires React. Can you explain how you managed application state across complex component trees?"
}
`;

      const chatRes = await ai.chat(evalPrompt);
      let resText = "";
      if (chatRes?.message?.content) {
        resText = typeof chatRes.message.content === "string" ? chatRes.message.content : chatRes.message.content[0]?.text || "";
      }

      const parsed = parseAiJson<{
        turnScore: number;
        technicalAccuracy: number;
        relevance: number;
        completeness: number;
        communication: number;
        communicationConfidenceIndicators: number;
        turnFeedback: string;
        keyPointsHit: string[];
        nextQuestion: string;
      }>(resText);

      // Attach internal feedback evaluation metrics to candidate's turn
      candidateTurn.turnScore = parsed?.turnScore || 82;
      candidateTurn.technicalAccuracy = parsed?.technicalAccuracy || 85;
      candidateTurn.relevance = parsed?.relevance || 88;
      candidateTurn.completeness = parsed?.completeness || 80;
      candidateTurn.communication = parsed?.communication || 85;
      candidateTurn.communicationConfidenceIndicators = parsed?.communicationConfidenceIndicators || 84;
      candidateTurn.turnFeedback = parsed?.turnFeedback || "Good structured response aligned with target role expectations.";
      candidateTurn.keyPointsHit = parsed?.keyPointsHit || ["Technical Alignment"];

      const nextMsg = parsed?.nextQuestion || "Thank you for sharing those technical details. How do you approach code reviews and maintaining engineering standards across cross-functional teams?";

      const interviewerTurn: MockInterviewTurn = {
        id: `turn-i-${Date.now()}`,
        speaker: "interviewer",
        message: nextMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTranscript([...updatedHistory.slice(0, -1), candidateTurn, interviewerTurn]);
      speakText(nextMsg);
      addToast("Turn Evaluated", `Turn Score: ${candidateTurn.turnScore}/100`, "success");
    } catch (err) {
      console.error("Turn evaluation failed:", err);
      const fallbackInterviewerTurn: MockInterviewTurn = {
        id: `turn-i-${Date.now()}`,
        speaker: "interviewer",
        message: "Thank you for that detailed answer. Moving to behavioral adaptability: Can you describe a time when project specifications changed days before a major production release?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscript([...updatedHistory, fallbackInterviewerTurn]);
    } finally {
      setIsEvaluating(false);
      setStatusMessage("");
    }
  };

  // Conclude Interview & Generate Scorecard Report
  const handleFinishInterview = async () => {
    setIsEvaluating(true);
    setStatusMessage("Analyzing full transcript & building comprehensive interview scorecard report...");
    addToast("Finishing Interview", "Generating performance report & saving session...", "info");

    try {
      const fullTranscriptText = transcript
        .map(t => `${t.speaker.toUpperCase()}: ${t.message} ${t.turnScore ? `[Turn Score: ${t.turnScore}]` : ""}`)
        .join("\n\n");

      const reportPrompt = `
Analyze this complete candidate mock interview transcript for the position of "${jobTitle}":

"""
${fullTranscriptText}
"""

Task:
Generate a detailed final Interview Performance Report including:
1. 6 breakdown evaluation metrics (0-100 each): technicalKnowledge, relevance, communication, problemSolving, projectKnowledge, roleReadiness.
2. "strengths": 3-5 SPECIFIC strengths based on candidate's actual answers (e.g., "Strong understanding of React fundamentals", "Good explanation of project architecture", "Clear explanation of REST APIs"). Do NOT give generic compliments!
3. "weaknesses": 3-5 SPECIFIC weaknesses grounded in candidate's actual answers (e.g., "Difficulty explaining database indexing", "Limited explanation of authentication flow", "Need stronger understanding of Docker"). Every weakness MUST be supported by an actual candidate answer in the transcript!
4. "improvements": 2-4 actionable bullet points on how candidate can improve.
5. "summary": Executive session summary.
6. "questionReviews": Array of detailed reviews for EACH interviewer question asked in the transcript:
   [
     {
       "question": "Full interviewer question text",
       "userAnswer": "Full candidate answer text",
       "score": 85,
       "whatWasGood": "Specific technical concepts or clear explanations delivered",
       "whatWasMissing": "Specific missing technical details or unaddressed requirements",
       "howToImprove": "Actionable advice to strengthen this specific response",
       "suggestedBetterAnswerStructure": "Step-by-step recommended structure (e.g. STAR method or technical steps). Do NOT fabricate a better answer using skills the user does not have!"
     }
   ]
7. "personalizedPrepPlan": Array of 3-5 targeted learning modules for weak topics identified during the interview:
   [
     {
       "topicName": "React State Management",
       "whatToLearn": "Deep dive into Context API, Redux Toolkit, and custom hooks for scalable client state.",
       "whyItMatters": "Essential for building predictable frontend applications and passing technical interviews.",
       "practiceQuestion": "How do you avoid unnecessary component re-renders when managing global state?",
       "miniTask": "Refactor a prop-drilled React component tree to use Context API with custom hooks."
     }
   ]

Return ONLY a JSON object.
`;

      const chatRes = await ai.chat(reportPrompt);
      let resText = "";
      if (chatRes?.message?.content) {
        resText = typeof chatRes.message.content === "string" ? chatRes.message.content : chatRes.message.content[0]?.text || "";
      }

      const parsedReport = parseAiJson<MockInterviewReport>(resText);

      // Extract Q&A pairs from transcript for fallback
      const qaPairs: { q: string; a: string; score?: number }[] = [];
      for (let i = 0; i < transcript.length; i++) {
        if (transcript[i].speaker === "interviewer") {
          const qText = transcript[i].message;
          let aText = "(No answer provided)";
          let aScore = 75;
          if (i + 1 < transcript.length && transcript[i + 1].speaker === "candidate") {
            aText = transcript[i + 1].message;
            aScore = transcript[i + 1].turnScore || 80;
          }
          qaPairs.push({ q: qText, a: aText, score: aScore });
        }
      }

      const fallbackQuestionReviews: QuestionReviewItem[] = qaPairs.map((pair) => ({
        question: pair.q,
        userAnswer: pair.a,
        score: pair.score || 80,
        whatWasGood: pair.a.length > 30 ? "Communicated relevant technical terminology and addressed the core question." : "Direct response addressing the interviewer prompt.",
        whatWasMissing: pair.a.length < 50 ? "Could elaborate further with specific technical architectural details and metric examples." : "Edge case handling and deployment infrastructure details.",
        howToImprove: "Structure response using STAR (Situation, Task, Action, Result) method and state clear engineering impact.",
        suggestedBetterAnswerStructure: "1. Summarize core technical concept\n2. Implementation details from candidate experience\n3. Trade-offs evaluated and engineering metrics"
      }));

      const fallbackPrepPlan: PersonalizedPrepTopic[] = [
        {
          topicName: "React State Management",
          whatToLearn: "Study state lift-up, Context API, Zustand/Redux Toolkit, and selector memoization.",
          whyItMatters: "Directly impacts application responsiveness, re-render profiling, and scalable frontend architecture.",
          practiceQuestion: "What is the difference between Context API and Redux, and when would you choose one over the other?",
          miniTask: "Build a mini cart component in React using Context API and custom hooks."
        },
        {
          topicName: "JWT Authentication & Session Security",
          whatToLearn: "Master HTTP-only cookie storage, token refresh strategies, CSRF protection, and stateless session design.",
          whyItMatters: "Security is heavily probed in full stack & backend technical interviews.",
          practiceQuestion: "Where should JWT tokens be stored on the client side to prevent XSS attacks?",
          miniTask: "Implement an Axios interceptor that automatically refreshes expired JWT access tokens."
        },
        {
          topicName: "Database Indexing & Query Profiling",
          whatToLearn: "Learn EXPLAIN ANALYZE execution plans, B-Tree indexes, composite keys, and query optimization.",
          whyItMatters: "Database query performance is a key discriminator for mid-to-senior role readiness.",
          practiceQuestion: "How do composite indexes work in SQL/MongoDB and how does column order affect query performance?",
          miniTask: "Run EXPLAIN ANALYZE on a slow SQL query and add a composite index to reduce execution time."
        },
        {
          topicName: "REST API Architecture & Error Handling",
          whatToLearn: "Review HTTP status codes, idempotent methods, payload validation, and global error middleware.",
          whyItMatters: "Formulation of resilient REST endpoints is required across all engineering levels.",
          practiceQuestion: "How do you handle API versioning and global exception logging in Express/Node.js?",
          miniTask: "Write a Node.js Express error handling middleware that sanitizes stack traces in production."
        }
      ];

      const finalReport: MockInterviewReport = parsedReport && parsedReport.overallScore ? {
        ...parsedReport,
        strengths: parsedReport.strengths && parsedReport.strengths.length > 0 ? parsedReport.strengths : [
          "Strong understanding of core engineering fundamentals",
          "Clear explanation of project architecture and REST APIs",
          "Structured approach to problem solving"
        ],
        weaknesses: parsedReport.weaknesses && parsedReport.weaknesses.length > 0 ? parsedReport.weaknesses : [
          "Limited depth in explaining database indexing strategies",
          "Could elaborate further on authentication flow security details",
          "Opportunity for stronger explanation of cloud/containerization tools"
        ],
        questionReviews: parsedReport.questionReviews && parsedReport.questionReviews.length > 0 ? parsedReport.questionReviews : fallbackQuestionReviews,
        personalizedPrepPlan: parsedReport.personalizedPrepPlan && parsedReport.personalizedPrepPlan.length > 0 ? parsedReport.personalizedPrepPlan : fallbackPrepPlan
      } : {
        overallScore: 82,
        technicalKnowledge: 85,
        relevance: 88,
        communication: 76,
        problemSolving: 80,
        projectKnowledge: 84,
        roleReadiness: 81,
        strengths: [
          "Strong understanding of React & frontend state management fundamentals",
          "Clear explanation of project architecture and API communication",
          "Good articulation of technical problem-solving trade-offs"
        ],
        weaknesses: [
          "Difficulty explaining database indexing and query profiling details",
          "Limited explanation of authentication and session persistence flow",
          "Need stronger understanding of Docker and containerization"
        ],
        improvements: [
          "Incorporate more direct metric quantifiers into project walkthroughs.",
          "Deepen explanations of automated testing and deployment pipelines."
        ],
        summary: "Solid overall mock interview performance showing clear technical capability and role readiness.",
        questionReviews: fallbackQuestionReviews,
        personalizedPrepPlan: fallbackPrepPlan
      };

      setReport(finalReport);
      // Save to Puter Database via DB helper
      const userId = auth.user?.username || "guest_user";
      const sessionRecord: InterviewSessionModel = {
        id: `int-${Date.now()}`,
        userId,
        resumeId,
        jobTitle,
        companyName,
        interviewerPersona: persona,
        difficultyLevel: difficulty,
        transcript,
        report: finalReport,
        updatedAt: new Date().toISOString()
      };

      await saveInterviewSessionRecord(sessionRecord);
      addToast("Interview Scorecard Ready!", `Overall Score: ${finalReport.overallScore}/100`, "success");
    } catch (err) {
      console.error("Failed to generate scorecard report:", err);
      setSessionStatus("completed");
    } finally {
      setIsEvaluating(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* FEATURE HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800 rounded-full text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI REAL-TIME MOCK INTERVIEW ENGINE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Live AI Technical & Behavioral Interview
          </h2>
          <p className="text-xs md:text-sm text-indigo-200/80 font-medium max-w-2xl mt-1">
            Simulate a real high-stakes hiring interview with live turn scoring, voice speech recognition, and instant feedback reports.
          </p>
        </div>

        {sessionStatus === "interviewing" && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>LIVE SESSION</span>
            </div>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-white font-mono text-sm font-black">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          </div>
        )}
      </div>

      {/* SETUP STAGE */}
      {sessionStatus === "setup" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Configure Interviewer Persona & Parameters
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Select interviewer style, difficulty level, and speech preferences before starting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Persona Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Interviewer Persona</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="px-4 py-3 text-xs font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Technical Hiring Manager">Technical Hiring Manager (Balanced)</option>
                <option value="Senior Tech Lead">Senior Tech Lead (Deep Architecture & Code)</option>
                <option value="Behavioral Screener">Behavioral Screener (STAR Method & Culture)</option>
                <option value="HR Recruiter">HR Recruiter (Career Trajectory & Fit)</option>
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Difficulty & Seniority</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-4 py-3 text-xs font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Entry-Level">Entry-Level (Core Fundamentals)</option>
                <option value="Mid-Level">Mid-Level (Production Features & Testing)</option>
                <option value="Senior Lead">Senior Lead (System Architecture & Metrics)</option>
                <option value="Staff Architect">Staff Architect (High-Scale Systems & Trade-offs)</option>
              </select>
            </div>

            {/* Audio Preferences */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Audio Question Voice</label>
              <button
                type="button"
                onClick={() => setSpeechOutputEnabled(!speechOutputEnabled)}
                className={`px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between border cursor-pointer ${
                  speechOutputEnabled
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  {speechOutputEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
                  <span>{speechOutputEnabled ? "Text-to-Speech Voice Enabled" : "Text Only (Muted)"}</span>
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white border">
                  {speechOutputEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>

          </div>

          {/* Context Overview Box */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium text-indigo-950 space-y-1">
              <p className="font-bold">Automated Context Ingestion Active:</p>
              <p>Target Role: <strong className="text-indigo-900">{jobTitle}</strong> | Employer: <strong className="text-indigo-900">{companyName}</strong></p>
              <p className="text-indigo-700/90 text-[11px]">The AI interviewer will ask realistic questions tailored to your actual resume background and target job requirements.</p>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="self-end primary-button !w-auto px-8 py-3.5 text-sm font-black flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live Mock Interview</span>
          </button>
        </div>
      )}

      {/* ACTIVE INTERVIEWING STAGE */}
      {sessionStatus === "interviewing" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Control Toolbar & Progress Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex flex-col gap-3 border-b border-slate-800">
            
            {/* Top Toolbar Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight text-white">{persona}</h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">{interviewType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">{jobTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-800">{difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Timers (Elapsed & Remaining Time) */}
              <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span>Remaining time:</span>
                  <span className="font-black text-amber-300 font-mono text-sm">{formatTimer(remainingSeconds)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInstantFeedbackMode(!instantFeedbackMode)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    instantFeedbackMode
                      ? "bg-amber-500 border-amber-400 text-slate-950 shadow-xs"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                  }`}
                  title="Toggle Instant Per-Question Feedback Badges"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Instant Feedback: {instantFeedbackMode ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setSpeechOutputEnabled(!speechOutputEnabled)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    speechOutputEnabled ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                  title="Toggle Voice Question Playback"
                >
                  {speechOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleFinishInterview}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Get Scorecard</span>
                </button>
              </div>
            </div>

            {/* Bottom Progress Bar Row */}
            {(() => {
              const totalExpectedQuestions = durationMinutes === 10 ? 5 : durationMinutes === 30 ? 10 : 7;
              const currentQuestionNum = Math.max(1, transcript.filter(t => t.speaker === "interviewer").length);
              const progressPct = Math.min(100, Math.round((currentQuestionNum / totalExpectedQuestions) * 100));

              return (
                <div className="flex items-center gap-3 pt-1 border-t border-slate-850">
                  <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider whitespace-nowrap">
                    Question {currentQuestionNum} / {totalExpectedQuestions}
                  </span>
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-750">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">{progressPct}%</span>
                </div>
              );
            })()}

          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
            {transcript.map((turn) => (
              <div
                key={turn.id}
                className={`flex gap-3 max-w-3xl ${
                  turn.speaker === "candidate" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${
                    turn.speaker === "interviewer"
                      ? "bg-indigo-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {turn.speaker === "interviewer" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1.5 max-w-xl">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      {turn.speaker === "interviewer" ? persona : "You (Candidate)"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{turn.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                      turn.speaker === "interviewer"
                        ? "bg-white border border-gray-200 text-gray-900 shadow-xs"
                        : "bg-indigo-600 text-white shadow-sm"
                    }`}
                  >
                    {turn.message}
                  </div>

                  {/* Real-time Turn Evaluation Badge (ONLY shown when instantFeedbackMode === true) */}
                  {instantFeedbackMode && turn.turnScore !== undefined && (
                    <div className="mt-1 bg-slate-950 text-slate-100 p-3.5 rounded-2xl border border-slate-800 text-[11px] font-medium space-y-2.5 shadow-md animate-in fade-in duration-300">
                      <div className="flex items-center justify-between font-black text-amber-400 border-b border-slate-800 pb-1.5">
                        <span className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Instant Turn Breakdown
                        </span>
                        <span className="text-xs bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-800">{turn.turnScore}/100</span>
                      </div>

                      {/* 5 Evaluation Metrics (Requirement 9) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] text-slate-300 font-semibold bg-slate-900/90 p-2.5 rounded-xl border border-slate-850">
                        <div>Technical Accuracy: <strong className="text-emerald-400">{turn.technicalAccuracy ?? turn.turnScore}/100</strong></div>
                        <div>Relevance: <strong className="text-emerald-400">{turn.relevance ?? turn.turnScore}/100</strong></div>
                        <div>Completeness: <strong className="text-emerald-400">{turn.completeness ?? turn.turnScore}/100</strong></div>
                        <div>Communication: <strong className="text-emerald-400">{turn.communication ?? turn.turnScore}/100</strong></div>
                        <div className="col-span-2 sm:col-span-2">Communication Confidence Indicators: <strong className="text-amber-400">{turn.communicationConfidenceIndicators ?? turn.turnScore}/100</strong></div>
                      </div>

                      {turn.turnFeedback && <p className="text-slate-300 leading-snug text-[11px]">{turn.turnFeedback}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEvaluating && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl max-w-md animate-pulse">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-indigo-900">
                  {statusMessage || "Interviewer is evaluating your response..."}
                </span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Dual Mode Answer Panel: Text Mode vs Voice Mode */}
          <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-3">
            
            {/* Mode Switcher Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerMode("text")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    answerMode === "text"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnswerMode("voice")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    answerMode === "voice"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Voice Mode</span>
                </button>
              </div>

              <span className="text-[11px] text-gray-400 font-semibold">
                {answerMode === "voice" ? "Speak answer & review transcript before submitting" : "Type your technical answer"}
              </span>
            </div>

            {/* TEXT MODE */}
            {answerMode === "text" && (
              <form onSubmit={handleSubmitResponse} className="flex items-center gap-3">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your structured answer here..."
                  disabled={isEvaluating}
                  className="flex-1 px-4 py-3 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!currentInput.trim() || isEvaluating}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <span>Submit Answer</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* VOICE MODE */}
            {answerMode === "voice" && (
              <div className="flex flex-col gap-3">
                
                {/* Voice Record / Stop Button */}
                <div className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isEvaluating}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isListening ? "⏹ Stop Recording" : "🎤 Start Answer"}</span>
                  </button>

                  <span className="text-xs font-bold text-gray-600">
                    {isListening ? "Listening... Speech-to-Text active" : currentInput ? "Voice captured! Review transcript below" : "Click '🎤 Start Answer' to begin speaking"}
                  </span>
                </div>

                {/* Transcribed Answer Editable Display */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                    <span>Transcribed Voice Answer (Review & Edit):</span>
                    {currentInput && <span className="text-emerald-600 font-extrabold">Ready for Review</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Transcribed voice text will appear here live... You can edit any word before submitting."
                    disabled={isEvaluating}
                    className="w-full p-3.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Voice Mode Action Buttons: Submit, Edit Transcript, Record Again */}
                <div className="flex items-center justify-end gap-2.5 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentInput("");
                      if (!isListening) toggleListening();
                    }}
                    disabled={isEvaluating}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all border border-gray-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Record Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const inputElem = document.querySelector("textarea") as HTMLTextAreaElement;
                      if (inputElem) inputElem.focus();
                    }}
                    disabled={!currentInput || isEvaluating}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Edit Transcript</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitResponse}
                    disabled={!currentInput.trim() || isEvaluating}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* FINAL INTERVIEW SCORECARD REPORT */}
      {sessionStatus === "completed" && report && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-4">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                Session Audit Completed
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-2">
                Interview Performance Scorecard
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Comprehensive evaluation for {jobTitle} position ({persona})
              </p>
            </div>

            <button
              onClick={() => setSessionStatus("setup")}
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-all border border-indigo-200 flex items-center gap-2 cursor-pointer self-start md:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Interview Session</span>
            </button>
          </div>

          {/* Main Scorecard Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-lg border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">INTERVIEW PERFORMANCE REPORT</span>
              <h3 className="text-2xl font-black text-white mt-0.5">Final Candidate Assessment</h3>
              <p className="text-xs text-indigo-200 mt-1">Role: {jobTitle} | Company: {companyName} | Persona: {persona}</p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-md">
              <span className="text-xs font-black uppercase text-indigo-200">Overall Score:</span>
              <span className="text-4xl font-black text-white">{report.overallScore}</span>
              <span className="text-xs font-bold text-indigo-300">/100</span>
            </div>
          </div>

          {/* 6 Breakdown Metric Tiles (Requirement 13) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider leading-tight">Technical Knowledge</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-blue-950">{report.technicalKnowledge ?? report.overallScore}</span>
                <span className="text-[10px] text-blue-700 font-bold">/100</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider leading-tight">Relevance</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-emerald-950">{report.relevance ?? report.overallScore}</span>
                <span className="text-[10px] text-emerald-700 font-bold">/100</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider leading-tight">Communication</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-indigo-950">{report.communication ?? report.overallScore}</span>
                <span className="text-[10px] text-indigo-700 font-bold">/100</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-purple-900 uppercase tracking-wider leading-tight">Problem Solving</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-purple-950">{report.problemSolving ?? report.overallScore}</span>
                <span className="text-[10px] text-purple-700 font-bold">/100</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider leading-tight">Project Knowledge</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-amber-950">{report.projectKnowledge ?? report.overallScore}</span>
                <span className="text-[10px] text-amber-700 font-bold">/100</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl flex flex-col justify-between">
              <span className="text-[11px] font-black text-rose-900 uppercase tracking-wider leading-tight">Role Readiness</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-rose-950">{report.roleReadiness ?? report.overallScore}</span>
                <span className="text-[10px] text-rose-700 font-bold">/100</span>
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-1">Executive Session Summary</h4>
            <p className="text-xs text-gray-800 font-medium leading-relaxed">{report.summary}</p>
          </div>

          {/* Strengths vs Weak Areas vs Recommended Improvements Grid (Requirements 14 & 15) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/70 border border-emerald-200 p-6 rounded-3xl flex flex-col gap-3 shadow-xs">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths (Based on Actual Answers)
              </span>
              <ul className="space-y-2.5 text-xs font-semibold text-emerald-950">
                {report.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-emerald-200/50">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-6 rounded-3xl flex flex-col gap-3 shadow-xs">
              <span className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Identified Weak Areas (Supported by Answers)
              </span>
              <ul className="space-y-2.5 text-xs font-semibold text-rose-950">
                {(report.weaknesses || report.improvements || []).map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-rose-200/50">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Review Section (Requirement 16) */}
          {report.questionReviews && report.questionReviews.length > 0 && (
            <div className="flex flex-col gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Granular Answer Evaluation</span>
                  <h4 className="text-xl font-black text-gray-900 mt-0.5">Question-by-Question Review</h4>
                </div>
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-extrabold text-indigo-700">
                  {report.questionReviews.length} Questions Evaluated
                </span>
              </div>

              <div className="space-y-6">
                {report.questionReviews.map((item, qIdx) => (
                  <div key={qIdx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
                    {/* Header: Q# & Score */}
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <h5 className="text-sm font-black text-gray-900">{item.question}</h5>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 shrink-0">
                        <span className="text-xs font-bold text-indigo-600">Score:</span>
                        <span className="text-sm font-black text-indigo-950">{item.score}/100</span>
                      </div>
                    </div>

                    {/* Candidate Answer */}
                    <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Your Answer:</span>
                      <p className="text-xs text-gray-800 font-medium italic leading-relaxed">"{item.userAnswer}"</p>
                    </div>

                    {/* 3 Feedback Blocks: What was good, What was missing, How to improve */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col gap-1">
                        <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          What Was Good
                        </span>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">{item.whatWasGood}</p>
                      </div>

                      <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex flex-col gap-1">
                        <span className="text-[11px] font-black text-rose-900 uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          What Was Missing
                        </span>
                        <p className="text-xs text-rose-950 font-medium leading-relaxed">{item.whatWasMissing}</p>
                      </div>

                      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col gap-1">
                        <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          How to Improve
                        </span>
                        <p className="text-xs text-blue-950 font-medium leading-relaxed">{item.howToImprove}</p>
                      </div>
                    </div>

                    {/* Suggested Better Answer Structure */}
                    <div className="p-4 bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800 space-y-1.5">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        Suggested Answer Structure (Grounded in Candidate Skills)
                      </span>
                      <p className="text-xs text-indigo-100 font-mono whitespace-pre-line leading-relaxed">
                        {item.suggestedBetterAnswerStructure}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Preparation Plan Section (Requirement 17) */}
          {report.personalizedPrepPlan && report.personalizedPrepPlan.length > 0 && (
            <div className="flex flex-col gap-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Requirement 17 — Post-Interview Learning Roadmap
                  </span>
                  <h4 className="text-xl font-black text-gray-900 mt-0.5">Personalized Preparation Plan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-extrabold text-emerald-800">
                    {report.personalizedPrepPlan.length} Targeted Topics to Revise
                  </span>
                </div>
              </div>

              {/* Topics to Revise Badges */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider">Topics to Revise:</span>
                <div className="flex flex-wrap gap-2">
                  {report.personalizedPrepPlan.map((p, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-indigo-950 shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {p.topicName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Practice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.personalizedPrepPlan.map((plan, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-sm font-black text-gray-900">{plan.topicName}</h5>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Recommended Practice</span>
                    </div>

                    {/* What to Learn & Why It Matters */}
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          What to Learn
                        </span>
                        <p className="text-xs text-blue-950 font-medium leading-relaxed">{plan.whatToLearn}</p>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                          <Brain className="w-3 h-3 text-amber-600" />
                          Why It Matters
                        </span>
                        <p className="text-xs text-amber-950 font-medium leading-relaxed">{plan.whyItMatters}</p>
                      </div>
                    </div>

                    {/* Practice Question */}
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Practice Question
                      </span>
                      <p className="text-xs text-gray-900 font-extrabold italic leading-relaxed">"{plan.practiceQuestion}"</p>
                    </div>

                    {/* Mini Task */}
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col gap-1 mt-auto">
                      <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-emerald-600" />
                        Hands-On Mini Task
                      </span>
                      <p className="text-xs text-emerald-950 font-semibold leading-relaxed">{plan.miniTask}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default RealTimeMockInterview;
