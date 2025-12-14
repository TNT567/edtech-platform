import type { TabProps } from './types';
import { Lock, Smartphone, Mail, ShieldCheck, LogOut, Smartphone as DeviceIcon } from 'lucide-react';

export default function TabAccount({ settings, onUpdate }: TabProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">登录与安全</h3>
                
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-slate-400" />
                            <div className="text-slate-700">修改密码</div>
                        </div>
                        <div className="text-sm text-slate-400">上次修改于 30 天前 &gt;</div>
                    </div>
                    
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-slate-700">绑定手机号</div>
                                <div className="text-sm text-slate-500">138****8888</div>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-600 font-medium">修改</button>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-slate-700">绑定邮箱</div>
                                <div className="text-sm text-slate-500">未绑定</div>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-600 font-medium">绑定</button>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-slate-700">两步验证 (2FA)</div>
                                <div className="text-sm text-slate-500">登录新设备时需要验证码</div>
                            </div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">登录设备管理</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <DeviceIcon className="w-5 h-5 text-indigo-600" />
                            <div>
                                <div className="font-medium text-indigo-900">Chrome on Windows (当前设备)</div>
                                <div className="text-xs text-indigo-700">刚刚活跃 · 北京</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl opacity-60">
                        <div className="flex items-center gap-3">
                            <DeviceIcon className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="font-medium text-slate-700">Safari on iPhone 14</div>
                                <div className="text-xs text-slate-500">3天前 · 上海</div>
                            </div>
                        </div>
                        <button className="text-xs text-red-500 hover:underline">移除</button>
                    </div>
                </div>
                <button className="w-full py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> 下线所有其他设备
                </button>
            </div>
        </div>
    );
}
