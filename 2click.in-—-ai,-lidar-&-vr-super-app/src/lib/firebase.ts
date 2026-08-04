import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics, logEvent, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

let analyticsInstance: Analytics | null = null;

/**
 * Get or initialize Firebase Analytics instance safely
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;
  try {
    const supported = await isSupported();
    if (supported && firebaseConfig.measurementId) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch (e) {
    // Analytics may not be supported in some environments/iframes
  }
  return null;
}

/**
 * Log event to Firebase Analytics and optionally Firestore for persistent trend audit
 */
export async function logAnalyticsEvent(eventName: string, eventParams: Record<string, any> = {}) {
  const payload = {
    event_name: eventName,
    timestamp: new Date().toISOString(),
    user_id: auth.currentUser?.uid || 'anonymous',
    user_email: auth.currentUser?.email || 'anonymous',
    ...eventParams
  };

  console.log(`📊 [Firebase Analytics]: ${eventName}`, payload);

  // Send to Firebase Analytics SDK
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    // Graceful fallback
  }

  // Also log to Firestore 'analytics_events' collection for long-term trend analysis if db is reachable
  try {
    if (isFirebaseConfigured && auth.currentUser) {
      await addDoc(collection(db, 'analytics_events'), {
        eventName,
        params: eventParams,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || null,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    // Silently ignore if firestore permissions or offline
  }
}

// Helper for testing connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('offline') ||
        error.message.includes('permission-denied') ||
        error.message.includes('unauthenticated') ||
        error.message.includes('Missing or insufficient permissions')
      ) {
        // Cleanly handle unauthenticated/offline state without logging warnings on startup
        return;
      }
      console.warn('Firebase Firestore note:', error.message);
    }
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged
};

