import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchHotels = createAsyncThunk(
    "hotels/fetchHotels",
    async () => {
    const response = await fetch("http://localhost:5000/api/hotels");

    if (!response.ok) {
        throw new Error("Failed to fetch hotels");
    }

    const data = await response.json();

    return data;
    }
);

const initialState = {
    hotels: [],
    loading: false,
    error: null,
};

const hotelSlice = createSlice({
    name: "hotels",
    initialState,

    reducers: {},

    extraReducers: (builder) => {
    builder
        .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
        })

        .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
        })

        .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        });
    },
});

export default hotelSlice.reducer;