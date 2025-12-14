import request, { ENABLE_MOCK as REQUEST_ENABLE_MOCK } from '../request';
import type { KnowledgeStateVO } from '../../components/dashboard/KnowledgeRadarChart';
import type { QuestionData } from '../../components/chat/QuestionCard';

// --- Configuration ---
// Set to false to use real backend data (MySQL/Redis)
// Set to true to use static mock data (for UI testing without backend)
// Override request mock setting if needed, or use a local constant
const USE_MOCK = REQUEST_ENABLE_MOCK; 

// --- Types ---
export interface SubmitAnswerRequest {
  studentId: number;
  questionId: number;
  isCorrect: boolean;
  duration?: number;
}

export interface KnowledgePoint {
  id: number;
  name: string;
  subject: string;
  description: string;
}

export interface StudentExerciseLog {
  id: number;
  questionId: number;
  result: number;
  duration: number;
  submitTime: string;
}

export interface PredictionResult {
    studentId: number;
    predictedScore: number;
    confidence: number;
}

// --- Mock Data (Fallback) ---
const MOCK_RADAR_DATA: KnowledgeStateVO[] = [
  { knowledgePointId: 1, knowledgePointName: '函数与导数', score: 0.85, level: 'Master' },
  { knowledgePointId: 2, knowledgePointName: '三角函数', score: 0.65, level: 'Proficient' },
  { knowledgePointId: 3, knowledgePointName: '数列', score: 0.92, level: 'Master' },
  { knowledgePointId: 4, knowledgePointName: '立体几何', score: 0.35, level: 'Novice' },
  { knowledgePointId: 5, knowledgePointName: '解析几何', score: 0.45, level: 'Novice' },
  { knowledgePointId: 6, knowledgePointName: '概率统计', score: 0.78, level: 'Proficient' },
];

const MOCK_GRAPH_DATA: Record<string, KnowledgePoint[]> = {
  "Math": [
    { id: 1, name: "函数与导数", subject: "Math", description: "Function concepts" },
    { id: 2, name: "三角函数", subject: "Math", description: "Trigonometry" }
  ],
  "Physics": [
    { id: 10, name: "力学", subject: "Physics", description: "Mechanics" }
  ]
};

const MOCK_AI_QUESTION: QuestionData = {
  id: 202,
  stem: "若 $\\sin \\alpha = \\frac{1}{3}$，且 $\\alpha \\in (\\frac{\\pi}{2}, \\pi)$，则 $\\cos \\alpha =$ ？",
  options: [
    "A. $\\frac{2\\sqrt{2}}{3}$",
    "B. $-\\frac{2\\sqrt{2}}{3}$",
    "C. $\\frac{1}{3}$",
    "D. $-\\frac{1}{3}$"
  ],
  correctAnswer: "B",
  analysis: "解析：\n1. 由 $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$，得 $|\\cos \\alpha| = \\sqrt{1 - (\\frac{1}{3})^2} = \\frac{2\\sqrt{2}}{3}$。\n2. 因为 $\\alpha \\in (\\frac{\\pi}{2}, \\pi)$，即第二象限角，余弦值为负。\n3. 所以 $\\cos \\alpha = -\\frac{2\\sqrt{2}}{3}$。\n\n选 B。"
};

// --- Services ---

/**
 * 获取知识图谱数据
 */
export async function getKnowledgeGraph(): Promise<Record<string, KnowledgePoint[]>> {
  if (USE_MOCK) return MOCK_GRAPH_DATA;
  try {
    const res = await request.get<Record<string, KnowledgePoint[]>>('/knowledge/graph');
    return res.data;
  } catch (e) {
    console.error("Fetch graph failed", e);
    return MOCK_GRAPH_DATA;
  }
}

/**
 * 获取随机题目 (Smart Practice)
 */
export async function getRandomQuestion(): Promise<QuestionData> {
  if (USE_MOCK) return MOCK_AI_QUESTION;
  try {
    const res = await request.get<any>('/practice/random');
    // Adapt backend response to frontend model
    let opts = res.data.options;
    if (typeof opts === 'string') {
        try { opts = JSON.parse(opts); } catch(e) {}
    }
    
    // Normalize options to string array if it's a map (e.g. {"A": "val"})
    if (opts && !Array.isArray(opts) && typeof opts === 'object') {
        opts = Object.keys(opts).sort().map(key => opts[key]);
    }

    return {
        id: res.data.id,
        stem: res.data.content,
        options: opts,
        correctAnswer: res.data.correctAnswer,
        analysis: res.data.analysis || "暂无解析"
    };
  } catch (e) {
    console.error("Fetch question failed", e);
    return MOCK_AI_QUESTION;
  }
}

/**
 * 获取学习报告
 */
export async function getStudentReport(studentId: number): Promise<StudentExerciseLog[]> {
  if (USE_MOCK) return [];
  try {
    const res = await request.get<StudentExerciseLog[]>(`/report/student/${studentId}`);
    return res.data;
  } catch (e) {
    console.error("Fetch report failed", e);
    return [];
  }
}

/**
 * 提交答题结果
 */
export async function submitExerciseResult(data: SubmitAnswerRequest): Promise<void> {
  if (USE_MOCK) {
    console.log('[Mock] Submit Result:', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  await request.post('/practice/submit', data);
}

/**
 * 获取 AI 智能解析
 */
export async function getAiExplanation(questionContent: string, wrongAnswer: string, correctAnswer: string): Promise<string> {
    if (USE_MOCK) return "Mock Explanation: This is a simulated AI response.";
    try {
        const res = await request.post<any>('/ai/explain', {
            questionContent, wrongAnswer, correctAnswer
        });
        return res.data.explanation;
    } catch (e) {
        console.error("AI Explain failed", e);
        return "Failed to get AI explanation.";
    }
}

/**
 * 获取成绩预测
 */
export async function getPrediction(studentId: number): Promise<PredictionResult> {
    if (USE_MOCK) return { studentId, predictedScore: 85, confidence: 0.8 };
    try {
        const res = await request.get<PredictionResult>(`/dashboard/prediction/${studentId}`);
        return res.data;
    } catch (e) {
        console.error("Prediction failed", e);
        return { studentId, predictedScore: 0, confidence: 0 };
    }
}

/**
 * 获取雷达图数据
 */
export async function getKnowledgeRadar(studentId: number): Promise<KnowledgeStateVO[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_RADAR_DATA;
  }
  try {
    const res = await request.get<KnowledgeStateVO[]>(`/dashboard/radar/${studentId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch radar data, falling back to mock", error);
    return MOCK_RADAR_DATA; // Fallback to mock on error
  }
}

/**
 * AI 生成题目
 * @param topic 想要复习的知识点 (Prompt)
 */
export async function generateQuestion(topic: string): Promise<QuestionData> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { ...MOCK_AI_QUESTION, id: Date.now() };
  }
  try {
    const res = await request.post<QuestionData>('/ai/generate', { topic });
    return res.data;
  } catch (error) {
     console.error("Failed to generate question, falling back to mock", error);
     return { ...MOCK_AI_QUESTION, id: Date.now() };
  }
}

