import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import localForageStorage from "../storage/localforage-storage";
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import settingsSlice from "./slices/settingsSlice";

const persistConfig = {
  key: "root",
  storage: localForageStorage,
  whitelist: ["auth", "settings"], // Only persist these slices
};

const rootReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
