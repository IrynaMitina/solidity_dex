import './SwapPage.css';
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import * as dApp from "../contracts/interactions.js";
import TokenContainer from '../components/TokenContainer';
import Header from '../components/Header';
import SwapButton from '../components/SwapButton';
import SwapCurrencyButton from '../components/SwapCurrencyButton';
import { refreshBalances } from '../components/walletSlice'
import {refreshPoolReserves}  from '../components/LPSlice'

function SwapPage() {
      const wallet = useSelector((state) => state.wallet);
      const LP = useSelector((state) => state.pool);
      const dispatch = useDispatch();
    
 
      const [price, setPrice] = useState("");
      const [trade, setTrade] = useState({  // trade
        sellEthBuyToken: true,  // direction of trade
        sellAmount: null,
        buyAmount: null
      });
      const [insufficientFunds, setInsufficientFunds] = useState(false);
    
    
      const swapHandler = async (t) => {
        console.log("swapHandler"); 
        console.log(trade);  
        await dApp.trade(wallet.web3, trade.sellEthBuyToken, trade.sellAmount, wallet.account);
        dispatch(refreshBalances(wallet.web3));
        dispatch(refreshPoolReserves(wallet.web3));
        t.preventDefault();  // prevent browser reload/refresh
      }
    
      const swapCurrencyHandler = async (t) => {
        t.preventDefault();
        setTrade((prevTrade) => {
            return {...prevTrade, sellEthBuyToken: !prevTrade.sellEthBuyToken};
        });
      }
    
      function setSellAmount(value) {
        setTrade((prevTrade) => {
          return {...prevTrade, sellAmount: value};
        });
      };
    
      useEffect(() => { // calculate buy amount corresponding to sell amount
        console.log("calculate buy amount");
        try {
          const amount = (wallet.account && trade.sellAmount)? price * parseFloat(trade.sellAmount): "";
          setTrade((prevTrade) => {
            return {...prevTrade, buyAmount: amount};
          });
        } catch (error) {
          console.log(error.message);
        };
      }, [trade.sellAmount, price, wallet.account]);
    
      useEffect(() => { // calculate price depending on pool reserves
        console.log("calculate price");
        console.log(LP);
        if (LP.dvtReserve && LP.ethReserve) {
          setPrice(trade.sellEthBuyToken? LP.dvtReserve/LP.ethReserve: LP.ethReserve/LP.dvtReserve);
        }
      }, [LP, trade.sellEthBuyToken]);
    
      useEffect(() => { // check insufficient funds
        console.log("check insufficient funds");
        setInsufficientFunds(
          wallet.account && trade.sellAmount > (trade.sellEthBuyToken?wallet.thBalance:wallet.dvtBalance)
        );
      }, [wallet, trade.sellAmount]);
    
      return (
      <React.Fragment>
        <Header/>
        <div id="swap-container">
          <div id="swap-header">
            <div>Swap</div>
          </div>
          <TokenContainer callback={setSellAmount} amount={trade.sellAmount} 
              disabled={false}  
              title="You pay"  id='swap-sell-token' 
              token={trade.sellEthBuyToken?"eth":"dvt"} 
              tokenbalance={trade.sellEthBuyToken?wallet.ethBalance:wallet.dvtBalance}/>
          <SwapCurrencyButton onClick={swapCurrencyHandler}/>
          <TokenContainer amount={trade.buyAmount} 
              disabled={true} 
              title="You receive" id='swap-buy-token' 
              token={trade.sellEthBuyToken?"dvt":"eth"}
              tokenbalance={trade.sellEthBuyToken?wallet.dvtBalance:wallet.ethBalance}/>
          <div class="price-container"><div>{wallet.account?(trade.sellEthBuyToken?'Price: 1 ETH = '+(price)+' DVT':'Price: 1 DVT = '+(price)+' ETH'):''}</div></div>
          <SwapButton onClick={swapHandler} 
            disabled={!trade.sellAmount || insufficientFunds || !wallet.account}
            text={insufficientFunds?"Insufficient Funds":"Swap"}/>
        </div>
      </React.Fragment>
      );
}
export default SwapPage;