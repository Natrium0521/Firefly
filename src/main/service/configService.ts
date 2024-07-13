import { app } from 'electron';
import path from 'path';
import fs from 'fs';

class ConfigService {
    private userDataPath: string;
    private appDataPath: string;
    private appSettingsPath: string;

    constructor() {
        this.userDataPath = app.getPath('userData');
        this.appDataPath = path.join(this.userDataPath, './data/');
        if (!fs.existsSync(this.appDataPath)) fs.mkdirSync(this.appDataPath);
        this.appSettingsPath = path.join(this.appDataPath, './settings.json');
    }

    public getUserDataPath() {
        return this.userDataPath;
    }

    public getAppDataPath() {
        return this.appDataPath;
    }

    public getAppSettingsPath() {
        return this.appSettingsPath;
    }

    public async getAppVersion() {
        return app.getVersion();
    }
}

export default new ConfigService();
