module.exports = {
    packagerConfig: {
        asar: true,
        appVersion: '0.3.0',
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
};
