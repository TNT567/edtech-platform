import { useState, useEffect } from 'react';
import { EditOutlined, EyeOutlined, SaveOutlined, RobotOutlined } from '@ant-design/icons';

interface PromptTemplate {
  id: number;
  name: string;
  type: 'question' | 'analysis' | 'explanation';
  template: string;
  description: string;
  updatedAt: string;
}

export default function PromptManagement() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [previewResult, setPreviewResult] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    // Mock data
    setTemplates([
      {
        id: 1,
        name: '数学选择题生成',
        type: 'question',
        template: `你是一位高中数学特级教师。请为以下学生生成一道数学选择题：

知识点：{{knowledgePoint}}
学生掌握水平：{{masteryLevel}}% (掌握度越低需要越简单的题目)
难度要求：{{difficulty}}

要求：
1. 题目难度要匹配学生水平
2. 选项设计要包含常见错误
3. 数学公式用LaTeX格式，如 $\\frac{a}{b}$, $\\sqrt{x}$
4. 输出严格的JSON格式

JSON格式：
{
  "content": "题干内容",
  "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
  "correctAnswer": "A",
  "analysis": "详细解析"
}`,
        description: '用于生成数学选择题的AI提示词模板',
        updatedAt: '2024-12-15 10:00'
      },
      {
        id: 2,
        name: '错题解析生成',
        type: 'analysis',
        template: `你是一位耐心的AI数学辅导老师。

学生做错了以下题目：
题目：{{questionContent}}
学生答案：{{wrongAnswer}}
正确答案：{{correctAnswer}}

请提供：
1. 分析学生可能的错误原因
2. 详细的解题步骤
3. 类似的简单例题帮助理解
4. 使用Markdown格式，数学公式用LaTeX`,
        description: '用于生成错题解析的AI提示词模板',
        updatedAt: '2024-12-14 15:30'
      },
      {
        id: 3,
        name: '知识点讲解',
        type: 'explanation',
        template: `你是一位经验丰富的高中数学老师。

请为学生讲解以下知识点：
知识点：{{knowledgePoint}}
学生当前掌握度：{{masteryLevel}}%

要求：
1. 从基础概念开始讲解
2. 提供2-3个典型例题
3. 总结关键公式和技巧
4. 使用通俗易懂的语言
5. 数学公式用LaTeX格式`,
        description: '用于生成知识点讲解内容的AI提示词模板',
        updatedAt: '2024-12-13 09:00'
      }
    ]);
    setLoading(false);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate({ ...template });
    setPreviewResult('');
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    setTemplates(ts => ts.map(t => t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toLocaleString() } : t));
    setEditingTemplate(null);
  };

  const handlePreview = async () => {
    if (!editingTemplate) return;
    setPreviewing(true);
    
    try {
      const response = await fetch('/api/admin/prompts/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          template: editingTemplate.template,
          variables: {
            knowledgePoint: '二次函数',
            masteryLevel: 65,
            difficulty: '中等',
            questionContent: '已知函数f(x)=x²+2x+1，求f(2)的值',
            wrongAnswer: 'B',
            correctAnswer: 'A'
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreviewResult(data.data);
          return;
        }
      }
    } catch (error) {
      console.error('Preview failed:', error);
    }
    
    // Mock preview
    setPreviewResult(`【AI生成预览】

根据模板生成的示例内容：

{
  "content": "已知二次函数 $f(x) = x^2 - 4x + 3$，则该函数的顶点坐标为：",
  "options": [
    "A. $(2, -1)$",
    "B. $(2, 1)$",
    "C. $(-2, -1)$",
    "D. $(-2, 1)$"
  ],
  "correctAnswer": "A",
  "analysis": "二次函数 $f(x) = x^2 - 4x + 3$ 可以配方为 $f(x) = (x-2)^2 - 1$，所以顶点坐标为 $(2, -1)$。"
}`);
    setPreviewing(false);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      question: { text: '出题', color: 'bg-blue-500/20 text-blue-400' },
      analysis: { text: '解析', color: 'bg-emerald-500/20 text-emerald-400' },
      explanation: { text: '讲解', color: 'bg-amber-500/20 text-amber-400' }
    };
    return labels[type] || { text: type, color: 'bg-slate-500/20 text-slate-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">AI Prompt 管理</h1>
        <div className="flex items-center text-slate-400">
          <RobotOutlined className="mr-2" />
          <span>管理AI生成内容的提示词模板</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">模板列表</h2>
          {loading ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">加载中...</div>
          ) : templates.map(template => (
            <div key={template.id} className={`bg-slate-800 rounded-xl p-4 border transition-all cursor-pointer ${editingTemplate?.id === template.id ? 'border-blue-500' : 'border-slate-700 hover:border-slate-600'}`} onClick={() => handleEdit(template)}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{template.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${getTypeLabel(template.type).color}`}>
                  {getTypeLabel(template.type).text}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{template.description}</p>
              <p className="text-slate-500 text-xs">更新于: {template.updatedAt}</p>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">模板编辑器</h2>
          {editingTemplate ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="模板名称"
                />
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="模板描述"
                />
              </div>
              <div className="p-4">
                <label className="block text-slate-300 text-sm mb-2">Prompt 模板</label>
                <textarea
                  value={editingTemplate.template}
                  onChange={e => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                  placeholder="输入Prompt模板..."
                />
                <p className="text-slate-500 text-xs mt-2">
                  可用变量: {'{{knowledgePoint}}'}, {'{{masteryLevel}}'}, {'{{difficulty}}'}, {'{{questionContent}}'}, {'{{wrongAnswer}}'}, {'{{correctAnswer}}'}
                </p>
              </div>
              <div className="p-4 border-t border-slate-700 flex justify-between">
                <button onClick={handlePreview} disabled={previewing} className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50">
                  <EyeOutlined className="mr-2" />{previewing ? '生成中...' : '预览效果'}
                </button>
                <button onClick={handleSave} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <SaveOutlined className="mr-2" />保存模板
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400 border border-slate-700">
              <EditOutlined className="text-4xl mb-4" />
              <p>点击左侧模板进行编辑</p>
            </div>
          )}

          {/* Preview Result */}
          {previewResult && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center">
                <RobotOutlined className="text-blue-400 mr-2" />
                <h3 className="text-white font-medium">AI 生成预览</h3>
              </div>
              <div className="p-4">
                <pre className="bg-slate-900 rounded-lg p-4 text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap">{previewResult}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
