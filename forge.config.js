module.exports = {
  packagerConfig: {
    asar: true,
    appVersion: '0.2.2',
    icon: './src/img/favicon.ico',
    name: 'Firefly',
    win32metadata: {
      ProductName: '流萤工具箱',
      CompanyName: 'Firefly',
      FileDescription: '流萤工具箱'
    }
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
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
