
import './PoolPage.css';
import React, { useState, useEffect } from "react";
import * as dApp from "../contracts/interactions.js";
import TokenContainer from '../components/TokenContainer';
import Header from '../components/Header';
import SwapButton from '../components/SwapButton';

function PoolPage() {
    const [wallet, setWallet] = useState({ // wallet
        account: '', 
        ethBalance: '', 
        dvtBalance: ''
      });
    
      const [LP, setLP] = useState({ // Liquidity Pool
        ethReserve: "",
        dvtReserve: ""
      });  
    
      const [addition, setAddition] = useState({  // Addition to LP
        ethAmount: null,
        dvtAmount: null,
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
    
      const addLiquidityHandler = async (t) => {
        console.log("addLiquidityHandler"); 
        await dApp.addLiquidityToPool(window, addition.ethAmount, addition.dvtAmount, wallet.account);
        await refreshWalletBalances();
        await refreshPoolReserves();
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
    
      function truncateAddress(addr) {
        if (addr) {
          return addr.substring(0,6) + '...' + addr.substring(addr.length-4,addr.length-1);
        };
        return "";
      };
    
      return (
      <React.Fragment>
        <Header account={truncateAddress(wallet.account)} onClick={ConnectWalletHandler}/>
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