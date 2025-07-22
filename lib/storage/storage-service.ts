import localforage from "localforage";

/**
 * Storage service that provides a unified interface for data storage
 * Uses localForage for better performance and reliability
 */
export class StorageService {
  /**
   * Get an item from storage
   */
  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      return await localforage.getItem<T>(key);
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   */
  static async setItem<T = any>(key: string, value: T): Promise<void> {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      throw error;
    }
  }

  /**
   * Remove an item from storage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      throw error;
    }
  }

  /**
   * Clear all items from storage
   */
  static async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error("Error getting all keys from storage:", error);
      return [];
    }
  }

  /**
   * Check if a key exists in storage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      const value = await localforage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking if item ${key} exists in storage:`, error);
      return false;
    }
  }

  /**
   * Get multiple items at once
   */
  static async getMultipleItems<T = any>(
    keys: string[]
  ): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};

    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.getItem<T>(key);
      })
    );

    return result;
  }

  /**
   * Set multiple items at once
   */
  static async setMultipleItems<T = any>(
    items: Record<string, T>
  ): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => this.setItem(key, value))
    );
  }

  /**
   * Get storage usage information
   */
  static async getStorageInfo(): Promise<{
    keys: string[];
    totalItems: number;
    estimatedSize: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      let estimatedSize = 0;

      // Calculate estimated size
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value !== null) {
          // Rough estimation of size
          estimatedSize += JSON.stringify(value).length;
        }
      }

      return {
        keys,
        totalItems: keys.length,
        estimatedSize,
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return {
        keys: [],
        totalItems: 0,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Backup storage data to JSON
   */
  static async exportData(): Promise<Record<string, any>> {
    try {
      const keys = await this.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        data[key] = await this.getItem(key);
      }

      return data;
    } catch (error) {
      console.error("Error exporting storage data:", error);
      return {};
    }
  }

  /**
   * Restore storage data from JSON
   */
  static async importData(data: Record<string, any>): Promise<void> {
    try {
      await this.setMultipleItems(data);
    } catch (error) {
      console.error("Error importing storage data:", error);
      throw error;
    }
  }

  /**
   * Get the current storage driver being used
   */
  static getStorageDriver(): string {
    return localforage.driver();
  }

  /**
   * Get storage driver name in human-readable format
   */
  static getStorageDriverName(): string {
    const driver = this.getStorageDriver();
    switch (driver) {
      case localforage.INDEXEDDB:
        return "IndexedDB";
      case localforage.WEBSQL:
        return "WebSQL";
      case localforage.LOCALSTORAGE:
        return "localStorage";
      default:
        return "Unknown";
    }
  }
}
