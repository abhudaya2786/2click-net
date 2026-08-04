/**
 * Safe LocalStorage Utility Functions to prevent JSON parsing crashes or storage exceptions
 */

export const getSafeLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) {
      return defaultValue;
    }
    // If defaultValue is a string and item is not valid JSON string, try raw string or JSON parse
    if (typeof defaultValue === 'string') {
      try {
        const parsed = JSON.parse(item);
        return typeof parsed === 'string' ? (parsed as unknown as T) : (item as unknown as T);
      } catch {
        return item as unknown as T;
      }
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading key "${key}" from localStorage`, e);
    return defaultValue;
  }
};

export const setSafeLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    console.error(`Error writing key "${key}" to localStorage`, e);
    return false;
  }
};

export const removeSafeLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing key "${key}" from localStorage`, e);
    return false;
  }
};
