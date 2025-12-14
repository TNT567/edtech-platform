import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { QuestionCard, QuestionData } from '../components/chat/QuestionCard';

// Message Types
type MessageType = 'text' | 'question';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  content?: string;
  questionData?: QuestionData;
}

// Mock Data
const MOCK_QUESTION: QuestionData = {
  id: 101,
  stem: "已知函数 $f(x) = x^2 - 2x + 3$，求 $f(x)$ 在区间 $[0, 3]$ 上的最大值。",
  options: [
    "A. 2",
    "B. 3",
    "C. 6",
    "D. 8"
  ],
  correctAnswer: "C",
  analysis: "解析：\n1. 配方得 $f(x) = (x-1)^2 + 2$，对称轴为 $x=1$。\n2. 开口向上，离对称轴越远函数值越大。\n3. 区间 $[0, 3]$ 中，端点 $x=3$ 离对称轴 $x=1$ 距离为 2，端点 $x=0$ 距离为 1。\n4. 故 $f(3) = 3^2 - 6 + 3 = 6$ 为最大值。\n\n选 C。"
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      type: 'text', 
      content: '你好！我是你的 AI 学习助手。我们可以开始复习了吗？你可以说“来一道函数题”。' 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Simulate AI Response (Mock)
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'question',
        questionData: MOCK_QUESTION
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleQuestionSubmit = (isCorrect: boolean) => {
    // 3. AI Feedback after question submission
    setTimeout(() => {
      const feedbackMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        type: 'text',
        content: isCorrect 
          ? "太棒了！回答正确 🎉。你的函数知识掌握度已提升。要不要挑战更难的？" 
          : "没关系，这道题确实有陷阱。请仔细阅读下方的解析，我们再试一次。"
      };
      setMessages(prev => [...prev, feedbackMsg]);
    }, 800);
  };

  return (
    <div className="relative flex h-full flex-col bg-white">
      
      {/* 1. Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white/80 px-8 py-4 backdrop-blur-md sticky top-0 z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">AI 智能辅导</h2>
          <p className="text-xs font-medium text-slate-400">Online • 知识追踪中</p>
        </div>
      </div>

      {/* 2. Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 pb-32 space-y-8 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
              msg.role === 'assistant' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {msg.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.type === 'question' ? 'w-full max-w-2xl' : ''}`}>
              {msg.type === 'text' ? (
                <div className={`rounded-3xl px-6 py-4 text-base leading-7 shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-50 text-slate-700 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200'
                }`}>
                  {msg.content}
                </div>
              ) : (
                msg.questionData && (
                  <QuestionCard 
                    question={msg.questionData} 
                    onSubmit={handleQuestionSubmit}
                  />
                )
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area (Floating) */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-center">
        <div className="relative w-full max-w-3xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你想复习的知识点..."
            className="w-full rounded-full border-0 bg-white py-4 pl-8 pr-16 text-slate-700 shadow-2xl shadow-indigo-100 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
