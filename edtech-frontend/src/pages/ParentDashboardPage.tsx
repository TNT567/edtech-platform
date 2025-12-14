import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BentoCard } from '../components/ui/BentoCard';
import { 
  Users, Clock, Send, Shield, AlertTriangle,
  Target, BarChart3, Settings, Bell, Eye
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getChildDetail, updateParentSettings, sendWeeklyReport } from '../api/services/gamification';

interface ChildData {
  nickname: string;
  avatar: string;
  grade: string;
  totalPoints: number;
  currentStreak: number;
  totalPracticeCount: number;
  totalPracticeTime: number;
  todayPracticeMinutes: number;
  todayGoalProgress: {
    targetQuestions: number;
    completedQuestions: number;
    targetMinutes: number;
    completedMinutes: number;
    isCompleted: number;
  };
  radarData: { knowledgePointId: number; knowledgePointName: string; score: number }[];
  weakPoints: { knowledgePointId: number; knowledgePointName: string; score: number }[];
}

export default function ParentDashboardPage() {
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTimeLimit, setDailyTimeLimit] = useState(120);
  const [allowStartHour, setAllowStartHour] = useState(8);
  const [allowEndHour, setAllowEndHour] = useState(22);
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getChildDetail(1);
        setChild(data);
      } catch (e) {
        console.error("Failed to load child data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      await sendWeeklyReport(1);
      alert('周报已发送到您的邮箱');
    } catch (e) {
      console.error("Failed to send report", e);
    } finally {
      setSendingReport(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateParentSettings(3, 1, { dailyTimeLimit, allowStartHour, allowEndHour });
      alert('设置已保存');
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Transform radar data for Recharts
  const radarChartData = child?.radarData.map(d => ({
    subject: d.knowledgePointName,
    A: d.score * 100,
    fullMark: 100
  })) || [];

  const todayProgress = child?.todayGoalProgress;
  const progressPercent = todayProgress 
    ? (todayProgress.completedQuestions / todayProgress.targetQuestions) * 100 
    : 0;

  return (
    <div className="p-2">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-500" />
              家长监督面板
            </h1>
            <p className="text-slate-500 mt-1">了解孩子的学习进度，合理安排学习时间</p>
          </div>
          <motion.button
            onClick={handleSendReport}
            disabled={sendingReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4" />
            {sendingReport ? '发送中...' : '推送周报'}
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Profile Card */}
        <BentoCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
              {child?.nickname.charAt(0) || '孩'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{child?.nickname || '孩子'}</h2>
            <p className="text-slate-500">{child?.grade || '--'}</p>
            
            <div className="w-full mt-6 grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-3">
                <span className="text-2xl font-bold text-indigo-600">{child?.totalPoints || 0}</span>
                <p className="text-xs text-slate-500">总积分</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3">
                <span className="text-2xl font-bold text-orange-600">{child?.currentStreak || 0}</span>
                <p className="text-xs text-slate-500">连胜天数</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3">
                <span className="text-2xl font-bold text-green-600">{child?.totalPracticeCount || 0}</span>
                <p className="text-xs text-slate-500">完成题数</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-3">
                <span className="text-2xl font-bold text-purple-600">
                  {child ? Math.floor(child.totalPracticeTime / 60) : 0}h
                </span>
                <p className="text-xs text-slate-500">学习时长</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Knowledge Radar */}
        <BentoCard 
          className="lg:col-span-2" 
          title="知识掌握情况" 
          icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                  name="掌握度"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Today's Practice Stats */}
        <BentoCard 
          title="今日学习情况" 
          icon={<Clock className="h-5 w-5 text-green-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">今日练习时长</span>
              <span className="text-2xl font-bold text-green-600">{child?.todayPracticeMinutes || 0} 分钟</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((child?.todayPracticeMinutes || 0) / dailyTimeLimit * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-right">
              限制: {dailyTimeLimit} 分钟/天
            </p>
            
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">目标进度</span>
                <span className="text-sm text-slate-500">
                  {todayProgress?.completedQuestions || 0} / {todayProgress?.targetQuestions || 10} 题
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-400 to-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Weak Points Alert */}
        <BentoCard 
          title="薄弱知识点" 
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
        >
          <div className="space-y-3">
            {child?.weakPoints.map((wp, idx) => (
              <motion.div
                key={wp.knowledgePointId}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    wp.score < 0.4 ? 'bg-red-400' : 'bg-orange-400'
                  }`} />
                  <span className="font-medium text-slate-700">{wp.knowledgePointName}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  wp.score < 0.4 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {(wp.score * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
            {(!child?.weakPoints || child.weakPoints.length === 0) && (
              <div className="text-center py-4">
                <Target className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 font-medium">太棒了！暂无薄弱点</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Time Control Settings */}
        <BentoCard 
          title="时间控制" 
          icon={<Shield className="h-5 w-5 text-violet-500" />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">每日时间限制</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="30"
                  value={dailyTimeLimit}
                  onChange={(e) => setDailyTimeLimit(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-20 text-right font-bold text-violet-600">{dailyTimeLimit} 分钟</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 mb-2 block">允许学习时间段</label>
              <div className="flex items-center gap-2">
                <select
                  value={allowStartHour}
                  onChange={(e) => setAllowStartHour(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-violet-400 outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
                <span className="text-slate-400">至</span>
                <select
                  value={allowEndHour}
                  onChange={(e) => setAllowEndHour(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-violet-400 outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              保存设置
            </button>
          </div>
        </BentoCard>

        {/* Quick Actions */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Eye className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold">查看详细报告</h3>
              <p className="text-indigo-100 text-sm">历史学习数据分析</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold">通知设置</h3>
              <p className="text-green-100 text-sm">学习提醒与报告推送</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold">更多设置</h3>
              <p className="text-orange-100 text-sm">账户与隐私管理</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
