export interface Resume {
    id: string;
    versionName?: string;
    versionNumber?: number;
    resumeName?: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
    createdAt?: string;
    summarySnippet?: string;
    jobMatchScore?: number;
}

export interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    keywordGaps?: {
        foundKeywords: string[];
        missingKeywords: string[];
        recommendations: string[];
    };
    quantifiedScore?: number;
    actionVerbsScore?: number;
    interviewQuestions?: {
        category: "behavioral" | "technical" | "situational";
        question: string;
        sampleAnswer: string;
        tips: string;
    }[];
    coverLetter?: string;
    bulletImprovements?: {
        original: string;
        improved: string;
        reason: string;
    }[];
    sectionImprovements?: {
        id: string;
        sectionName?: string;
        weakText: string;
        improvedText: string;
        rationale: string;
    }[];
    atsKeywordOptimizer?: {
        mustHaveKeywords: { keyword: string; status: "found" | "missing"; recommendedSection?: string }[];
        recommendedKeywords: { keyword: string; status: "found" | "missing"; recommendedSection?: string }[];
        missingTechnicalSkills: { skill: string; recommendedSection: string; rationale: string }[];
        missingSoftSkills: { skill: string; recommendedSection: string; rationale: string }[];
        industryKeywords: { keyword: string; status: "found" | "missing"; recommendedSection?: string }[];
    };
    jobRoleRecommendations?: JobRoleRecommendation[];
    detailedInterviewQuestions?: DetailedInterviewQuestion[];
    strengthMetrics?: ResumeStrengthMetrics;
}

export interface ResumeStrengthMetrics {
    atsScore: number;
    jobMatchScore: number;
    technicalSkillsCount: number;
    projectsCount: number;
    certificationsCount: number;
    experienceLevel: string;
    resumeCompleteness: number;
    skillsDistribution?: { category: string; count: number; percentage: number; color: string; lightColor?: string }[];
    sectionStrength?: { sectionName: string; score: number; status: string; color?: string }[];
    atsBreakdown?: { category: string; score: number; status: "Good" | "Needs Work" | "Warning"; tip?: string }[];
}

export interface DetailedInterviewQuestion {
    id?: string;
    question: string;
    category: "technical" | "project" | "hr" | "behavioral" | "resume-based";
    difficulty: "easy" | "medium" | "hard";
    whatInterviewerExpects: string;
    suggestedAnswerStructure: string;
    keyConceptsToPrepare: string[];
    sampleAnswer?: string;
    tips?: string;
}

export interface JobRoleRecommendation {
    roleTitle: string;
    matchPercentage: number;
    matchingSkills: string[];
    missingSkills: string[];
    suggestedLearningAreas: string[];
    whyThisRole: string;
}

export interface JobMatchResult {
    matchScore: number;
    jobTitle?: string;
    companyName?: string;
    matchingSkills: string[];
    missingSkills: string[];
    matchingKeywords: string[];
    missingKeywords: string[];
    relevantExperience: {
        highlight: string;
        impact: string;
    }[];
    experienceGaps: {
        gap: string;
        recommendation: string;
    }[];
    educationMatch?: {
        status: "Match" | "Partial" | "Gap";
        details: string;
    };
    recommendedImprovements?: string[];
}

export interface UserModel {
    userId: string;
    username: string;
    email?: string;
    createdAt: string;
    lastLoginAt?: string;
    resumesCount?: number;
}

export interface ResumeAnalysisModel {
    id: string;
    userId: string;
    resumeName: string;
    companyName?: string;
    jobTitle?: string;
    atsScore: number;
    jobMatchScore: number;
    createdAt: string;
    summarySnippet: string;
    feedback: Feedback;
    imagePath?: string;
    resumePath?: string;
}

export interface SkillGapModel {
    id: string;
    resumeId: string;
    userId: string;
    foundKeywords: string[];
    missingKeywords: string[];
    missingTechnicalSkills: string[];
    missingSoftSkills: string[];
    recommendations: string[];
    updatedAt: string;
}

export interface LearningProgressModel {
    id: string;
    userId: string;
    resumeId: string;
    roleTitle: string;
    completedTasks: Record<string, boolean>;
    updatedAt: string;
}

export interface MockInterviewTurn {
    id: string;
    speaker: "interviewer" | "candidate";
    message: string;
    timestamp: string;
    turnScore?: number;
    technicalAccuracy?: number;
    relevance?: number;
    completeness?: number;
    communication?: number;
    communicationConfidenceIndicators?: number;
    turnFeedback?: string;
    keyPointsHit?: string[];
}

