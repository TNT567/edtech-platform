import type { TabProps } from './types';
import { Target, Brain, Zap, Clock, Moon } from 'lucide-react';

export default function TabLearning({ settings, onUpdate }: TabProps) {
    const weights = JSON.parse(settings.strategyWeights || '{}');

    const handleWeightChange = (key: string, val: number) => {
        const newWeights = { ...weights, [key]: val };
        onUpdate({ strategyWeights: JSON.stringify(newWeights) });
    };

    return (
        <div className="space-y-8">
            {/* Section 1: Goals */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" />
                    每日目标
                </h3>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">每日练习题目数</label>
                        <span className="text-indigo-600 font-bold">{settings.dailyGoal} 题</span>
                    </div>
                    <input 
                        type="range" min="10" max="100" step="5"
                        value={settings.dailyGoal}
                        onChange={(e) => onUpdate({ dailyGoal: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>10题 (轻松)</span>
                        <span>100题 (冲刺)</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">题目难度偏好</label>
                        <span className="text-indigo-600 font-bold">
                            {settings.difficultyPreference < 30 ? '偏简单' : settings.difficultyPreference > 70 ? '挑战' : '平衡'}
                        </span>
                    </div>
                    <input 
                        type="range" min="0" max="100" step="10"
                        value={settings.difficultyPreference}
                        onChange={(e) => onUpdate({ difficultyPreference: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>

            {/* Section 2: Strategy Weights */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-500" />
                    出题策略权重
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'mistake', label: '高频错题重练', color: 'bg-red-500' },
                        { key: 'weakness', label: '薄弱点针对', color: 'bg-orange-500' },
                        { key: 'review', label: '艾宾浩斯复习', color: 'bg-blue-500' },
                        { key: 'advance', label: '进阶拓展', color: 'bg-green-500' }
                    ].map(item => (
                        <div key={item.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">{item.label}</label>
                                <span className="text-sm font-bold text-slate-600">{weights[item.key] || 0}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" step="5"
                                value={weights[item.key] || 0}
                                onChange={(e) => handleWeightChange(item.key, Number(e.target.value))}
                                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-${item.color.replace('bg-', '')}`}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-400">* 建议总和调整为 100% 以获得最佳体验</p>
            </div>

            {/* Section 3: Modes */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    练习模式
                </h3>
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div>
                        <div className="font-medium text-slate-800">纠错专项模式</div>
                        <div className="text-sm text-slate-500">答错后立即插入相似题进行强化</div>
                    </div>
                    <button 
                        onClick={() => onUpdate({ correctionMode: !settings.correctionMode })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.correctionMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.correctionMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <div>
                            <div className="font-medium text-slate-800">练习时长提醒</div>
                            <div className="text-sm text-slate-500">单次练习超过 45 分钟提醒休息</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdate({ durationReminder: !settings.durationReminder })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.durationReminder ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.durationReminder ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-slate-400" />
                        <div>
                            <div className="font-medium text-slate-800">晚间自动暂停</div>
                            <div className="text-sm text-slate-500">22:00 - 07:00 期间不发送提醒</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdate({ nightPause: !settings.nightPause })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.nightPause ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.nightPause ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
