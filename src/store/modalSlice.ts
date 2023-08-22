import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
	name: 'modal',
	initialState: false,
	reducers: {
		toggle: (state: boolean) => {
			return !state;
		},
	},
});

export const { toggle } = modalSlice.actions;
export default modalSlice.reducer;