export interface QuestionReviewItem {
    question: string;
    userAnswer: string;
    score: number;
    whatWasGood: string;
    whatWasMissing: string;
    howToImprove: string;
    suggestedBetterAnswerStructure: string;
}

export interface PersonalizedPrepTopic {
    topicName: string;
    whatToLearn: string;
    whyItMatters: string;
    practiceQuestion: string;
    miniTask: string;
}

export interface MockInterviewReport {
    overallScore: number;
    technicalKnowledge: number;
    relevance: number;
    communication: number;
    problemSolving: number;
    projectKnowledge: number;
    roleReadiness: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
    questionReviews?: QuestionReviewItem[];
    personalizedPrepPlan?: PersonalizedPrepTopic[];
}

export interface InterviewSessionModel {
    id: string;
    userId: string;
    resumeId: string;
    jobTitle?: string;
    companyName?: string;
    interviewerPersona?: string;
    difficultyLevel?: string;
    userNotes?: Record<string, string>;
    bookmarkedQuestions?: string[];
    transcript?: MockInterviewTurn[];
    report?: MockInterviewReport;
    updatedAt: string;
}

export interface ResumeVersionModel {
    id: string;
    userId: string;
    resumeId: string;
    versionNumber: number;
    versionName?: string;
    resumeName: string;
    jobTitle?: string;
    atsScore: number;
    jobMatchScore: number;
    createdAt: string;
}

export interface CareerReportModel {
    id: string;
    userId: string;
    resumeId: string;
    reportTitle: string;
    generatedAt: string;
    atsScore: number;
    jobMatchScore: number;
}

export interface RebuiltExperienceItem {
    company: string;
    role: string;
    dates: string;
    optimizedBullets: string[];
    originalBullets?: string[];
    injectedKeywords?: string[];
    reasonsForImprovement?: string[];
}

export interface RebuiltProjectItem {
    projectName: string;
    techStack: string[];
    description: string;
    optimizedBullets: string[];
}

export interface SkillToLearn {
    skill: string;
    reason: string;
    suggestedLearningPath?: string;
}

export interface ChangeReviewItem {
    item: string;
    explanation: string;
}

export interface ResumeChangeReview {
    added: {
        relevantKeywords: ChangeReviewItem[];
        improvedDescriptions: ChangeReviewItem[];
        betterSectionOrganization: ChangeReviewItem[];
    };
    modified: {
        summary: ChangeReviewItem[];
        projectDescriptions: ChangeReviewItem[];
        experienceBullets: ChangeReviewItem[];
        skillsOrganization: ChangeReviewItem[];
    };
    removed: {
        duplicateInformation: ChangeReviewItem[];
        unnecessaryWording: ChangeReviewItem[];
    };
}

export interface RebuiltResume {
    candidateName: string;
    contactInfo: string;
    targetJobTitle: string;
    targetCompany?: string;
    professionalSummary: string;
    technicalSkills: string[];
    softSkills: string[];
    domainKeywords: string[];
    experience: RebuiltExperienceItem[];
    projects: RebuiltProjectItem[];
    education: string[];
    certifications: string[];
    achievements?: string[];
    otherSections?: { sectionTitle: string; items: string[] }[];
    skillsToLearn?: SkillToLearn[];
    resumeChangeReview?: ResumeChangeReview;
    injectedKeywordsList: string[];
    projectedAtsScore: number;
    originalAtsScore: number;
    atsOptimizationNotes: string[];
}

declare global {
    type Resume = import('./index').Resume;
    type Feedback = import('./index').Feedback;
    type ResumeStrengthMetrics = import('./index').ResumeStrengthMetrics;
    type DetailedInterviewQuestion = import('./index').DetailedInterviewQuestion;
    type JobRoleRecommendation = import('./index').JobRoleRecommendation;
    type JobMatchResult = import('./index').JobMatchResult;
    type UserModel = import('./index').UserModel;
    type ResumeAnalysisModel = import('./index').ResumeAnalysisModel;
    type SkillGapModel = import('./index').SkillGapModel;
    type LearningProgressModel = import('./index').LearningProgressModel;
    type InterviewSessionModel = import('./index').InterviewSessionModel;
    type ResumeVersionModel = import('./index').ResumeVersionModel;
    type CareerReportModel = import('./index').CareerReportModel;
    type RebuiltResume = import('./index').RebuiltResume;
    type RebuiltExperienceItem = import('./index').RebuiltExperienceItem;
    type RebuiltProjectItem = import('./index').RebuiltProjectItem;
}
