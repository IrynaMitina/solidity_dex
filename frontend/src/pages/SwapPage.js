import './SwapPage.css';
import React, { useState, useEffect } from "react";
import * as dApp from "../contracts/interactions.js";
import TokenContainer from '../components/TokenContainer';
import Header from '../components/Header';
import SwapButton from '../components/SwapButton';
import SwapCurrencyButton from '../components/SwapCurrencyButton';

function SwapPage() {
    const [wallet, setWallet] = useState({ // wallet
        account: '', 
        ethBalance: '', 
        dvtBalance: ''
      });
    
      const [LP, setLP] = useState({ // Liquidity Pool
        ethReserve: "",
        dvtReserve: ""
      });  
      const [price, setPrice] = useState("");
    
      const [trade, setTrade] = useState({  // trade
        sellEthBuyToken: true,
        sellAmount: null,
        buyAmount: null
      });
      const [insufficientFunds, setInsufficientFunds] = useState(false);
    
      const ConnectWalletHandler = async (t) => {
        t.preventDefault();
        try {
          if (!wallet.account) {
            await dApp.connectWallet(window);
            const walletAccount = await dApp.getWalletAccount(window);
            setWallet({account: walletAccount, ethBalance: '', dvtBalance: ''});
    
            await refreshWalletBalances();
            await refreshPoolReserves();
          } else {
            dApp.disconnectWallet(window);
            setWallet({account: '', ethBalance: '', dvtBalance: ''});
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    
      async function refreshWalletBalances() {
        console.log("refreshWalletBalances");
        const walletBalances = await dApp.fetchWalletBalances(window);
        setWallet((prev) => {
          return {...prev, ethBalance: walletBalances.ethBalance, dvtBalance: walletBalances.dvtBalance }
        });
      };
    
      async function refreshPoolReserves() {
        console.log("refreshPoolReserves");
        const poolReserves = await dApp.fetchPoolReserves(window);
        setLP(poolReserves);
      };
    
      const swapHandler = async (t) => {
        console.log("swapHandler"); 
        console.log(trade);  
        await dApp.trade(window, trade.sellEthBuyToken, trade.sellAmount, wallet.account);
        await refreshWalletBalances();
        await refreshPoolReserves();
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
        setPrice(trade.sellEthBuyToken? LP.dvtReserve/LP.ethReserve: LP.ethReserve/LP.dvtReserve);
      }, [LP, trade.sellEthBuyToken]);
    
      useEffect(() => { // check insufficient funds
        console.log("check insufficient funds");
        setInsufficientFunds(
          wallet.account && trade.sellAmount > (trade.sellEthBuyToken?wallet.ethBalance:wallet.dvtBalance)
        );
      }, [wallet, trade.sellAmount]);
    
      function truncateAddress(addr) {
        if (addr) {
          return addr.substring(0,6) + '...' + addr.substring(addr.length-4,addr.length-1);
        };
        return "";
      };
    
      return (
      <React.Fragment>
        <Header account={truncateAddress(wallet.account)} onClick={ConnectWalletHandler}/>
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