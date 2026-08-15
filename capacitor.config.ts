import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Bundled WebView by default so the APK never depends on a broken Hostinger
 * deploy (white screen from raw /src/main.tsx).
 *
 * Optional live wrapper:
 *   CAPACITOR_SERVER_URL=https://your-working-mom-host npm run android:apk
 *
 * When bundled, set VITE_API_BASE_URL so /api calls reach the backend.
 */
const liveUrl = (process.env.CAPACITOR_SERVER_URL || '').trim();

const config: CapacitorConfig = {
  appId: 'in.twoclick.mom',
  appName: '2Click MoM',
  webDir: 'dist/client',
  android: {
    allowMixedContent: false,
    backgroundColor: '#FFFFFF',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0B4BD5',
      showSpinner: false,
      showDuration: 400,
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
