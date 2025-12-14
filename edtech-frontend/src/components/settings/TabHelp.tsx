import type { TabProps } from './types';
import { CirclePlay, MessageSquare, CircleHelp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function TabHelp({ settings }: TabProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { id: 1, q: "如何提高智能推荐的准确度？", a: "建议您多进行专项练习，并及时在错题本中标记掌握情况。系统会根据您的做题数据自动调整推荐算法。" },
        { id: 2, q: "家长账号有什么权限？", a: "绑定家长账号后，家长可以查看您的学习周报、雷达图以及每日练习时长，但无法查看具体的题目内容和隐私信息。" },
        { id: 3, q: "会员订阅可以退款吗？", a: "订阅后 7 天内如果不满意，可以联系客服申请全额退款。" },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors text-left">
                    <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                        <CirclePlay className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-indigo-900">新手引导</div>
                        <div className="text-sm text-indigo-700">重新播放功能介绍动画</div>
                    </div>
                </button>
                <button className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors text-left">
                    <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-emerald-900">联系客服</div>
                        <div className="text-sm text-emerald-700">在线咨询 / 微信客服</div>
                    </div>
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">常见问题</h3>
                <div className="space-y-2">
                    {faqs.map(faq => (
                        <div key={faq.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                            <button 
                                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                            >
                                <span className="font-medium text-slate-800">{faq.q}</span>
                                {openFaq === faq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {openFaq === faq.id && (
                                <div className="p-4 pt-0 text-slate-600 text-sm bg-slate-50 border-t border-slate-100">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">意见反馈</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                    <textarea 
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="请描述您遇到的问题或建议..."
                    ></textarea>
                    <div className="flex justify-end">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                            提交反馈
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
