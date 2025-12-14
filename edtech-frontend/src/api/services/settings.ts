import request from '../request';

export interface UserSettings {
    userId: number;
    avatarUrl?: string;
    nickname?: string;
    realName?: string;
    grade?: string;
    subject?: string;
    goal?: string;

    dailyGoal: number;
    difficultyPreference: number;
    strategyWeights: string; // JSON
    correctionMode: boolean;
    durationReminder: boolean;
    durationReminderMinutes?: number;
    nightPause: boolean;
    nightPauseStart?: string;
    nightPauseEnd?: string;

    notifyDaily: boolean;
    notifyDailyTime?: string;
    notifyWeekly: boolean;
    notifyAchievement: boolean;
    notifyBrowser: boolean;
    notifyEmail: boolean;

    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    animationsEnabled: boolean;
    soundEnabled: boolean;

    privacyVisibility: 'private' | 'parent' | 'teacher';
    dataContribution: boolean;
}

export const getSettings = async (): Promise<UserSettings> => {
    const res = await request.get<UserSettings>('/settings');
    return res.data;
};

export const updateSettings = async (settings: UserSettings): Promise<UserSettings> => {
    const res = await request.put<UserSettings>('/settings', settings);
    return res.data;
};

export const bindParent = async (code: string): Promise<void> => {
    await request.post('/settings/bind-parent', { code });
};
