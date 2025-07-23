import localforage from "localforage";

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

// Configure localforage only in browser
if (isBrowser) {
  localforage.config({
    name: "QuantHive",
    storeName: "redux_persist",
    description: "Redux persist storage for QuantHive application",
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE,
    ],
  });
}

// Fallback storage for SSR/non-browser environments
const fallbackStorage = {
  getItem: (key: string): Promise<string | null> => Promise.resolve(null),
  setItem: (key: string, value: string): Promise<void> => Promise.resolve(),
  removeItem: (key: string): Promise<void> => Promise.resolve(),
  getAllKeys: (): Promise<string[]> => Promise.resolve([]),
  clear: (): Promise<void> => Promise.resolve(),
};

// Custom storage adapter for Redux Persist using localForage
const localForageStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isBrowser) {
      return fallbackStorage.getItem(key);
    }

    try {
      const value = await localforage.getItem<string>(key);
      return value;
    } catch (error) {
      console.error("Error getting item from localForage:", error);
      // Fallback to localStorage if localforage fails
      try {
        return localStorage.getItem(key);
      } catch (localStorageError) {
        console.error("Fallback localStorage also failed:", localStorageError);
        return null;
      }
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (!isBrowser) {
      return fallbackStorage.setItem(key, value);
    }

    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error("Error setting item in localForage:", error);
      // Fallback to localStorage if localforage fails
      try {
        localStorage.setItem(key, value);
      } catch (localStorageError) {
        console.error("Fallback localStorage also failed:", localStorageError);
        throw error;
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (!isBrowser) {
      return fallbackStorage.removeItem(key);
    }

    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error("Error removing item from localForage:", error);
      // Fallback to localStorage if localforage fails
      try {
        localStorage.removeItem(key);
      } catch (localStorageError) {
        console.error("Fallback localStorage also failed:", localStorageError);
        throw error;
      }
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    if (!isBrowser) {
      return fallbackStorage.getAllKeys();
    }

    try {
      return await localforage.keys();
    } catch (error) {
      console.error("Error getting all keys from localForage:", error);
      // Fallback to localStorage if localforage fails
      try {
        return Object.keys(localStorage);
      } catch (localStorageError) {
        console.error("Fallback localStorage also failed:", localStorageError);
        return [];
      }
    }
  },

  clear: async (): Promise<void> => {
    if (!isBrowser) {
      return fallbackStorage.clear();
    }

    try {
      await localforage.clear();
    } catch (error) {
      console.error("Error clearing localForage:", error);
      // Fallback to localStorage if localforage fails
      try {
        localStorage.clear();
      } catch (localStorageError) {
        console.error("Fallback localStorage also failed:", localStorageError);
        throw error;
      }
    }
  },
};

export default localForageStorage;
