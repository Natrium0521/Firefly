const fs = require('fs');

module.exports = {
    packagerConfig: {
        asar: true,
        icon: './src/renderer/assets/image/favicon.ico',
        name: 'Firefly',
        win32metadata: {
            ProductName: '流萤工具箱',
            CompanyName: 'Firefly',
            FileDescription: '流萤工具箱',
        },
        ignore: [/^\/src/, /^\/.vscode/, /(.eslintrc.js)|(.gitignore)|(.prettierrc)|(electron.vite.config.js)|(forge.config.js)|(tsconfig.*)/],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    hooks: {
        postPackage: async (forgeConfig, options) => {
            const localesPath = options.outputPaths + '/locales';
            const locales = new Set(['zh-CN']);
            for (const file of await fs.promises.readdir(localesPath)) {
                if (!locales.has(file.replace('.pak', ''))) {
                    await fs.promises.unlink(localesPath + '/' + file);
                }
            }
        }
    }
};
