/* eslint-disable import/no-cycle */
import { configureStore } from '@reduxjs/toolkit';

import citations from './citations/citations';

const store = configureStore({
  reducer: citations,
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
