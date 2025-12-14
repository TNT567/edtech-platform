import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BentoCard } from '../components/ui/BentoCard';
import { 
  Trophy, Medal, Flame, Star, Crown, Target, Zap, 
  BookOpen, Timer, Moon, Sun, Lock
} from 'lucide-react';
import { getUserAchievements, type Achievement, type UserAchievementData } from '../api/services/gamification';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// Icon mapping
const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'zap': <Zap className="h-8 w-8" />,
    'flame': <Flame className="h-8 w-8" />,
    'book-open': <BookOpen className="h-8 w-8" />,
    'medal': <Medal className="h-8 w-8" />,
    'target': <Target className="h-8 w-8" />,
    'timer': <Timer className="h-8 w-8" />,
    'moon': <Moon className="h-8 w-8" />,
    'sun': <Sun className="h-8 w-8" />,
    'star': <Star className="h-8 w-8" />,
    'crown': <Crown className="h-8 w-8" />,
    'trophy': <Trophy className="h-8 w-8" />,
  };
  return icons[iconName] || <Trophy className="h-8 w-8" />;
};

// Rarity styles
const getRarityStyles = (rarity: string, unlocked: boolean) => {
  if (!unlocked) {
    return {
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      icon: 'text-slate-300',
      text: 'text-slate-400',
      glow: ''
    };
  }
  
  const styles: Record<string, { bg: string; border: string; icon: string; text: string; glow: string }> = {
    common: {
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
      border: 'border-slate-200',
      icon: 'text-slate-600',
      text: 'text-slate-600',
      glow: ''
    },
    rare: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-600',
      glow: 'shadow-blue-100'
    },
    epic: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-100',
      border: 'border-purple-200',
      icon: 'text-purple-500',
      text: 'text-purple-600',
      glow: 'shadow-lg shadow-purple-100'
    },
    legendary: {
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100',
      border: 'border-amber-300',
      icon: 'text-amber-500',
      text: 'text-amber-600',
      glow: 'shadow-xl shadow-amber-200 ring-2 ring-amber-200'
    }
  };
  return styles[rarity] || styles.common;
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const styles = getRarityStyles(achievement.rarity, achievement.unlocked);
  
  return (
    <motion.div
      variants={itemVariants}
      className={`relative p-5 rounded-2xl border ${styles.bg} ${styles.border} ${styles.glow} transition-all duration-300 ${
        achievement.unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
      }`}
      whileHover={achievement.unlocked ? { scale: 1.03, y: -2 } : {}}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      )}
      
      {/* Icon */}
      <div className={`mb-3 ${styles.icon}`}>
        {getIcon(achievement.icon)}
      </div>
      
      {/* Name & Description */}
      <h3 className={`font-bold ${styles.text}`}>{achievement.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{achievement.description}</p>
      
      {/* Points */}
      <div className="mt-3 flex items-center gap-1">
        <Star className={`h-3.5 w-3.5 ${achievement.unlocked ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
        <span className={`text-xs font-medium ${achievement.unlocked ? 'text-amber-600' : 'text-slate-400'}`}>
          +{achievement.pointsReward} 积分
        </span>
      </div>
      
      {/* Rarity badge */}
      <div className="absolute top-2 left-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          achievement.rarity === 'legendary' ? 'bg-amber-200 text-amber-700' :
          achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
          achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
          'bg-slate-200 text-slate-600'
        }`}>
          {achievement.rarity === 'legendary' ? '传说' :
           achievement.rarity === 'epic' ? '史诗' :
           achievement.rarity === 'rare' ? '稀有' : '普通'}
        </span>
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const [data, setData] = useState<UserAchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getUserAchievements(1);
        setData(result);
      } catch (e) {
        console.error("Failed to load achievements", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredAchievements = data?.achievements.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return a.category === filter;
  }) || [];

  const categories = ['all', 'unlocked', 'locked', 'streak', 'practice', 'mastery', 'accuracy'];

  return (
    <div className="p-2">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              成就殿堂
            </h1>
            <p className="text-slate-500 mt-1">收集徽章，展示你的学习成就！</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === cat 
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? '全部' :
                 cat === 'unlocked' ? '已解锁' :
                 cat === 'locked' ? '未解锁' :
                 cat === 'streak' ? '连胜' :
                 cat === 'practice' ? '练习' :
                 cat === 'mastery' ? '掌握' : '精准'}
              </button>
            ))}
          </div>

          {/* Achievement Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </motion.div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Overview */}
          <BentoCard title="成就进度" icon={<Trophy className="h-5 w-5 text-amber-500" />}>
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle 
                      cx="48" cy="48" r="40" fill="none" 
                      stroke="url(#gradient)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(data?.totalUnlocked || 0) / (data?.totalAchievements || 1) * 251.2} 251.2`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-800">{data?.totalUnlocked || 0}</span>
                    <span className="text-xs text-slate-500">/ {data?.totalAchievements || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Stats Cards */}
          <BentoCard title="我的记录" icon={<Medal className="h-5 w-5 text-indigo-500" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500 fill-current" />
                  <span className="text-sm text-slate-600">当前连胜</span>
                </div>
                <span className="font-bold text-orange-600">{data?.currentStreak || 0} 天</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-slate-600">最长连胜</span>
                </div>
                <span className="font-bold text-purple-600">{data?.longestStreak || 0} 天</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-indigo-500 fill-current" />
                  <span className="text-sm text-slate-600">总积分</span>
                </div>
                <span className="font-bold text-indigo-600">{data?.totalPoints || 0}</span>
              </div>
            </div>
          </BentoCard>

          {/* Mastery Medals */}
          <BentoCard title="掌握金牌" icon={<Medal className="h-5 w-5 text-amber-500" />}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Medal className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">函数与导数</p>
                  <p className="text-xs text-amber-600">92% 掌握度</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Medal className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">数列</p>
                  <p className="text-xs text-amber-600">88% 掌握度</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
