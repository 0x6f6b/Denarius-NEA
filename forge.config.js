// forge.config.js
module.exports = {
  //...
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      // Path to a single image that will act as icon for the application
      name: "@electron-forge/maker-deb",
      config: {
        options: {},
      },
    },
    {
      // Path to the icon to use for the app in the DMG window
      name: "@electron-forge/maker-dmg",
      config: {
        icon: "/Users/jackmertens/NEA/Denarius/logo/icons/mac/icon.icns",
      },
    },
  ],
  // ...
};
