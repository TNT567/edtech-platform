import { useEffect, useState } from 'react';
import { getRandomQuestion, submitExerciseResult, getAiExplanation, generatePracticeQuestion, type GenerateQuestionParams } from '../api/services/knowledge';
import { QuestionCard, type QuestionData } from '../components/chat/QuestionCard';
import { PracticeConfigCard } from '../components/practice/PracticeConfigCard';

export default function PracticePage() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [strategy, setStrategy] = useState<string>('');
  const [strategyCode, setStrategyCode] = useState<string>('');
  const [loading, setLoading] = useState(false); // Default false to show config first? Or true and load random?
  // Let's load random first as before, but allow override.
  
  const [currentParams, setCurrentParams] = useState<GenerateQuestionParams | null>(null);

  const loadQuestion = (params?: GenerateQuestionParams) => {
    setLoading(true);
    setQuestion(null);
    
    // Use provided params, or fall back to currentParams (for "Next Question"), or null for random
    const paramsToUse = params || currentParams;

    const promise = paramsToUse 
        ? generatePracticeQuestion(paramsToUse)
        : getRandomQuestion();

    promise.then(res => {
        setQuestion(res.data);
        setStrategy(res.strategy);
        setStrategyCode(res.strategyCode);
        setLoading(false);
        // Update current params only if new ones provided (sticky config)
        if (params) setCurrentParams(params);
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

    // 1. Submit Result
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

    // 2. If wrong, fetch AI explanation
    if (!isCorrect) {
        setQuestion(prev => prev ? { ...prev, analysis: "🔄 AI 正在生成智能解析，请稍候..." } : null);
        try {
            const explanation = await getAiExplanation(question.stem, selectedOption, question.correctAnswer);
            setQuestion(prev => prev ? { ...prev, analysis: explanation } : null);
        } catch (e) {
            setQuestion(prev => prev ? { ...prev, analysis: "❌ 解析生成失败，请重试。" } : null);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Smart Practice</h2>
        {strategy && (
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
            strategyCode === 'CORRECTION_DRILL' 
              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
              : strategyCode === 'MANUAL'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}>
            {strategyCode === 'CORRECTION_DRILL' ? '🔥 ' : strategyCode === 'MANUAL' ? '🛠️ ' : '🎯 '} 
            Current Strategy: {strategy}
          </span>
        )}
      </div>

      <PracticeConfigCard onGenerate={handleManualGenerate} isLoading={loading} />

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
                    onClick={() => { setCurrentParams(null); loadQuestion(); }}
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
  );
}

