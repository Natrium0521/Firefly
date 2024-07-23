import configService from './configService';
import settingService from './settingService';
import unlockFPSService from './unlockFPSService';
import achievementService from './achievementService';
import gachaService from './gachaService';
import updateService from './updateService';

export default {
    config: configService,
    setting: settingService,
    unlockfps: unlockFPSService,
    achievement: achievementService,
    gacha: gachaService,
    update: updateService,
};
