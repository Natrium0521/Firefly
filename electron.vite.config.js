import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

const copyAssets = (src, dst) => {
    fs.mkdirSync(dst, { recursive: true });
    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcFilePath = path.join(src, file);
        const dstFilePath = path.join(dst, file);
        const stat = fs.statSync(srcFilePath);
        if (stat.isDirectory()) {
            copyAssets(srcFilePath, dstFilePath);
        } else {
            fs.copyFileSync(srcFilePath, dstFilePath);
        }
    }
};

const textMapFiles = ['TextMapCHS.json'];
const hashFiles = ['AchievementData.json', 'AchievementSeries.json', 'AchievementTextReplaceMap.json', 'AvatarConfig.json', 'EquipmentConfig.json', 'GachaBasicInfo.json'];
const lessenTextMap = (textMapFilePath, hashFilePath) => {
    const hashs = new Set();
    hashFiles.forEach((file) => {
        const hashRegex = /"Hash": ?"(\d+)"/gm;
        const hashFileContent = fs.readFileSync(path.join(hashFilePath, file), 'utf-8');
        let match;
        while ((match = hashRegex.exec(hashFileContent)) !== null) {
            if (match.index === hashRegex.lastIndex) {
                hashRegex.lastIndex++;
            }
            hashs.add(match[1]);
        }
    });
    textMapFiles.forEach((file) => {
        const oldTextMap = JSON.parse(fs.readFileSync(path.join(textMapFilePath, file), 'utf-8'));
        const newTextMap = {};
        hashs.forEach((hash) => {
            if (hash in oldTextMap) {
                newTextMap[hash] = oldTextMap[hash];
            } else {
                newTextMap[hash] = '';
            }
        });
        fs.writeFileSync(path.join(textMapFilePath, file), JSON.stringify(newTextMap, null, 4));
    });
};

const unformatJson = (jsonPath) => {
    const files = fs.readdirSync(jsonPath);
    for (const file of files) {
        const filePath = path.join(jsonPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            unformatJson(filePath);
        } else {
            fs.writeFileSync(filePath, JSON.stringify(JSON.parse(fs.readFileSync(filePath, 'utf-8'))));
        }
    }
};

export default {
    main: {
        build: {
            outDir: 'dist/main',
        },
        plugins: [copyAssets('src/static', 'dist/static'), lessenTextMap('dist/static/json', 'dist/static/json'), unformatJson('dist/static/json')],
    },
    preload: {
        build: {
            outDir: 'dist/preload',
        },
    },
    renderer: {
        build: {
            outDir: 'dist/renderer',
            assetsInlineLimit: 32768,
        },
        resolve: {
            alias: {
                '@renderer': path.resolve('src/renderer'),
            },
        },
        plugins: [vue()],
    },
};
