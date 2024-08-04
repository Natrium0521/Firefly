import { contextBridge, ipcRenderer } from 'electron/renderer';
import ipcFireflyAPI from './ipcFireflyAPI.json';

function createFireflyAPIBridge(): unknown {
    const bridge = {};

    Object.entries(ipcFireflyAPI).forEach(([serviceName, fnNames]) => {
        bridge[serviceName] = {};
        fnNames.forEach((fnName) => {
            bridge[serviceName][fnName] = (...args: unknown[]) => ipcRenderer.invoke(`${serviceName}.${fnName}`, ...args);
        });
    });

    bridge['sendMainWindowMsg'] = (msg: string) => ipcRenderer.send('sendMainWindowMsg', msg);

    bridge['loadJson'] = (fName: string) => ipcRenderer.invoke('loadJson', fName);

    return bridge;
}

contextBridge.exposeInMainWorld('fireflyAPI', createFireflyAPIBridge());
