import { motion } from 'framer-motion';
import { BentoCard } from '../components/ui/BentoCard';
import { KnowledgeRadarChart, type KnowledgeStateVO } from '../components/dashboard/KnowledgeRadarChart';
import { AreaChart, Area, XAxis, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { Radar, Activity, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getKnowledgeRadar, getPrediction, type PredictionResult } from '../api/services/knowledge';

// --- Static Mock Trend Data (Frontend Only for now) ---
const MOCK_TREND_DATA = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 82 },
  { day: 'Sat', score: 90 },
  { day: 'Sun', score: 88 },
];

// Stagger Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const [radarData, setRadarData] = useState<KnowledgeStateVO[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch radar data for Student ID = 1 (Initialized in Backend)
        const data = await getKnowledgeRadar(1);
        setRadarData(data);
        
        // Fetch Prediction
        const pred = await getPrediction(1);
        setPrediction(pred);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const weakPoints = radarData.filter(kp => kp.score < 0.5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">学习概览</h1>
        <p className="text-slate-500 mt-2">欢迎回来！这是你今天的学习状态追踪。</p>
      </header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Main Stats: Knowledge Radar (Span 2 cols) */}
        <BentoCard 
          className="md:col-span-2 md:row-span-2 min-h-[400px]"
          title="知识掌握雷达 (BKT算法)"
          icon={<Radar className="h-6 w-6" />}
        >
          <div className="flex h-full items-center justify-center -mt-6">
            <KnowledgeRadarChart data={radarData} />
          </div>
        </BentoCard>

        {/* 2. Score Prediction (Right Side) */}
        <BentoCard 
          className="md:col-span-1"
          title="AI 成绩预测"
          icon={<TrendingUp className="h-6 w-6 text-indigo-500" />}
        >
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="text-5xl font-bold text-indigo-600">
                {prediction ? prediction.predictedScore : '--'}
                <span className="text-lg text-slate-400 font-normal ml-1">分</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
                置信度: {prediction ? (prediction.confidence * 100).toFixed(0) : 0}%
            </p>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${prediction ? prediction.predictedScore : 0}%` }}
                />
            </div>
          </div>
        </BentoCard>

        {/* 3. Weak Points Alert (Right Side) */}
        <BentoCard 
          className="md:col-span-1"
          title="薄弱点警示"
          icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
        >
          <div className="space-y-3 mt-2">
            {weakPoints.length === 0 ? (
              <p className="text-green-500 text-sm">太棒了！所有知识点都已达标。</p>
            ) : (
              weakPoints.map(kp => (
                <div key={kp.knowledgePointId} className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
                  <span className="text-sm font-medium text-slate-700">{kp.knowledgePointName}</span>
                  <span className="px-2 py-1 text-xs font-bold text-orange-600 bg-orange-100 rounded-full">
                    {(kp.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </BentoCard>

        {/* 4. Quick Actions (Bottom Span 3) */}
        <BentoCard 
          className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-none shadow-lg shadow-indigo-200"
        >
          <div className="flex items-center justify-between px-4">
            <div>
              <h3 className="text-xl font-bold">准备好开始今天的练习了吗？</h3>
              <p className="text-indigo-100 opacity-90 mt-1">根据你的状态，AI 已为你推荐了 5 道针对性练习。</p>
            </div>
            <button className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-colors">
              <Zap className="h-5 w-5 fill-current" />
              开始智能刷题
            </button>
          </div>
        </BentoCard>

      </motion.div>
    </div>
  );
}
