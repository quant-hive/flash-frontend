import localforage from "localforage";

// Configure localforage
localforage.config({
  name: "QuantHive",
  storeName: "redux_persist",
  description: "Redux persist storage for QuantHive application",
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
});

// Custom storage adapter for Redux Persist using localForage
const localForageStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await localforage.getItem<string>(key);
      return value;
    } catch (error) {
      console.error("Error getting item from localForage:", error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error("Error setting item in localForage:", error);
      throw error;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error("Error removing item from localForage:", error);
      throw error;
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error("Error getting all keys from localForage:", error);
      return [];
    }
  },

  clear: async (): Promise<void> => {
    try {
      await localforage.clear();
    } catch (error) {
      console.error("Error clearing localForage:", error);
      throw error;
    }
  },
};

export default localForageStorage;
