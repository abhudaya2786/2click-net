import { useEffect } from 'react';

// Password Strength Validator
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए!' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'पासवर्ड में कम से कम 1 बड़ा अक्षर (Capital Letter) होना चाहिए!' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'पासवर्ड में कम से कम 1 छोटा अक्षर (Small Letter) होना चाहिए!' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'पासवर्ड में कम से कम 1 संख्या (Number) होनी चाहिए!' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'पासवर्ड में कम से कम 1 स्पेशल कैरेक्टर (!@#$) होना चाहिए!' };
  }
  return { isValid: true, message: 'मजबूत पासवर्ड है!' };
};

// Session Inactivity Logout Hook (Default: 15 minutes)
export const useSessionTimeout = (onTimeout: () => void, timeoutMinutes: number = 15) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onTimeout();
      }, timeoutMinutes * 60 * 1000);
    };

    // Listen to User Interactions
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start initial timer

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [onTimeout, timeoutMinutes]);
};
