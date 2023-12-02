import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as dApp from "../contracts/interactions.js";


export const refreshPoolReserves = createAsyncThunk(
  'pool/refresh',
  async (web3) => {
    if (web3) {
        console.log("refreshing pool reserves ...");
        const poolReserves = await dApp.fetchPoolReserves(web3);
        return poolReserves;
    }
    return {ethReserve: null, dvtReserve: null};
  }
)

export const lpSlice = createSlice({
    name: 'pool',
    initialState: {
        ethReserve: null,
        dvtReserve: null
    },
    extraReducers: (builder) => {
        builder.addCase(refreshPoolReserves.fulfilled, (state, action) => {
            console.log("pool reserves were refreshed");
            state.ethReserve = action.payload.ethReserve;
            state.dvtReserve = action.payload.dvtReserve;
            console.log(action.payload);
        })
    },
    reducers: {},
})

export default lpSlice.reducer;