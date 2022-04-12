import { createAction } from "@reduxjs/toolkit";

export const addUsername = createAction<string>('user/addUsername');
export const clearUsername = createAction('user/clearUsername');