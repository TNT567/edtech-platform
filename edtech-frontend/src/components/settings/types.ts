import type { UserSettings } from '../../api/services/settings';

export interface TabProps {
    settings: UserSettings;
    onUpdate: (partial: Partial<UserSettings>) => void;
}
