import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/ui/BentoCard';
import { 
  Target, Calendar, Gift, Flame, Clock, CheckCircle, 
  Plus, Minus, Zap, Trophy, Star
} from 'lucide-react';
import { getTodayGoal, updateDailyGoal, getCalendarData, type DailyGoal, type CalendarDay } from '../api/services/gamification';

// Heatmap color mapping
const getHeatmapColor = (intensity: number) => {
  const colors = [
    'bg-slate-100',      // 0 - no activity
    'bg-indigo-100',     // 1
    'bg-indigo-200',     // 2
    'bg-indigo-400',     // 3
    'bg-indigo-600',     // 4 - complete
  ];
  return colors[intensity] || colors[0];
};

function CircularProgress({ progress, size = 160, strokeWidth = 12 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-slate-800"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-sm text-slate-500">今日进度</span>
      </div>
    </div>
  );
}

function HeatmapCalendar({ data }: { data: CalendarDay[] }) {
  // Group by weeks
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  data.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs text-slate-400 justify-end pr-1">
        {['一', '二', '三', '四', '五', '六', '日'].map(d => (
          <span key={d} className="w-4 h-4 flex items-center justify-center">{d}</span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 justify-end">
            {week.map((day, dayIdx) => (
              <motion.div
                key={day.date}
                className={`w-4 h-4 rounded-sm ${getHeatmapColor(day.intensity)} cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all`}
                title={`${day.date}: ${day.questionsCompleted} 题, ${day.minutesCompleted} 分钟`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-slate-400">少</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`w-3 h-3 rounded-sm ${getHeatmapColor(i)}`} />
        ))}
        <span className="text-xs text-slate-400">多</span>
      </div>
    </div>
  );
}

export default function DailyGoalsPage() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetQuestions, setTargetQuestions] = useState(10);
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalData, calendarData] = await Promise.all([
          getTodayGoal(1),
          getCalendarData(1, 90)
        ]);
        setGoal(goalData);
        setTargetQuestions(goalData.targetQuestions);
        setTargetMinutes(goalData.targetMinutes);
        setCalendar(calendarData);
      } catch (e) {
        console.error("Failed to load daily goals", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveGoal = async () => {
    try {
      const updated = await updateDailyGoal(1, targetQuestions, targetMinutes);
      setGoal(updated);
      setEditing(false);
    } catch (e) {
      console.error("Failed to update goal", e);
    }
  };

  const progress = goal ? (goal.completedQuestions / goal.targetQuestions) * 100 : 0;
  const isCompleted = goal?.isCompleted === 1;
  const canClaimReward = isCompleted && goal?.rewardClaimed === 0;

  // Calculate streak from calendar
  const currentStreak = calendar.filter(d => d.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Target className="h-8 w-8 text-indigo-500" />
              每日目标
            </h1>
            <p className="text-slate-500 mt-1">设定目标，养成学习习惯！</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-2xl">
            <Flame className="h-5 w-5 text-orange-500 fill-current" />
            <span className="font-bold text-orange-600">{currentStreak} 天连胜</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <div className="lg:col-span-2 space-y-6">
          <BentoCard className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Progress Ring */}
              <CircularProgress progress={Math.min(progress, 100)} />
              
              {/* Stats */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Target className="h-5 w-5" />
                      <span className="font-medium">题目进度</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                      {goal?.completedQuestions || 0} <span className="text-lg text-slate-400">/ {goal?.targetQuestions || 10}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-violet-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">时长进度</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                      {goal?.completedMinutes || 0} <span className="text-lg text-slate-400">/ {goal?.targetMinutes || 30} 分钟</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isCompleted ? (
                    <motion.button
                      onClick={() => navigate('/practice')}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Zap className="h-5 w-5 fill-current" />
                      继续练习
                    </motion.button>
                  ) : canClaimReward ? (
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Gift className="h-5 w-5" />
                      领取奖励 (+50积分)
                    </motion.button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-100 text-green-600 rounded-2xl font-bold">
                      <CheckCircle className="h-5 w-5" />
                      今日目标已完成！
                    </div>
                  )}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Heatmap Calendar */}
          <BentoCard title="学习热力图" icon={<Calendar className="h-5 w-5 text-green-500" />}>
            <div className="overflow-x-auto py-2">
              <HeatmapCalendar data={calendar} />
            </div>
          </BentoCard>
        </div>

        {/* Goal Settings & Rewards */}
        <div className="space-y-4">
          {/* Goal Setting */}
          <BentoCard title="目标设置" icon={<Target className="h-5 w-5 text-indigo-500" />}>
            <div className="space-y-4">
              {/* Questions Target */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">每日题数目标</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTargetQuestions(Math.max(1, targetQuestions - 5))}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    disabled={!editing}
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <div className="flex-1 bg-slate-50 rounded-xl py-3 text-center">
                    <span className="text-2xl font-bold text-indigo-600">{targetQuestions}</span>
                    <span className="text-slate-500 ml-1">题</span>
                  </div>
                  <button
                    onClick={() => setTargetQuestions(targetQuestions + 5)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    disabled={!editing}
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Minutes Target */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">每日时长目标</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTargetMinutes(Math.max(10, targetMinutes - 10))}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    disabled={!editing}
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <div className="flex-1 bg-slate-50 rounded-xl py-3 text-center">
                    <span className="text-2xl font-bold text-violet-600">{targetMinutes}</span>
                    <span className="text-slate-500 ml-1">分钟</span>
                  </div>
                  <button
                    onClick={() => setTargetMinutes(targetMinutes + 10)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    disabled={!editing}
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {editing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveGoal}
                    className="flex-1 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-2 border border-indigo-200 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50"
                >
                  修改目标
                </button>
              )}
            </div>
          </BentoCard>

          {/* Rewards Preview */}
          <BentoCard title="完成奖励" icon={<Gift className="h-5 w-5 text-amber-500" />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white fill-current" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">+50 积分</p>
                  <p className="text-xs text-slate-500">完成每日目标基础奖励</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white fill-current" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">连胜加成</p>
                  <p className="text-xs text-slate-500">连续{currentStreak + 1}天额外+{(currentStreak + 1) * 10}积分</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">成就解锁</p>
                  <p className="text-xs text-slate-500">可能解锁"周周进步"徽章</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
