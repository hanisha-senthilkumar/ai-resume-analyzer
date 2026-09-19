export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AISafetyPromptRules = `
CRITICAL MANDATE — AI SAFETY, ACCURACY, EXPLAINABILITY & FAIRNESS:
1. STRICT FACTUAL FIDELITY: Never fabricate resume information. Never invent job experience, certifications, companies, degrees, metrics, or achievements.
2. EXPLICIT UNSTATED HANDLING: If a detail, metric, or certification is missing or unstated in the resume, EXPLICITLY output "Not found in resume." Do NOT invent or hallucinate data.
3. DISTINGUISH FACTS FROM SUGGESTIONS: Clearly isolate extracted resume facts from AI suggestions.
4. FAIRNESS & NON-DISCRIMINATION: Do not make evaluations or recommendations based on protected personal characteristics (age, gender, ethnicity, race, nationality, religion, disability, or marital status).
5. MANDATORY EXPLAINABILITY: Every score rating, tip, bullet rewrite, or job recommendation MUST include an explicit explanation ("why" or "reason") justifying the recommendation.
`;

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      keywordGaps: {
        foundKeywords: string[]; //5-8 top hard/soft skills found in resume
        missingKeywords: string[]; //4-6 important keywords missing relative to job title/description
        recommendations: string[]; //3 actionable keyword additions
      };
      quantifiedScore: number; //score 0-100 measuring presence of metrics/data in bullet points
      actionVerbsScore: number; //score 0-100 measuring strength of action verbs
      interviewQuestions: {
        category: "behavioral" | "technical" | "situational";
        question: string;
        sampleAnswer: string;
        tips: string;
      }[]; //3-4 realistic interview questions based on resume & job description
      coverLetter: string; //a well-structured 3-paragraph tailored cover letter draft
      bulletImprovements: {
        original: string; //weak bullet point found or inferred from resume
        improved: string; //action-oriented metric-backed revision
        reason: string; //why the revision is stronger
      }[]; //2-3 bullet point upgrades
      jobRoleRecommendations: {
        roleTitle: string; //e.g. "Full Stack Developer", "Frontend Developer", "Backend Developer"
        matchPercentage: number; //integer 0-100 match percentage based on skills & experience
        matchingSkills: string[]; //4-6 skills candidate possesses that fit this role
        missingSkills: string[]; //2-4 skills needed for full mastery of this role
        suggestedLearningAreas: string[]; //2-3 recommended topics or tools to learn
        whyThisRole: string; //clear explanation of why candidate fits this role
      }[]; //5 recommended roles tailored to candidate's background
      detailedInterviewQuestions: {
        question: string; //realistic question based on actual resume claims or target role
        category: "technical" | "project" | "hr" | "behavioral" | "resume-based"; //exact category
        difficulty: "easy" | "medium" | "hard"; //difficulty assessment
        whatInterviewerExpects: string; //what key traits or technical capabilities the interviewer assesses
        suggestedAnswerStructure: string; //step-by-step answer framework (e.g. STAR method or technical steps)
        keyConceptsToPrepare: string[]; //3-5 key concepts, keywords, or topics to review
      }[]; //6-8 tailored interview questions covering technical, project, HR, behavioral, and resume-based
      strengthMetrics: {
        atsScore: number; //integer 0-100
        jobMatchScore: number; //integer 0-100
        technicalSkillsCount: number; //integer count of verified technical skills
        projectsCount: number; //integer count of projects listed
        certificationsCount: number; //integer count of certifications/degrees
        experienceLevel: string; //e.g. "Entry-Level (0-2 Yrs)", "Mid-Senior (3-5 Yrs)", "Senior (5+ Yrs)"
        resumeCompleteness: number; //integer 0-100 completeness score
      };
    }`;

export const prepareInstructions = ({jobTitle, jobDescription}: { jobTitle: string; jobDescription: string; }) =>
    `You are a Senior Career Coach and Expert ATS (Applicant Tracking System) Resume Strategist.
      Please analyze and rate this resume thoroughly and suggest actionable ways to elevate it.
      
      ${AISafetyPromptRules}

      The rating should be realistic and rigorous. If the resume lacks metrics or clear formatting, reflect that in scores.
      The target job title is: ${jobTitle || 'General Professional Role'}
      The target job description is: ${jobDescription || 'Standard requirements for the specified title.'}

      Provide your complete analysis formatted precisely matching this interface:
      ${AIResponseFormat}
      
      CRITICAL REQUIREMENT: Return ONLY a raw JSON object string with no markdown formatting, no backticks (\`\`\`json), and no surrounding text.`;

export const prepareBulletRewritePrompt = ({ bullet, jobTitle }: { bullet: string; jobTitle?: string }) =>
    `You are an expert resume writer. Please rewrite the following resume bullet point to make it high-impact, quantifiable, and action-oriented for a ${jobTitle || 'target'} role.

${AISafetyPromptRules}

Original Bullet: "${bullet}"

Return ONLY a JSON object with this shape:
{
  "improved": "High-impact rewritten bullet point featuring dynamic action verbs and metric placeholders",
  "explanation": "Short summary of improvements made",
  "keyMetricsAdded": ["Metric 1", "Metric 2"]
}`;

export const prepareCoverLetterPrompt = ({ companyName, jobTitle, jobDescription, tone }: { companyName?: string; jobTitle?: string; jobDescription?: string; tone?: string }) =>
    `You are an expert Executive Resume Writer and Career Strategist. Using the candidate's attached resume and target job details, generate a compelling, highly personalized cover letter draft.

${AISafetyPromptRules}

Target Employer: "${companyName || 'Target Company'}"
Target Job Role: "${jobTitle || 'Desired Role'}"
Target Job Description:
${jobDescription || 'Standard requirements for the target role.'}
Requested Writing Tone: "${tone || 'professional'}"

CRITICAL MANDATE — STRICT FACTUAL ADHERENCE:
1. ONLY use facts, experience, skills, projects, and metrics explicitly present in the candidate's resume.
2. NEVER invent fake experience, unearned titles, fictitious companies, or unverified achievements.
3. Align the candidate's REAL skills and achievements directly with the requirements outlined in the target Job Description.
4. Structure the cover letter into 3 compelling, well-crafted paragraphs:
   - Paragraph 1: Powerful Hook & Target Alignment
   - Paragraph 2: Core Evidence & Key Technical Achievements (from actual resume)
   - Paragraph 3: Strategic Fit & Confident Call to Action

Return ONLY a JSON object with this shape:
{
  "subject": "Application for ${jobTitle || 'Desired Position'} - [Candidate Name]",
  "coverLetter": "Full body of cover letter..."
}`;

export const prepareJobMatcherPrompt = ({ jobTitle, companyName, jobDescription }: { jobTitle?: string; companyName?: string; jobDescription: string }) =>
    `You are an expert ATS & Resume-Job Matcher Analyst. Analyze the attached resume specifically against this target Job Description:

${AISafetyPromptRules}

Job Title: ${jobTitle || 'Specified Role'}
Company: ${companyName || 'Target Employer'}
Job Description:
${jobDescription}

Perform a rigorous evaluation and return a JSON object with EXACTLY this structure:
{
  "matchScore": 82, // integer 0-100 representing overall suitability
  "jobTitle": "${jobTitle || 'Specified Role'}",
  "companyName": "${companyName || 'Target Employer'}",
  "matchingSkills": ["Java", "React", "SQL", "TypeScript", "REST APIs"], // 4-8 hard/soft skills explicitly found in BOTH resume and job description
  "missingSkills": ["Docker", "AWS", "Kubernetes", "GraphQL"], // 3-6 critical skills listed in job description but missing or weak in resume
  "matchingKeywords": ["Agile", "CI/CD", "Microservices", "Frontend Engineering"], // 4-6 industry keywords present in resume
  "missingKeywords": ["Kubernetes Deployment", "AWS Lambda", "TDD", "System Design"], // 3-5 keywords missing from resume
  "relevantExperience": [
    { "highlight": "Built scalable React applications serving 50K+ users", "impact": "Directly matches front-end requirements" },
    { "highlight": "Optimized SQL query response times by 35%", "impact": "Demonstrates database expertise needed for role" }
  ],
  "experienceGaps": [
    { "gap": "Limited evidence of container orchestration (Kubernetes)", "recommendation": "Add a project or bullet demonstrating Docker containerization or cluster management" }
  ],
  "educationMatch": {
    "status": "Match", // "Match" | "Partial" | "Gap"
    "details": "Candidate's Bachelor's degree in CS/Software Engineering satisfies the educational requirements."
  },
  "recommendedImprovements": [
    "Incorporate explicit mentions of Cloud deployment (AWS or GCP).",
    "Add metrics to backend database optimization bullet points.",
    "Include Docker or containerization in the technical skills section."
  ]
}

CRITICAL REQUIREMENT: Return ONLY raw JSON without backticks (\`\`\`json) or extra text.`;

export const prepareSectionImprovementPrompt = ({ text, jobTitle }: { text: string; jobTitle?: string }) =>
    `You are an expert Resume Editor & Career Strategist. Analyze the following text or section from a candidate's resume for a ${jobTitle || 'target'} role:

${AISafetyPromptRules}

Input Text: "${text}"

CRITICAL MANDATE:
1. NEVER invent unmentioned experience, fake metrics, unearned certifications, or fictitious companies.
2. ONLY improve, reframe, and elevate the information ACTUALLY PRESENT in the user's input text.
3. Replace weak or passive phrasing (e.g. "Worked on a website project") with active, impact-focused phrasing (e.g. "Developed a responsive web application using React and REST APIs, improving usability and reducing page interaction time") WITHOUT inventing unverified data.

Return ONLY a JSON object formatted as follows:
{
  "weakText": "${text}",
  "improvedText": "Refined impact-driven version using active phrasing strictly preserving real facts",
  "rationale": "Clear explanation of how the wording was strengthened",
  "keyChanges": ["Changed passive verb to active verb", "Clarified technical workflow"]
}`;

export const prepareATSKeywordOptimizerPrompt = ({ jobDescription, jobTitle }: { jobDescription: string; jobTitle?: string }) =>
    `You are a Senior ATS Keyword Strategist. Compare the candidate's attached resume against the target job description:

${AISafetyPromptRules}

Target Role: ${jobTitle || 'Specified Position'}
Job Description:
${jobDescription}

Perform a 5-category ATS Keyword Analysis and return ONLY a JSON object matching this exact structure:
{
  "mustHaveKeywords": [
    { "keyword": "React", "status": "found" },
    { "keyword": "SQL", "status": "found" },
    { "keyword": "Docker", "status": "missing", "recommendedSection": "Technical Skills" },
    { "keyword": "REST API", "status": "missing", "recommendedSection": "Projects" }
  ],
  "recommendedKeywords": [
    { "keyword": "TypeScript", "status": "found" },
    { "keyword": "CI/CD", "status": "missing", "recommendedSection": "Work Experience" }
  ],
  "missingTechnicalSkills": [
    { "skill": "Docker", "recommendedSection": "Technical Skills", "rationale": "Add Docker containerization under your skills grid if you have hands-on experience." },
    { "skill": "AWS Lambda", "recommendedSection": "Projects", "rationale": "Mention AWS serverless architecture in project descriptions." }
  ],
  "missingSoftSkills": [
    { "skill": "Cross-functional Leadership", "recommendedSection": "Work Experience", "rationale": "Incorporate cross-functional leadership when describing project management." }
  ],
  "industryKeywords": [
    { "keyword": "Agile Methodology", "status": "found" },
    { "keyword": "Microservices Architecture", "status": "missing", "recommendedSection": "Summary / Technical Skills" }
  ]
}

CRITICAL MANDATE: Do not recommend keywords unrelated to the candidate's actual background or target role. For every missing keyword, specify the exact recommended section where it should be inserted.
Return ONLY raw JSON with no backticks (\`\`\`json) or surrounding text.`;

export const prepareJobRoleRecommenderPrompt = ({ jobTitle }: { jobTitle?: string } = {}) =>
    `You are a Senior Tech Talent Architect & Career Advisor. Analyze the candidate's attached resume and evaluate their suitability across top technical and professional job roles.

${AISafetyPromptRules}

Target Role Context: ${jobTitle || 'General Engineering / Technology'}

Evaluate the resume and output 5 highly relevant recommended job roles. Match percentages should reflect true skill alignment.

Return ONLY a JSON array of objects with this EXACT structure:
[
  {
    "roleTitle": "Full Stack Developer",
    "matchPercentage": 91,
    "matchingSkills": ["React", "Node.js", "TypeScript", "REST APIs", "PostgreSQL"],
    "missingSkills": ["GraphQL", "Docker"],
    "suggestedLearningAreas": ["Master GraphQL queries and mutations", "Containerize apps using Docker"],
    "whyThisRole": "Your resume demonstrates strong frontend capability in React alongside backend REST API experience, making you an exceptional fit for end-to-end full stack development."
  },
  {
    "roleTitle": "Frontend Developer",
    "matchPercentage": 87,
    "matchingSkills": ["React", "JavaScript", "HTML5", "CSS3/Tailwind", "State Management"],
    "missingSkills": ["Next.js SSR", "E2E Testing (Cypress)"],
    "suggestedLearningAreas": ["Learn Next.js App Router for SSR", "Set up Cypress end-to-end testing"],
    "whyThisRole": "Extensive experience building responsive web user interfaces and component libraries directly satisfies modern frontend engineering standards."
  },
  {
    "roleTitle": "Backend Developer",
    "matchPercentage": 79,
    "matchingSkills": ["Node.js", "Express", "SQL", "API Design", "Auth"],
    "missingSkills": ["Redis Caching", "Microservices Architecture", "Kubernetes"],
    "suggestedLearningAreas": ["Implement Redis caching layers", "Explore microservices communication with gRPC"],
    "whyThisRole": "Solid foundational knowledge in server-side JavaScript and relational database querying supports a seamless transition into dedicated backend development."
  },
  {
    "roleTitle": "Software Engineer",
    "matchPercentage": 76,
    "matchingSkills": ["Algorithms", "Data Structures", "Git", "OOP", "Code Review"],
    "missingSkills": ["System Design", "Distributed Systems"],
    "suggestedLearningAreas": ["Study System Design patterns & scalability", "Practice algorithmic problem solving"],
    "whyThisRole": "Broad computer science fundamentals, version control experience, and clean code practices position you well for generalist software engineering roles."
  },
  {
    "roleTitle": "React Developer",
    "matchPercentage": 74,
    "matchingSkills": ["React Hooks", "JSX", "Redux/Zustand", "Component Architecture"],
    "missingSkills": ["TypeScript Generics", "Performance Profiling"],
    "suggestedLearningAreas": ["Deep dive into React performance optimization", "Master TypeScript advanced generic types"],
    "whyThisRole": "Direct focus on React ecosystem and state management tools enables immediate contribution to frontend React specialist positions."
  }
]

CRITICAL REQUIREMENT: Return ONLY raw JSON without markdown backticks (\`\`\`json) or surrounding conversational text.`;

export const prepareInterviewPrepPrompt = ({ jobTitle }: { jobTitle?: string } = {}) =>
    `You are an expert Technical Recruiter & Senior Hiring Manager. Analyze the candidate's attached resume and generate realistic, highly tailored interview questions for a ${jobTitle || 'target'} position.

${AISafetyPromptRules}

Generate at least 8 distinct questions spanning ALL of the following 5 categories:
1. "technical" (Hard technical skills, frameworks, API design, code optimization)
2. "project" (Specific projects mentioned on resume, architectural choices, trade-offs)
3. "hr" (Career trajectory, salary expectations, team fit, work environment)
4. "behavioral" (Conflict resolution, deadline management, adaptability, leadership)
5. "resume-based" (Direct probing into claims, metrics, or technologies listed on resume)

Each question MUST include difficulty ratings ("easy", "medium", or "hard").

Return ONLY a JSON array matching this structure:
[
  {
    "question": "Explain how you implemented authentication and state persistence in your full-stack web application.",
    "category": "project",
    "difficulty": "medium",
    "whatInterviewerExpects": "Demonstrates security awareness (JWT handling, HTTP-only cookies, XSS/CSRF prevention) and clean state synchronization.",
    "suggestedAnswerStructure": "1. Mention chosen auth strategy (JWT vs Sessions)\\n2. Explain token storage & refresh mechanisms\\n3. Detail client-side state initialization\\n4. Highlight security precautions implemented",
    "keyConceptsToPrepare": ["JWT Storage", "HttpOnly Cookies", "OAuth2 Flow", "CSRF Tokens", "Zustand Persistence"]
  },
  {
    "question": "How do you profile, identify, and resolve frontend rendering performance bottlenecks in React applications?",
    "category": "technical",
    "difficulty": "hard",
    "whatInterviewerExpects": "Deep understanding of virtual DOM diffing, component re-render triggers, memory leaks, and DevTools profiling techniques.",
    "suggestedAnswerStructure": "1. Explain profiling tools (React DevTools, Lighthouse)\\n2. Detail re-render causes (prop changes, inline functions)\\n3. Mention optimization techniques (useMemo, useCallback, React.memo)\\n4. Share a real metric achieved",
    "keyConceptsToPrepare": ["React Profiler", "Memoization", "Code Splitting", "Virtualization", "Bundle Sizing"]
  },
  {
    "question": "Describe a situation where project scope expanded unexpectedly right before a major release. How did you handle it?",
    "category": "behavioral",
    "difficulty": "medium",
    "whatInterviewerExpects": "Assesses composure under pressure, prioritization skills, stakeholder communication, and practical negotiation.",
    "suggestedAnswerStructure": "SITUATION: Describe the sudden requirement change\\nTASK: Identify trade-offs between scope, quality, and time\\nACTION: Communicated clear options to product owners\\nRESULT: Delivered core features on time, deferring non-essential scope to v1.1",
    "keyConceptsToPrepare": ["STAR Method", "Scope Management", "Stakeholder Communication", "MVP Definition"]
  },
  {
    "question": "Why are you looking to transition to this company and what environment enables your best engineering work?",
    "category": "hr",
    "difficulty": "easy",
    "whatInterviewerExpects": "Evaluates cultural alignment, self-awareness, motivation, and understanding of our company mission.",
    "suggestedAnswerStructure": "1. Express enthusiasm for specific company product/culture\\n2. Share career growth motivations\\n3. Describe your ideal collaborative environment",
    "keyConceptsToPrepare": ["Company Mission", "Career Trajectory", "Team Collaboration", "Growth Mindset"]
  },
  {
    "question": "On your resume, you listed experience optimizing SQL database response times by 35%. Walk me through your exact indexing strategy.",
    "category": "resume-based",
    "difficulty": "hard",
    "whatInterviewerExpects": "Verifies authenticity of resume metrics, database execution plans, B-tree indexes, and query profiling skills.",
    "suggestedAnswerStructure": "1. State original problem (slow queries under load)\\n2. Explain query plan diagnosis (EXPLAIN ANALYZE)\\n3. Detail composite indexing and query rewriting\\n4. Confirm resulting performance gain",
    "keyConceptsToPrepare": ["EXPLAIN ANALYZE", "B-Tree Indexes", "Query Optimization", "Database Execution Plan"]
  }
]

CRITICAL REQUIREMENT: Return ONLY raw JSON with no markdown backticks (\`\`\`json) or surrounding text.`;

export const prepareResumeRebuilderPrompt = ({
    targetJobTitle,
    targetCompany = "",
    targetJobDescription = "",
    originalAtsScore = 75,
    existingSkillAnalysis = "",
    missingKeywordsAnalysis = "",
    originalResumeContent = ""
}: {
    targetJobTitle?: string;
    targetCompany?: string;
    targetJobDescription?: string;
    originalAtsScore?: number;
    existingSkillAnalysis?: string;
    missingKeywordsAnalysis?: string;
    originalResumeContent?: string;
} = {}) =>
    `You are an Executive Resume Writer and Lead ATS Optimization Specialist. Generate a complete, ATS-friendly resume using:
1. Candidate's Attached Original Resume Content:
"""
${originalResumeContent || 'Use attached file content.'}
"""
2. Existing Skill Analysis: "${existingSkillAnalysis || 'Technical & Soft Skills parsed from analysis'}"
3. Target Job Description:
"""
${targetJobDescription || 'Full stack development, React, TypeScript, Node.js, REST APIs, CI/CD, SQL databases, performance optimization, unit testing, agile collaboration.'}
"""
4. Existing Missing-Keyword Analysis: "${missingKeywordsAnalysis || 'Missing technical & domain keywords identified from job matcher'}"

${AISafetyPromptRules}

STRICT GROUNDING & ANTI-HALLUCINATION DIRECTIVE (NEVER INVENT INFORMATION):
- NEVER create fake experience or unearned job titles.
- NEVER create fake companies or employers.
- NEVER create fake certifications.
- NEVER create fake projects.
- NEVER create fake achievements or false metrics not grounded in the resume.
- NEVER invent fake technologies the candidate has never used.
- ONLY rewrite, reorganize, and reformat information that exists in the candidate's actual resume.

ATS KEYWORD OPTIMIZATION DIRECTIVE:
For every keyword in the target Job Description:
- IF the user's resume genuinely supports the keyword: naturally include it in summary, skills matrix, or experience bullet points.
- IF the user DOES NOT have the skill: DO NOT insert it into the resume body (prevents keyword stuffing and fake qualifications). Instead, return it separately in the "skillsToLearn" array with a learning path recommendation.

AI SUMMARY GENERATOR DIRECTIVE:
Generate a job-specific professional summary tailored for "${targetJobTitle || 'the target role'}".
Example Transformation Pattern:
- Original: "Computer Science student interested in software development."
- Optimized: "Computer Science student with experience developing web applications using React, JavaScript, Node.js and REST APIs, seeking an entry-level Full Stack Developer opportunity."
CRITICAL RULE FOR SUMMARY: Only mention technologies, frameworks, and tools actually found in the candidate's actual resume.

SMART BULLET POINT REWRITING DIRECTIVE:
Improve weak resume bullet points using active action verbs and concrete engineering outcomes.
Example Bullet Transformation:
- Original: "Created a website using React."
- Optimized: "Developed a responsive web application using React with reusable components and API integration."
- Reason for Improvement: "Replaced passive verb 'Created' with strong action verb 'Developed', highlighted responsiveness, reusable component architecture, and API integration."
CRITICAL RULE: Only add details supported by the original resume. Provide a explicit "reasonsForImprovement" string for every rewritten bullet point.

RESUME CHANGE REVIEW DIRECTIVE:
Provide a comprehensive change audit log before final generation.
Group all changes into 3 categories:
1. Added:
   - Relevant keywords (short explanation for each)
   - Improved descriptions (short explanation for each)
   - Better section organization (short explanation for each)
2. Modified:
   - Summary (short explanation for changes)
   - Project descriptions (short explanation for changes)
   - Experience bullets (short explanation for changes)
   - Skills organization (short explanation for changes)
3. Removed:
   - Duplicate information (short explanation for removals)
   - Unnecessary wording (short explanation for removals)

REQUIRED SECTIONS TO GENERATE:
1. Professional Summary (Target-tailored executive summary)
2. Technical & Soft Skills (Categorized into technical, soft, and domain competencies)
3. Experience (Optimized work experience with original vs AI-improved bullet points & reasons for improvement)
4. Projects (Candidate's actual projects with tech stack & impact statements)
5. Education (Candidate's actual degree & academic history)
6. Certifications (Candidate's actual certifications)
7. Achievements (Candidate's actual honors, awards, and key metrics)
8. Other Relevant Sections (Any additional sections available in original resume)
9. Skills to Learn (Separate list for required target JD skills NOT present on candidate's resume)
10. Resume Change Review (Audit log of Added, Modified, and Removed changes)

Return ONLY a valid JSON object matching this structure:
{
  "candidateName": "Candidate Name",
  "contactInfo": "Email | Phone | Location | LinkedIn | Portfolio",
  "targetJobTitle": "${targetJobTitle || 'Target Role'}",
  "targetCompany": "${targetCompany || 'Target Employer'}",
  "professionalSummary": "Results-driven engineering professional with proven expertise...",
  "technicalSkills": ["React", "TypeScript", "Node.js", "REST APIs", "Tailwind CSS", "Git", "Jest", "CI/CD"],
  "softSkills": ["Agile Collaboration", "Problem Solving", "Technical Leadership"],
  "domainKeywords": ["ATS Optimization", "State Management", "Component Architecture"],
  "experience": [
    {
      "company": "Tech Solutions Inc.",
      "role": "Senior Developer",
      "dates": "2022 - Present",
      "optimizedBullets": [
        "Architected and deployed scalable React & TypeScript frontend interfaces, improving page load speeds by 38%.",
        "Engineered RESTful API integrations handling 50K+ daily active requests with 99.9% uptime compliance."
      ],
      "originalBullets": [
        "Worked on React frontend",
        "Built APIs for the application"
      ],
      "reasonsForImprovement": [
        "Replaced weak verb 'Worked on' with high-impact action verb 'Architected', added TypeScript specificity and performance metric.",
        "Replaced generic 'Built' with 'Engineered', highlighted high concurrency requests and uptime SLA compliance."
      ],
      "injectedKeywords": ["TypeScript", "RESTful API", "Uptime Compliance"]
    }
  ],
  "projects": [
    {
      "projectName": "AI Career Resume Platform",
      "techStack": ["React", "TypeScript", "Tailwind CSS", "Puter AI"],
      "description": "Full-stack AI SaaS platform delivering real-time ATS resume audits.",
      "optimizedBullets": [
        "Integrated AI LLM APIs to process unstructured resume text and output structured JSON feedback."
      ]
    }
  ],
  "education": [
    "Bachelor of Science in Computer Science — State University"
  ],
  "certifications": [
    "AWS Certified Cloud Practitioner"
  ],
  "achievements": [
    "Engineered core system optimization resulting in 35% speed improvement"
  ],
  "otherSections": [
    {
      "sectionTitle": "Leadership & Volunteering",
      "items": ["Peer Code Mentor for University Computer Science Society"]
    }
  ],
  "skillsToLearn": [
    {
      "skill": "Kubernetes",
      "reason": "Mentioned in target Job Description but missing from candidate's genuine experience.",
      "suggestedLearningPath": "Explore CKA or Docker container orchestration fundamentals."
    }
  ],
  "resumeChangeReview": {
    "added": {
      "relevantKeywords": [
        { "item": "RESTful API & TypeScript", "explanation": "Injected critical technical terms from target JD supported by your experience." }
      ],
      "improvedDescriptions": [
        { "item": "Metric-rich performance outcomes", "explanation": "Added quantifiable speed and uptime SLA benchmarks." }
      ],
      "betterSectionOrganization": [
        { "item": "Categorized Skills Matrix", "explanation": "Structured skills into Technical, Soft, and Domain categories for ATS parser compatibility." }
      ]
    },
    "modified": {
      "summary": [
        { "item": "Target-tailored Executive Summary", "explanation": "Refocused career statement towards target role requirements." }
      ],
      "projectDescriptions": [
        { "item": "AI Career SaaS Suite", "explanation": "Reformatted project accomplishments with clear tech stack breakdown." }
      ],
      "experienceBullets": [
        { "item": "Active Action Verbs", "explanation": "Replaced weak verbs 'Worked on' and 'Built' with 'Architected' and 'Engineered'." }
      ],
      "skillsOrganization": [
        { "item": "Core Competency Grouping", "explanation": "Grouped frameworks, tools, and soft skills into distinct ATS scan blocks." }
      ]
    },
    "removed": {
      "duplicateInformation": [
        { "item": "Redundant team meeting mentions", "explanation": "Eliminated basic task descriptions to maximize impact density." }
      ],
      "unnecessaryWording": [
        { "item": "Passive filler phrases", "explanation": "Removed filler words like 'responsible for' and 'helped with'." }
      ]
    }
  },
  "projects": [
    {
      "projectName": "AI Career Resume Platform",
      "techStack": ["React", "TypeScript", "Tailwind CSS", "Puter AI"],
      "description": "Full-stack AI SaaS platform delivering real-time ATS resume audits.",
      "optimizedBullets": [
        "Integrated AI LLM APIs to process unstructured resume text and output structured JSON feedback."
      ]
    }
  ],
  "education": [
    "Bachelor of Science in Computer Science — State University"
  ],
  "certifications": [
    "AWS Certified Cloud Practitioner"
  ],
  "achievements": [
    "Engineered core system optimization resulting in 35% speed improvement"
  ],
  "otherSections": [
    {
      "sectionTitle": "Leadership & Volunteering",
      "items": ["Peer Code Mentor for University Computer Science Society"]
    }
  ],
  "injectedKeywordsList": ["TypeScript", "RESTful API", "CI/CD", "Performance Optimization"],
  "projectedAtsScore": \${calculateRealAtsScore(JSON.stringify(resumeData), targetJobDescription, originalAtsScore)},
  "originalAtsScore": ${originalAtsScore},
  "atsOptimizationNotes": [
    "Integrated critical technical keywords supported by genuine candidate experience.",
    "Categorized unsupported JD requirements into Skills to Learn to prevent keyword stuffing.",
    "Transformed passive bullet statements into active, metric-driven statements while preserving 100% truthfulness."
  ]
}

CRITICAL REQUIREMENT: Return ONLY raw JSON without markdown backticks (\`\`\`json) or surrounding text.`;

export const prepareSingleSectionRegenPrompt = ({
    sectionName,
    targetJobTitle = "Software Engineer",
    targetJobDescription = "",
    currentContent = ""
}: {
    sectionName: string;
    targetJobTitle?: string;
    targetJobDescription?: string;
    currentContent?: string;
}) =>
    `You are an Executive Resume Writer and Lead ATS Specialist. Regenerate ONLY the "${sectionName}" section of the resume tailored for:
Target Position: "${targetJobTitle}"
Target Job Description:
"""
${targetJobDescription || 'Full stack development, React, TypeScript, APIs, SQL, testing, agile'}
"""

Current "${sectionName}" section content:
"""
${currentContent}
"""

${AISafetyPromptRules}

STRICT RULE: Do NOT invent fake experience, fake companies, or false metrics. Only optimize phrasing, action verbs, and relevant keyword alignment for this specific section.

Return ONLY a valid JSON object matching the section structure for "${sectionName}":
- If sectionName is "summary": { "professionalSummary": "rewritten summary text..." }
- If sectionName is "skills": { "technicalSkills": ["..."], "softSkills": ["..."], "domainKeywords": ["..."] }
- If sectionName is "experience": { "experience": [{ "company": "...", "role": "...", "dates": "...", "optimizedBullets": ["..."], "originalBullets": ["..."], "reasonsForImprovement": ["..."] }] }
- If sectionName is "projects": { "projects": [{ "projectName": "...", "techStack": ["..."], "description": "...", "optimizedBullets": ["..."] }] }
- If sectionName is "education": { "education": ["..."] }
- If sectionName is "certifications": { "certifications": ["..."] }
- If sectionName is "achievements": { "achievements": ["..."] }

CRITICAL REQUIREMENT: Return ONLY raw JSON without markdown backticks (\`\`\`json) or surrounding text.`;

export const calculateRealAtsScore = (
  resumeText: string,
  jobDescription: string = "",
  baselineScore: number = 65
): number => {
  if (!resumeText) return baselineScore;

  // 1. Keyword Alignment Score (40% weight)
  const jdWords = Array.from(new Set(
    jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4)
  ));

  let keywordScore = 70;
  if (jdWords.length > 0) {
    const resumeLower = resumeText.toLowerCase();
    const matchedCount = jdWords.filter(w => resumeLower.includes(w)).length;
    keywordScore = Math.min(100, Math.round((matchedCount / jdWords.length) * 100));
  }

  // 2. Metric & Quantified Data Score (30% weight)
  const numbersCount = (resumeText.match(/\b\d+(?:[\.,]\d+)?%?|\$\d+/g) || []).length;
  const metricScore = Math.min(100, Math.max(50, numbersCount * 7));

  // 3. Section Completeness & Hierarchy (30% weight)
  let sectionScore = 60;
  if (/summary/i.test(resumeText)) sectionScore += 10;
  if (/experience/i.test(resumeText)) sectionScore += 10;
  if (/skills/i.test(resumeText)) sectionScore += 10;
  if (/education/i.test(resumeText)) sectionScore += 10;

  const rawScore = Math.round((keywordScore * 0.4) + (metricScore * 0.3) + (sectionScore * 0.3));

  // Return real calculated ATS score derived directly from the text without artificial inflation
  return Math.min(98, Math.max(10, rawScore));
};
