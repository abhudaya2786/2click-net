/** @type {import('@capacitor/cli').CapacitorConfig} */
const liveUrl = process.env.CAPACITOR_SERVER_URL;

const config = {
  appId: "com.buildecogroup.app",
  appName: "BuildEco Group",
  webDir: "build",
  bundledWebRuntime: false,
  ...(liveUrl
    ? {
        server: {
          url: liveUrl,
          cleartext: false,
          androidScheme: "https",
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#F8F9FB",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#C87941",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#F8F9FB",
  },
};

module.exports = config;
