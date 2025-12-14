import { useEffect, useState } from 'react';
import { getRandomQuestion, submitExerciseResult, getAiExplanation } from '../api/services/knowledge';
import { QuestionCard, type QuestionData } from '../components/chat/QuestionCard';

export default function PracticePage() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuestion = () => {
    setLoading(true);
    setQuestion(null);
    getRandomQuestion().then(q => {
        setQuestion(q);
        setLoading(false);
    });
  };

  useEffect(() => {
    loadQuestion();
  }, []);

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

  if (loading && !question) return <div className="p-8">Loading Question...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Smart Practice</h2>
      {question && (
        <QuestionCard 
            question={question} 
            onSubmit={handleSubmit} 
        />
      )}
      <div className="flex justify-end">
        <button 
            onClick={loadQuestion}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
            Next Question
        </button>
      </div>
    </div>
  );
}
