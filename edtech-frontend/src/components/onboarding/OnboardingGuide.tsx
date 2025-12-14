import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Target, Trophy, BarChart3, Sparkles, ChevronRight, ChevronLeft, X
} from 'lucide-react';

interface OnboardingGuideProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Rocket,
    title: '欢迎来到 EdTech AI！',
    description: '这是一个由 AI 驱动的智能学习平台，帮助你高效学习、精准提升。',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Target,
    title: '个性化学习路径',
    description: 'BKT 知识追踪算法会分析你的掌握程度，为你推荐最适合的练习题目。',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Trophy,
    title: '游戏化激励',
    description: '完成每日目标、收集成就徽章、登上排行榜，让学习充满乐趣！',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: '成长可视化',
    description: '知识雷达图、成绩预测、学习报告，让进步清晰可见。',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: '开始你的学习之旅！',
    description: '现在，让我们开始第一道练习题，体验 AI 智能推荐的魅力！',
    color: 'from-violet-500 to-purple-500',
  },
];

export default function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
        >
          {/* Skip Button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>

          {/* Icon Section */}
          <div className={`bg-gradient-to-r ${step.color} p-12 flex justify-center`}>
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center"
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
                {step.title}
              </h2>
              <p className="text-slate-600 text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 my-8">
              {STEPS.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep 
                      ? 'w-8 bg-indigo-500' 
                      : 'w-2 bg-slate-200'
                  }`}
                  animate={{ 
                    scale: idx === currentStep ? 1 : 0.8,
                    opacity: idx === currentStep ? 1 : 0.5
                  }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  上一步
                </button>
              )}
              <motion.button
                onClick={handleNext}
                className={`flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${step.color} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep === STEPS.length - 1 ? '开始学习' : '下一步'}
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      // Delay showing to allow initial render
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showOnboarding,
    completeOnboarding: () => setShowOnboarding(false),
  };
}
