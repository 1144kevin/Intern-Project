import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { projectDataType } from '../assets/data';

interface BookState {
	books: projectDataType[];
	bookIds: string[]; // 用於存儲書籍 ID 的數組
}

const initialState: BookState = {
	books: [],
	bookIds: [],
};

const bookSlice = createSlice({
	name: 'book',
	initialState,
	reducers: {
		setBooks(state, action: PayloadAction<projectDataType[]>) {
			state.books = action.payload;
			state.bookIds = action.payload.map((book) => book.id!); // 同步更新 bookIds
		},
		addBook(state, action: PayloadAction<projectDataType>) {
			state.books.push(action.payload);
			state.bookIds.push(action.payload.id!); // 添加新書籍的 ID
		},
	},
});

export const { setBooks, addBook } = bookSlice.actions;
export default bookSlice.reducer;
