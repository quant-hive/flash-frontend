"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store";
import { StorageMigration } from "@/lib/storage/migration";
import { ReactNode, useEffect } from "react";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Run migration on app startup
    const runMigration = async () => {
      try {
        await StorageMigration.migrateReduxPersistData();

        // Optional: Get storage info for debugging
        if (process.env.NODE_ENV === "development") {
          const storageInfo = await StorageMigration.getStorageInfo();
          console.log("📊 Storage Info:", storageInfo);
        }
      } catch (error) {
        console.error("Migration failed:", error);
      }
    };

    runMigration();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
