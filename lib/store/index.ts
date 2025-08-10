import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import localForageStorage from "./storage";
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/auth";
import settingsSlice from "./slices/settings";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Custom persist configuration for auth slice - exclude accessToken
const authPersistConfig = {
  key: "auth",
  storage: localForageStorage,
  blacklist: ["accessToken"], // Don't persist access token in localStorage
};

const persistConfig = {
  key: "root",
  storage: localForageStorage,
  whitelist: ["settings"], // Only persist settings at root level
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
  store,
  persistor,
};
