import { useEffect, useState } from 'react';
import { getRandomQuestion, submitExerciseResult, getAiExplanation, generatePracticeQuestion, type GenerateQuestionParams } from '../api/services/knowledge';
import { QuestionCard, type QuestionData } from '../components/chat/QuestionCard';
import { PracticeConfigCard } from '../components/practice/PracticeConfigCard';
import { AnimatePresence, motion } from 'framer-motion';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import confetti from 'canvas-confetti';

interface AudioContextWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export default function PracticePage() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [strategy, setStrategy] = useState<string>('');
  const [strategyCode, setStrategyCode] = useState<string>('');
  const [loading, setLoading] = useState(false); // Default false to show config first? Or true and load random?
  // Let's load random first as before, but allow override.
  
  const [currentParams, setCurrentParams] = useState<GenerateQuestionParams | null>(null);
  const [streak, setStreak] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadQuestion = (params?: GenerateQuestionParams, retryCount = 0) => {
    setLoading(true);
    setQuestion(null);
    
    // Use provided params, or fall back to currentParams (for "Next Question"), or null for random
    const paramsToUse = params || currentParams;

    const promise = paramsToUse 
        ? generatePracticeQuestion(paramsToUse)
        : getRandomQuestion();

    promise.then(res => {
        // 检查是否是错误响应
        if (res.strategyCode === 'ERROR' && retryCount < 2) {
            console.log(`🔄 AI出题失败，第${retryCount + 1}次重试...`);
            setTimeout(() => {
                loadQuestion(params, retryCount + 1);
            }, 1000 * (retryCount + 1)); // 递增延迟重试
            return;
        }
        
        setQuestion(res.data);
        setStrategy(res.strategy);
        setStrategyCode(res.strategyCode);
        setLoading(false);
        
        // Update current params only if new ones provided (sticky config)
        if (params) setCurrentParams(params);
        
        // 如果是AI生成的题目，显示成功提示
        if (res.strategyCode === 'AI_GENERATED') {
            console.log('🎉 AI动态出题成功！题目已根据你的学习状态个性化生成');
        }
    }).catch(error => {
        console.error('❌ 题目加载失败:', error);
        setLoading(false);
        
        // 显示错误状态的题目
        setQuestion({
            id: Date.now(),
            stem: "⚠️ 网络连接异常，请检查网络后重试",
            options: ["A. 重新加载", "B. 切换网络", "C. 稍后重试", "D. 联系客服"],
            correctAnswer: "A",
            analysis: "请检查网络连接状态，或稍后重试。"
        });
        setStrategy('网络异常');
        setStrategyCode('NETWORK_ERROR');
    });
  };

  useEffect(() => {
    loadQuestion(); // Load initial random question
  }, []);

  const handleManualGenerate = (params: GenerateQuestionParams) => {
      loadQuestion(params);
  };


  const handleSubmit = async (isCorrect: boolean, selectedOption: string) => {
    if (!question) return;

    try {
        await submitExerciseResult({
            studentId: 1, // Hardcoded for demo
            questionId: question.id,
            isCorrect,
            duration: 30 // Mock duration
        });
    } catch (e) {
        console.error("Submit failed", e);
    }

    setStreak(prev => {
      const next = isCorrect ? prev + 1 : 0;
      if (isCorrect && next >= 5) {
        triggerCelebrate();
        setShowCelebrate(true);
      }
      if (!isCorrect) {
        setShowCelebrate(false);
      }
      return next;
    });

    if (!isCorrect) {
        setQuestion(prev => prev ? { ...prev, analysis: "🔄 AI 正在生成智能解析，请稍候..." } : null);
        try {
            const explanation = await getAiExplanation(question.stem, selectedOption, question.correctAnswer);
            setQuestion(prev => prev ? { ...prev, analysis: explanation } : null);
            setExplanation(explanation);
            setShowExplanation(true);
        } catch {
            const fallback = "❌ 解析生成失败，请重试。";
            setQuestion(prev => prev ? { ...prev, analysis: fallback } : null);
            setExplanation(fallback);
            setShowExplanation(true);
        }
    }
  };

  if (loading && !question) return (
    <div className="max-w-3xl mx-auto space-y-6 p-8">
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
        </div>
        <div className="text-center text-slate-500">AI is generating your personalized question...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Smart Practice</h2>
        <div className="flex items-center gap-3">
          {strategy && (
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                strategyCode === 'CORRECTION_DRILL'
                  ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                  : strategyCode === 'MANUAL'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {strategyCode === 'CORRECTION_DRILL' ? '🔥 ' : strategyCode === 'MANUAL' ? '🛠️ ' : '🎯 '}
              Current Strategy: {strategy}
            </span>
          )}
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600 shadow-sm">
              <span>⚡ Combo</span>
              <span>x{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px,1fr] items-start">
        <div className="sticky top-24 self-start">
          <PracticeConfigCard onGenerate={handleManualGenerate} isLoading={loading} />
        </div>

        <div className="space-y-6">
          {question && (
            <QuestionCard
              question={question}
              onSubmit={handleSubmit}
            />
          )}

          {question && (
            <div className="flex justify-end gap-4">
              {currentParams && (
                <button
                  onClick={() => {
                    setCurrentParams(null);
                    loadQuestion();
                  }}
                  className="px-6 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Switch to Auto Mode
                </button>
              )}
              <button
                onClick={() => loadQuestion()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {currentParams ? 'Next Targeted Question' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showCelebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-3xl bg-white/80 px-12 py-8 shadow-2xl backdrop-blur"
            >
              <div className="space-y-3 text-center">
                <div className="text-4xl">🎉</div>
                <div className="text-2xl font-bold text-indigo-600">Combo x{streak}</div>
                <div className="text-sm text-slate-600">保持状态，再接再厉！</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExplanation && explanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">AI 详细解析</h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  关闭
                </button>
              </div>
              <div className="prose max-w-none text-slate-800">
                <Latex>{explanation}</Latex>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function triggerCelebrate() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
  });
  try {
    playBeep();
  } catch {
    return;
  }
}

function playBeep() {
  const win = window as AudioContextWindow;
  const AudioContextCtor = win.AudioContext || win.webkitAudioContext;
  if (!AudioContextCtor) return;
  const ctx = new AudioContextCtor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 880;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.25);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
