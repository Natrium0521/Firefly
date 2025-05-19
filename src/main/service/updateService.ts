import { BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bsdiff = require('../static/node/bsdiff.node');

class UpdateService {
    private exePath: string;
    private downloadProgress: number;
    private downloadSpeed: number;
    private downloadState: undefined | 'downloading' | 'downloaded' | 'cancelled' | 'interrupted' | 'failed';
    private downloadItem: Electron.DownloadItem;
    private mainWindow: BrowserWindow;
    private lastTime: number;
    private lastBytes: number;

    constructor() {
        this.exePath = process.execPath;
    }

    public async doDownload(url: string) {
        this.mainWindow = this.mainWindow ?? BrowserWindow.getAllWindows()[0];
        if (this.downloadState === 'downloading' || this.downloadState === 'downloaded') return;
        this.mainWindow.webContents.session.once('will-download', (event, item) => {
            this.downloadItem = item;
            item.setSavePath(path.join(this.exePath, '../resources/update.' + url.split('.').pop()));
            this.lastTime = Date.now();
            this.lastBytes = 0;
            this.downloadSpeed = 0;
            item.on('updated', (event, state) => {
                if (state === 'progressing') {
                    this.downloadProgress = item.getReceivedBytes() / item.getTotalBytes();
                    if (Date.now() - this.lastTime > 100) {
                        this.downloadSpeed = ((item.getReceivedBytes() - this.lastBytes) / (Date.now() - this.lastTime)) * 1000;
                        this.lastTime = Date.now();
                        this.lastBytes = item.getReceivedBytes();
                    }
                }
            });
            item.once('done', (event, state) => {
                switch (state) {
                    case 'completed':
                        this.downloadState = 'downloaded';
                        break;
                    case 'interrupted':
                        this.downloadState = 'interrupted';
                        break;
                    case 'cancelled':
                        this.downloadState = 'cancelled';
                        break;
                    default:
                        this.downloadState = 'failed';
                        break;
                }
                this.downloadItem = undefined;
            });
        });
        this.downloadState = 'downloading';
        this.mainWindow.webContents.downloadURL(url);
    }

    public async cancelDownload() {
        if (this.downloadItem) {
            this.downloadItem.cancel();
            this.downloadState = 'cancelled';
        }
    }

    public async getDownloadInfo() {
        return { progress: this.downloadProgress, speed: this.downloadSpeed, state: this.downloadState };
    }

    public async doUpdate(hash: string) {
        process.noAsar = true;
        const originAsarPath = path.join(this.exePath, '../resources/app.asar');
        const patchPath = path.join(this.exePath, '../resources/update.patch');
        const updateAsarPath = path.join(this.exePath, '../resources/update.asar');
        if (fs.existsSync(patchPath)) {
            try {
                bsdiff.patchSync(originAsarPath, updateAsarPath, patchPath);
            } catch (e) {
                this.downloadState = 'failed';
                return 'patch failed';
            }
            fs.rmSync(patchPath);
        }
        if (!fs.existsSync(updateAsarPath)) {
            this.downloadState = 'failed';
            return 'no update file';
        }
        if (this.calcCRC32(updateAsarPath) !== hash.toUpperCase()) {
            this.downloadState = 'failed';
            return 'CRC32 verification failed';
        }
        const pid = process.pid;
        const psContent = `
            Write-Host "Killing Firefly.exe PID: ${pid}"
            Stop-Process -Id ${pid} -Force
            
            while(Get-Process -Id ${pid} -ErrorAction SilentlyContinue){
                Write-Host "Waiting for Firefly.exe to completely exit"
                Start-Sleep -Seconds 1
            }
            
            Write-Host "Replacing files"
            Remove-Item -Force resources\\app.asar
            Rename-Item resources\\update.asar app.asar
            
            Write-Host "Starting Firefly.exe"
            Start-Process Firefly.exe
            
            Write-Host "Cleaning up"
            Remove-Item $MyInvocation.MyCommand.Path -Force
        `;
        const psPath = path.join(this.exePath, '../update.ps1');
        fs.writeFileSync(psPath, psContent, 'utf-8');
        setTimeout(() => exec('powershell.exe -File ./update.ps1'));
        return 'updating';
    }

    private calcCRC32(filePath: string) {
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                if (c & 1) {
                    c = 0xedb88320 ^ (c >>> 1);
                } else {
                    c = c >>> 1;
                }
            }
            table[i] = c;
        }
        const fileContent = fs.readFileSync(filePath);
        let crc = 0xffffffff;
        for (let i = 0; i < fileContent.length; i++) {
            crc = (crc >>> 8) ^ table[(crc ^ fileContent[i]) & 0xff];
        }
        crc = (crc ^ 0xffffffff) >>> 0;
        return crc.toString(16).padStart(8, '0').toUpperCase();
    }
}

export default new UpdateService();
