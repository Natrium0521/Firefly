import configService from './configService';
import fs from 'fs';

class SettingService {
    private appSettings: unknown;
    private appSettingsPath: string;
    private initSettings = {
        Debug: false,
        CloseDirectly: true,
        ThemeColor: [115, 93, 141],
        LastAchievementUid: '000000000',
        LastGachaUid: '000000000',
    };

    constructor() {
        this.appSettingsPath = configService.getAppSettingsPath();
        if (!fs.existsSync(this.appSettingsPath)) {
            this.appSettings = this.initSettings;
        } else {
            this.appSettings = JSON.parse(fs.readFileSync(this.appSettingsPath, 'utf-8'));
        }
        Object.keys(this.initSettings).forEach((k) => {
            if (this.appSettings[k] === undefined) {
                this.appSettings[k] = this.initSettings[k];
            }
        });
        this.saveAppSettings();
    }

    private saveAppSettings() {
        fs.writeFileSync(this.appSettingsPath, JSON.stringify(this.appSettings, null, 4), 'utf-8');
    }

    public getAppSettingsSync() {
        return this.appSettings;
    }

    public async getAppSettings() {
        return this.appSettings;
    }

    public async setAppSettings(key: string, value: unknown) {
        if (this.appSettings[key] !== undefined && typeof this.appSettings[key] === typeof value) {
            this.appSettings[key] = value;
            this.saveAppSettings();
        }
        return this.appSettings;
    }
}

export default new SettingService();
