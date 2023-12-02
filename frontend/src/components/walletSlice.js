import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as dApp from "../contracts/interactions.js";


export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async () => {
    console.log("connecting wallet...");
    const web3 = await dApp.connectWallet(window);
    const account = await dApp.getWalletAccount(web3);
    return { web3: web3, account: account }
  }
)

export const refreshBalances = createAsyncThunk(
  'wallet/refreshBalances',
  async (web3) => {
    if (web3) {
      console.log("refreshing balances...");
      const walletBalances = await dApp.fetchWalletBalances(web3);
      return walletBalances;
    }
    return {ethBalance: null, dvtBalance: null};
  }
)

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    web3: null, 
    account: null,
    ethBalance: null, 
    dvtBalance: null
  },
  extraReducers: (builder) => {
    builder.addCase(connectWallet.fulfilled, (state, action) => {
      console.log("wallet is being connected");
      state.web3 = action.payload.web3;
      state.account = action.payload.account;
    });
    builder.addCase(refreshBalances.fulfilled, (state, action) => {
      state.ethBalance = action.payload.ethBalance;
      state.dvtBalance = action.payload.dvtBalance;
      console.log("balances were refreshed");
      console.log(action.payload);
    })
  },
  reducers: {
    disconnectWallet: (state) => {
      state.web3 = null;
      state.account = null;
      state.ethBalance = null; 
      state.dvtBalance = null;
    },
  },
})

export const { disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
