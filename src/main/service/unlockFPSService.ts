import { promisify } from 'util';
import Registry from 'winreg';

class UnlockFPSService {
    private gameRegs = {};
    private gameRegItemNames = {};
    private regPath = {
        cn: '\\SOFTWARE\\miHoYo\\崩坏：星穹铁道',
    };

    private getRegistry(server: string) {
        if (this.gameRegs[server] === undefined) {
            this.gameRegs[server] = new Registry({ hive: Registry.HKCU, key: this.regPath[server] });
            this.gameRegs[server].valuesAsync = promisify(this.gameRegs[server].values);
            this.gameRegs[server].setAsync = promisify(this.gameRegs[server].set);
            this.gameRegs[server].getAsync = promisify(this.gameRegs[server].get);
        }
        return this.gameRegs[server];
    }

    private async getRegistryItem(server: string) {
        const gameReg = this.getRegistry(server);
        if (this.gameRegItemNames[server] === undefined) {
            const gameRegItems = await gameReg.valuesAsync();
            let targetRegItem = undefined;
            gameRegItems.forEach((item: { name: string }) => {
                if (item.name.startsWith('GraphicsSettings_Model')) targetRegItem = item;
            });
            if (targetRegItem === undefined) return undefined;
            this.gameRegItemNames[server] = targetRegItem.name;
        }
        return await gameReg.getAsync(this.gameRegItemNames[server]);
    }

    public async isFPSUnlocked(server = 'cn') {
        try {
            const targetRegItem = await this.getRegistryItem(server);
            if (targetRegItem === undefined) return { msg: 'reg not found' };
            const hexPairs = targetRegItem.value.slice(0, -2).match(/.{2}/g);
            const buffer = Buffer.alloc(hexPairs.length);
            hexPairs.forEach((hexPair: string, index: number) => {
                buffer.writeUInt8(parseInt(hexPair, 16), index);
            });
            const json = JSON.parse(buffer.toString());
            if (json['FPS'] === undefined) {
                return { msg: 'no fps setting' };
            }
            if (json['FPS'] == 120) {
                return { msg: 'unlocked' };
            }
            return { msg: 'locked' };
        } catch (error) {
            return { msg: error.message };
        }
    }

    public async toggleFPS(server = 'cn') {
        try {
            const gameReg = this.getRegistry(server);
            const targetRegItem = await this.getRegistryItem(server);
            if (targetRegItem === undefined) return { msg: 'reg not found' };
            const hexPairs = targetRegItem.value.slice(0, -2).match(/.{2}/g);
            let buffer = Buffer.alloc(hexPairs.length);
            hexPairs.forEach((hexPair: string, index: number) => {
                buffer.writeUInt8(parseInt(hexPair, 16), index);
            });
            const json = JSON.parse(buffer.toString());
            if (json['FPS'] === undefined) {
                return { msg: 'no fps setting' };
            }
            if (json['FPS'] == 120) {
                json['FPS'] = 60;
            } else {
                json['FPS'] = 120;
            }
            buffer = Buffer.from(JSON.stringify(json));
            let newValue = '';
            buffer.forEach((v) => (newValue += `0${v.toString(16)}`.slice(-2).toUpperCase()));
            newValue += '00';
            await gameReg.setAsync(targetRegItem.name, Registry.REG_BINARY, newValue);
            return { msg: 'OK', fps: json['FPS'] };
        } catch (error) {
            return { msg: error.message };
        }
    }
}

export default new UnlockFPSService();
