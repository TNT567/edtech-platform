import type { TabProps } from './types';
import { Crown, Check, Clock } from 'lucide-react';

export default function TabSubscription({ settings }: TabProps) {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Crown className="w-64 h-64 transform rotate-12" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">当前套餐</span>
                        <span className="flex items-center gap-1 text-yellow-300 font-bold">
                            <Crown className="w-4 h-4" /> Pro 会员
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">EdTech Plus</h2>
                    <p className="text-indigo-100 mb-6 max-w-md">
                        您正在享受高级 AI 解析、无限制刷题、专属名师辅导等特权。
                    </p>
                    <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-4 py-2 rounded-lg backdrop-blur-sm">
                        <Clock className="w-4 h-4" />
                        有效期至：2026年12月31日 (剩余 365 天)
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">订阅管理</h3>
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-800">自动续费</div>
                            <div className="text-sm text-slate-500">下次扣款日：2026-12-31</div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:underline">管理</button>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-800">支付方式</div>
                            <div className="text-sm text-slate-500">微信支付 (****)</div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:underline">修改</button>
                    </div>
                </div>
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                    立即续费 (限时 8 折)
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">订单记录</h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">订单号</th>
                                <th className="px-4 py-3 font-medium">项目</th>
                                <th className="px-4 py-3 font-medium">日期</th>
                                <th className="px-4 py-3 font-medium text-right">金额</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="px-4 py-3 text-slate-600 font-mono">ORD-20251210-01</td>
                                <td className="px-4 py-3 text-slate-800">年度会员续费</td>
                                <td className="px-4 py-3 text-slate-500">2025-12-10</td>
                                <td className="px-4 py-3 text-right font-medium">¥ 199.00</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-slate-600 font-mono">ORD-20241210-01</td>
                                <td className="px-4 py-3 text-slate-800">年度会员订阅</td>
                                <td className="px-4 py-3 text-slate-500">2024-12-10</td>
                                <td className="px-4 py-3 text-right font-medium">¥ 299.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
