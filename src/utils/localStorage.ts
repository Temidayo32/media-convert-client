export const getSessionStorageItem = <T>(key: string): T | null => {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const setSessionStorageItem = (key: string, value: any): void => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSessionStorageItem = (key: string): void => {
  localStorage.removeItem(key);
};
