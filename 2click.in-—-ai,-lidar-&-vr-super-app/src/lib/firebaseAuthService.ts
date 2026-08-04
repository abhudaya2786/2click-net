import {
  auth,
  db,
  googleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged
} from './firebase';
import { sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { User, UserRole } from '../types';

export const SUPER_ADMIN_EMAILS = ['shrinet.info@gmail.com', 'superadmin@2click.in', 'admin@2click.in'];

export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown authentication error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    return 'Invalid credentials. Please check your email and password, or create a new account.';
  }
  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again or use password reset.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please switch to Sign In.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in popup was closed before completing.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }
  return message || 'Authentication failed. Please try again.';
}

/**
 * Fetch or sync user profile document in Firestore
 */
export async function syncUserProfileInFirestore(fbUser: FirebaseUser, defaultProps?: Partial<User>): Promise<User> {
  const userRef = doc(db, 'users', fbUser.uid);
  const isSuperAdminEmail = fbUser.email && SUPER_ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedRole = isSuperAdminEmail ? 'SuperAdmin' : (data.role || defaultProps?.role || 'Client');
      
      const userObj: User = {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || '2click User',
        email: fbUser.email || data.email || 'user@2click.in',
        phone: data.phone || fbUser.phoneNumber || '+91 9876543210',
        role: updatedRole as UserRole,
        state: data.state || defaultProps?.state || 'Uttar Pradesh',
        mandal: data.mandal || defaultProps?.mandal || 'Gorakhpur Mandal',
        district: data.district || defaultProps?.district || 'Gorakhpur',
        city: data.city || defaultProps?.city || 'Gorakhpur',
        companyName: data.companyName || defaultProps?.companyName || `${updatedRole} Enterprise`,
        status: data.status || 'Active',
        isKycVerified: data.isKycVerified ?? true,
        employeeCode: data.employeeCode || (updatedRole.includes('Employee') || updatedRole.includes('Admin') ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
        permissions: data.permissions
      };

      // If user is super admin by email but Firestore says otherwise, update Firestore
      if (isSuperAdminEmail && data.role !== 'SuperAdmin') {
        await updateDoc(userRef, { role: 'SuperAdmin' });
      }

      return userObj;
    } else {
      // Create new profile document in Firestore
      const initialRole: UserRole = isSuperAdminEmail ? 'SuperAdmin' : (defaultProps?.role || 'Client');
      const newUserObj: User = {
        id: fbUser.uid,
        name: defaultProps?.name || fbUser.displayName || fbUser.email?.split('@')[0] || '2click User',
        email: fbUser.email || 'user@2click.in',
        phone: defaultProps?.phone || fbUser.phoneNumber || '+91 9876543210',
        role: initialRole,
        state: defaultProps?.state || 'Uttar Pradesh',
        mandal: defaultProps?.mandal || 'Gorakhpur Mandal',
        district: defaultProps?.district || 'Gorakhpur',
        city: defaultProps?.district || 'Gorakhpur',
        companyName: defaultProps?.companyName || `${initialRole} Enterprise`,
        status: 'Active',
        isKycVerified: true,
        employeeCode: initialRole.includes('Employee') || initialRole.includes('Admin') ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined
      };

      await setDoc(userRef, {
        uid: fbUser.uid,
        email: newUserObj.email,
        name: newUserObj.name,
        phone: newUserObj.phone,
        role: newUserObj.role,
        state: newUserObj.state,
        mandal: newUserObj.mandal,
        district: newUserObj.district,
        city: newUserObj.city,
        companyName: newUserObj.companyName,
        status: newUserObj.status,
        isKycVerified: newUserObj.isKycVerified,
        employeeCode: newUserObj.employeeCode,
        createdAt: new Date().toISOString()
      });

      return newUserObj;
    }
  } catch (err) {
    console.warn('Firestore sync note:', err);
    // Fallback if Firestore read fails
    const initialRole: UserRole = isSuperAdminEmail ? 'SuperAdmin' : (defaultProps?.role || 'Client');
    return {
      id: fbUser.uid,
      name: defaultProps?.name || fbUser.displayName || fbUser.email?.split('@')[0] || '2click User',
      email: fbUser.email || 'user@2click.in',
      phone: defaultProps?.phone || '+91 9876543210',
      role: initialRole,
      state: defaultProps?.state || 'Uttar Pradesh',
      mandal: defaultProps?.mandal || 'Gorakhpur Mandal',
      district: defaultProps?.district || 'Gorakhpur',
      city: defaultProps?.district || 'Gorakhpur',
      companyName: defaultProps?.companyName || `${initialRole} Enterprise`,
      status: 'Active',
      isKycVerified: true
    };
  }
}

/**
 * Sign in with Email & Password
 */
export async function loginWithEmailPassword(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return syncUserProfileInFirestore(cred.user);
}

/**
 * Register with Email & Password
 */
export async function registerWithEmailPassword(email: string, pass: string, profileProps: Partial<User>): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return syncUserProfileInFirestore(cred.user, profileProps);
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGooglePopup(): Promise<User> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return syncUserProfileInFirestore(cred.user);
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Update User Status or Role in Firestore (Super Admin Function)
 */
export async function updateUserInFirestore(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (err) {
    console.warn('Could not update Firestore user document:', err);
  }
}

/**
 * Real-time listener for Super Admin to watch all registered users from Firestore
 */
export function subscribeToAllUsersInFirestore(onUsersUpdated: (users: User[]) => void): () => void {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || '2click User',
          email: d.email || '',
          phone: d.phone || '+91 9876543210',
          role: (d.role || 'Client') as UserRole,
          state: d.state || 'Uttar Pradesh',
          mandal: d.mandal || 'Gorakhpur Mandal',
          district: d.district || 'Gorakhpur',
          city: d.city || 'Gorakhpur',
          companyName: d.companyName || 'Enterprise',
          status: d.status || 'Active',
          isKycVerified: d.isKycVerified ?? true,
          employeeCode: d.employeeCode,
          permissions: d.permissions
        });
      });
      if (list.length > 0) {
        onUsersUpdated(list);
      }
    }, (err) => {
      console.warn('Users snapshot note:', err.message);
    });
  } catch (err) {
    console.warn('Subscribe to users error:', err);
    return () => {};
  }
}
