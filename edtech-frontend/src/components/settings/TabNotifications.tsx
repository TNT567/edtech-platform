import type { TabProps } from './types';
import { Bell, Mail, Globe, Award, Calendar } from 'lucide-react';

export default function TabNotifications({ settings, onUpdate }: TabProps) {
    
    const ToggleItem = ({ label, desc, checked, onChange, icon: Icon }: any) => (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="font-medium text-slate-800">{label}</div>
                    <div className="text-sm text-slate-500">{desc}</div>
                </div>
            </div>
            <button 
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">推送设置</h3>
            
            <ToggleItem 
                label="每日学习提醒" 
                desc="每天固定时间提醒您开始学习" 
                checked={settings.notifyDaily} 
                onChange={(val: boolean) => onUpdate({ notifyDaily: val })}
                icon={Calendar}
            />
            
            {settings.notifyDaily && (
                <div className="ml-16 -mt-4 mb-4">
                    <input 
                        type="time" 
                        value={settings.notifyDailyTime || '20:00'}
                        onChange={(e) => onUpdate({ notifyDailyTime: e.target.value })}
                        className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            )}

            <ToggleItem 
                label="周报完成推送" 
                desc="每周日晚生成学习周报并通知" 
                checked={settings.notifyWeekly} 
                onChange={(val: boolean) => onUpdate({ notifyWeekly: val })}
                icon={Bell}
            />

            <ToggleItem 
                label="成就达成提醒" 
                desc="获得新勋章或等级提升时通知" 
                checked={settings.notifyAchievement} 
                onChange={(val: boolean) => onUpdate({ notifyAchievement: val })}
                icon={Award}
            />

            <h3 className="text-lg font-semibold text-slate-800 pt-4">通知渠道</h3>
            
            <ToggleItem 
                label="浏览器推送" 
                desc="在浏览器右下角显示通知" 
                checked={settings.notifyBrowser} 
                onChange={(val: boolean) => onUpdate({ notifyBrowser: val })}
                icon={Globe}
            />

            <ToggleItem 
                label="邮件推送" 
                desc="重要消息发送至绑定邮箱" 
                checked={settings.notifyEmail} 
                onChange={(val: boolean) => onUpdate({ notifyEmail: val })}
                icon={Mail}
            />
        </div>
    );
}
