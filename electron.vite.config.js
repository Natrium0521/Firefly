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

export default {
    main: {
        build: {
            outDir: 'dist/main',
        },
        plugins: [copyAssets('src/static', 'dist/static')],
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
