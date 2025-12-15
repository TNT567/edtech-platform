import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Brain, Zap, Settings, ChevronDown, 
  Target, TrendingUp, Award 
} from 'lucide-react';
import type { GenerateQuestionParams } from '../../api/services/knowledge';

interface PracticeConfigCardProps {
  onGenerate: (params: GenerateQuestionParams) => void;
  isLoading: boolean;
}

export function PracticeConfigCard({ onGenerate, isLoading }: PracticeConfigCardProps) {
  const [subject, setSubject] = useState('数学');
  const [difficulty, setDifficulty] = useState('Medium');
  const [knowledgePointId, setKnowledgePointId] = useState<number | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const subjects = [
    { value: '数学', label: '数学', icon: '📐' },
    { value: '物理', label: '物理', icon: '⚛️' },
    { value: '化学', label: '化学', icon: '🧪' },
  ];

  const difficulties = [
    { 
      value: 'Easy', 
      label: '基础巩固', 
      icon: <BookOpen className="w-4 h-4" />,
      color: 'bg-green-100 text-green-700 border-green-200',
      description: '基础概念和公式应用'
    },
    { 
      value: 'Medium', 
      label: '稳步提升', 
      icon: <Target className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description: '适中难度，理解+计算'
    },
    { 
      value: 'Hard', 
      label: '挑战进阶', 
      icon: <Award className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      description: '综合应用，深度思考'
    },
  ];

  const knowledgePoints = [
    { id: 101, name: '函数与导数' },
    { id: 102, name: '三角函数' },
    { id: 103, name: '数列' },
    { id: 104, name: '立体几何' },
    { id: 105, name: '解析几何' },
    { id: 106, name: '概率统计' },
  ];

  const handleGenerate = () => {
    const params: GenerateQuestionParams = {
      subject,
      difficulty,
      knowledgePointId: showAdvanced ? knowledgePointId : undefined,
    };
    onGenerate(params);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">🤖 AI智能出题</h3>
          <p className="text-sm text-slate-500">根据你的学习状态个性化生成题目</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 科目选择 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            科目选择
          </label>
          <div className="grid grid-cols-3 gap-2">
            {subjects.map((subj) => (
              <button
                key={subj.value}
                onClick={() => setSubject(subj.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  subject === subj.value
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="mr-2">{subj.icon}</span>
                {subj.label}
              </button>
            ))}
          </div>
        </div>

        {/* 难度选择 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            难度等级
          </label>
          <div className="space-y-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(diff.value)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  difficulty === diff.value
                    ? diff.color
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {diff.icon}
                  <div className="flex-1">
                    <div className="font-medium">{diff.label}</div>
                    <div className="text-xs opacity-75">{diff.description}</div>
                  </div>
                  {difficulty === diff.value && (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 高级选项 */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            高级选项
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-slate-50 rounded-lg"
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                指定知识点 (可选)
              </label>
              <select
                value={knowledgePointId || ''}
                onChange={(e) => setKnowledgePointId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">自动选择</option>
                {knowledgePoints.map((kp) => (
                  <option key={kp.id} value={kp.id}>
                    {kp.name}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full p-4 rounded-xl font-semibold transition-all ${
            isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              AI正在思考中...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              🎯 生成专属题目
            </div>
          )}
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">🤖 AI个性化说明</div>
            <div>题目将根据你的历史学习数据、掌握程度和常见错误自动调整，确保每道题都精准匹配你的当前水平。</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}