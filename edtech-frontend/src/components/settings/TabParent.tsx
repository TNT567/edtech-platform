import { useState } from 'react';
import type { TabProps } from './types';
import { Users, Shield, Clock, QrCode } from 'lucide-react';
import { bindParent } from '../../api/services/settings';

export default function TabParent({ settings }: TabProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleBind = async () => {
        if (!inviteCode) return;
        setLoading(true);
        setMessage('');
        try {
            await bindParent(inviteCode);
            setMessage('绑定申请已发送！等待家长确认。');
        } catch (e) {
            setMessage('绑定失败：无效的邀请码。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QrCode className="w-24 h-24 text-slate-800" />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-bold text-indigo-900">绑定家长账号</h3>
                    <p className="text-indigo-700 text-sm">
                        让家长扫描二维码，或在下方输入家长提供的 8 位邀请码。绑定后家长可查看学习进度并协助制定计划。
                    </p>
                    <div className="flex items-center gap-2 max-w-sm mx-auto md:mx-0">
                        <input 
                            type="text" 
                            placeholder="请输入家长邀请码" 
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                            onClick={handleBind}
                            disabled={loading || !inviteCode}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '...' : '绑定'}
                        </button>
                    </div>
                    {message && <p className={`text-sm ${message.includes('失败') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">权限管理</h3>
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-slate-400" />
                            <div className="text-slate-700">允许家长查看学习周报</div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">已授权</div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <div className="text-slate-700">每日最大练习时长限制</div>
                        </div>
                        <div className="text-sm text-slate-500">家长设定: 120 分钟</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
