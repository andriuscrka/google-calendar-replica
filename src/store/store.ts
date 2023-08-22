import { configureStore, combineReducers } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import dateReducer from './dateSlice';

const store = configureStore({
	reducer: combineReducers({ modal: modalReducer, date: dateReducer }),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
