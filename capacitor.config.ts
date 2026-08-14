import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Mobile shell for 2Click Voice MoM.
 *
 * - Bundled mode: loads dist/client (set CAPACITOR_SERVER_URL empty)
 * - Live mode (recommended): WebView loads the deployed site so /api works
 *   CAPACITOR_SERVER_URL=https://your-mom-host.example
 */
const liveUrl = (process.env.CAPACITOR_SERVER_URL || '').trim();

const config: CapacitorConfig = {
  appId: 'in.twoclick.mom',
  appName: '2Click MoM',
  webDir: 'dist/client',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0B4BD5',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0B4BD5',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B4BD5',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  server: liveUrl
    ? {
        url: liveUrl,
        cleartext: liveUrl.startsWith('http://'),
        allowNavigation: [liveUrl.replace(/^https?:\/\//, '').split('/')[0]],
      }
    : {
        androidScheme: 'https',
      },
};

export default config;
