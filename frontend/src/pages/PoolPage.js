
import './PoolPage.css';
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import * as dApp from "../contracts/interactions.js";
import TokenContainer from '../components/TokenContainer';
import Header from '../components/Header';
import SwapButton from '../components/SwapButton';
import { refreshBalances } from '../components/walletSlice'
import {refreshPoolReserves}  from '../components/LPSlice'

function PoolPage() {
      const wallet = useSelector((state) => state.wallet);
      const LP = useSelector((state) => state.pool);
      const dispatch = useDispatch();

      const [addition, setAddition] = useState({  // Addition to LP
        ethAmount: null,
        dvtAmount: null,
      });
      const [insufficientFunds, setInsufficientFunds] = useState(false);
    
      const addLiquidityHandler = async (t) => {
        console.log("addLiquidityHandler"); 
        await dApp.addLiquidityToPool(wallet.web3, addition.ethAmount, addition.dvtAmount, wallet.account);
        dispatch(refreshBalances(wallet.web3));
        dispatch(refreshPoolReserves(wallet.web3));
        t.preventDefault();  // prevent browser reload/refresh
      }
    
      function setAdditionEthAmount(value) {
        setAddition((prev) => {
          return {...prev, ethAmount: value};
        });
      };
      function setAdditionDvtAmount(value) {
        setAddition((prev) => {
          return {...prev, dvtAmount: value};
        });
      }
    
      useEffect(() => { // check insufficient funds
        console.log("check insufficient funds");
        setInsufficientFunds(
          wallet.account && (addition.ethAmount > wallet.ethBalance || addition.dvtAmount > wallet.dvtBalance)
        );
      }, [wallet, addition]);
    
      return (
      <React.Fragment>
        <Header/>
        <div id="add-liquidity-container">
          <div id="add-liquidity-header">
            <div>Add Liquidity</div>
          </div>
          <TokenContainer callback={setAdditionEthAmount} amount={addition.ethAmount} 
              disabled={false}  
              title={"Liquidity: " + LP.ethReserve} id="add-eth-liquidity" 
              token={"eth"} 
              tokenbalance={wallet.ethBalance}/>
          <TokenContainer callback={setAdditionDvtAmount} amount={addition.dvtAmount} 
              disabled={false} 
              title={"Liquidity: " + LP.dvtReserve} id="add-dvt-liquidity" 
              token={"dvt"}
              tokenbalance={wallet.dvtBalance}/>
          <SwapButton onClick={addLiquidityHandler} 
            disabled={!addition.ethAmount || !addition.dvtAmount || insufficientFunds || !wallet.account}
            text={insufficientFunds?"Insufficient Funds":"Add"}/>
        </div>
      </React.Fragment>
      );
}
export default PoolPage;