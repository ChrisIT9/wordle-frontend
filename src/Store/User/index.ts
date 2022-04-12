import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./User.reducer";

const rootReducer = combineReducers({
  user: userReducer
});

const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default store;