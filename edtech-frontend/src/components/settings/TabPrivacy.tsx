import type { TabProps } from './types';
import { Eye, Download, Trash, Share } from 'lucide-react';

export default function TabPrivacy({ settings, onUpdate }: TabProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    学习数据可见性
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {[
                        { id: 'private', label: '仅自己可见', desc: '任何人都无法查看您的学习详情' },
                        { id: 'parent', label: '允许家长查看', desc: '绑定的家长账号可查看周报和雷达图' },
                        { id: 'teacher', label: '允许老师查看', desc: '加入班级后，老师可查看作业完成情况' },
                    ].map((opt) => (
                        <label key={opt.id} className="flex items-center p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0">
                            <input 
                                type="radio" 
                                name="visibility"
                                checked={settings.privacyVisibility === opt.id}
                                onChange={() => onUpdate({ privacyVisibility: opt.id as any })}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <div className="ml-3">
                                <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                                <div className="text-xs text-slate-500">{opt.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">数据管理</h3>
                
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Share className="w-5 h-5 text-slate-400" />
                        <div>
                            <div className="font-medium text-slate-800">匿名贡献数据</div>
                            <div className="text-sm text-slate-500">允许平台使用您的脱敏答题数据优化算法，换取积分奖励</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdate({ dataContribution: !settings.dataContribution })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.dataContribution ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.dataContribution ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> 导出学习数据 (CSV)
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 border border-red-200 rounded-xl hover:bg-red-50 text-red-600 transition-colors">
                        <Trash className="w-4 h-4" /> 申请删除账号
                    </button>
                </div>
            </div>
        </div>
    );
}
