import localforage from "localforage";

/**
 * Migration utility to move data from localStorage to localForage
 * This ensures backward compatibility for existing users
 */
export class StorageMigration {
  /**
   * Migrate Redux persist data from localStorage to localForage
   */
  static async migrateReduxPersistData(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // Check if data exists in localStorage
      const localStorageData = localStorage.getItem("persist:root");

      if (localStorageData) {
        // Check if data already exists in localForage
        const localForageData = await localforage.getItem<string>(
          "persist:root"
        );

        if (!localForageData) {
          console.log(
            "🔄 Migrating Redux persist data from localStorage to localForage..."
          );

          // Migrate the data
          await localforage.setItem("persist:root", localStorageData);

          console.log("✅ Migration completed successfully");

          // Optionally remove from localStorage after successful migration
          // localStorage.removeItem('persist:root');
        } else {
          console.log(
            "📦 Data already exists in localForage, skipping migration"
          );
        }
      } else {
        console.log("📭 No Redux persist data found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error during storage migration:", error);
    }
  }

  /**
   * Migrate specific key-value pairs from localStorage to localForage
   */
  static async migrateSpecificKeys(keys: string[]): Promise<void> {
    if (typeof window === "undefined") return;

    for (const key of keys) {
      try {
        const localStorageValue = localStorage.getItem(key);

        if (localStorageValue) {
          const localForageValue = await localforage.getItem(key);

          if (!localForageValue) {
            console.log(
              `🔄 Migrating ${key} from localStorage to localForage...`
            );
            await localforage.setItem(key, localStorageValue);
            console.log(`✅ ${key} migrated successfully`);
          }
        }
      } catch (error) {
        console.error(`❌ Error migrating ${key}:`, error);
      }
    }
  }

  /**
   * Clear localStorage data after successful migration
   */
  static clearLocalStorageData(keys: string[]): void {
    if (typeof window === "undefined") return;

    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from localStorage`);
      } catch (error) {
        console.error(`❌ Error removing ${key} from localStorage:`, error);
      }
    });
  }

  /**
   * Get storage info for debugging
   */
  static async getStorageInfo(): Promise<{
    localForageKeys: string[];
    localStorageKeys: string[];
    localForageSize: number;
  }> {
    const info = {
      localForageKeys: [] as string[],
      localStorageKeys: [] as string[],
      localForageSize: 0,
    };

    try {
      // Get localForage keys
      info.localForageKeys = await localforage.keys();

      // Calculate approximate size
      for (const key of info.localForageKeys) {
        const value = await localforage.getItem<string>(key);
        if (typeof value === "string") {
          info.localForageSize += value.length;
        }
      }

      // Get localStorage keys (if available)
      if (typeof window !== "undefined") {
        info.localStorageKeys = Object.keys(localStorage);
      }
    } catch (error) {
      console.error("Error getting storage info:", error);
    }

    return info;
  }
}
