import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '../components/walletSlice';
import poolReducer from '../components/LPSlice';

export default configureStore({
  reducer: {
    wallet: walletReducer,
    pool: poolReducer
  },
})