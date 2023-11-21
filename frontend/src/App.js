import Web3 from "web3";
import './App.css';
import ethericon from './ETH.png';
import dvticon from './DVT.jpg';
import React, { useState, useEffect } from "react";
import {address as DexAddress, abi as DexAbi} from "./contracts/DexContract.js";
import {address as TokenAddress, abi as TokenAbi} from "./contracts/TokenContract.js";
import TokenContainer from './TokenContainer';

const GAS_LIMIT = 8*10**8;


function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
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
      if (!isWalletConnected) {
        if (!window.ethereum) {
          alert("Cannot find wallet to connect!");
          return;
        };
        await window.ethereum.request({method: 'eth_requestAccounts'});
        window.web3 = new Web3(window.ethereum); 
        const accounts = await window.web3.eth.getAccounts();
        const walletAccount =  accounts[0];
        setWallet({account: walletAccount, ethBalance: '', dvtBalance: ''});
        setIsWalletConnected(true);
        await fetchWalletBalances();
        await fetchPoolReserves();
      } else {
        window.web3 = null;
        setIsWalletConnected(false);
        setWallet({account: '', ethBalance: '', dvtBalance: ''});
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchWalletBalances() {
    console.log("fetchWalletBalances");
    if (window.web3) {
      const accounts = await window.web3.eth.getAccounts();
      const walletAccount = accounts[0];
      const eth = await window.web3.eth.getBalance(walletAccount);
      const TokenContract = new window.web3.eth.Contract(TokenAbi, TokenAddress);
      const dvt = await TokenContract.methods.balanceOf(walletAccount).call();
      setWallet({account: walletAccount, ethBalance: Web3.utils.fromWei(eth, "ether"), dvtBalance: Web3.utils.fromWei(dvt, "ether")});
    };
  };

  async function fetchPoolReserves() {
    console.log("fetchPoolReserves");
    if (window.web3) {
      const DexContract = new window.web3.eth.Contract(DexAbi, DexAddress);
      const reserves = await DexContract.methods.getReserves().call();
      setLP({
        ethReserve: Web3.utils.fromWei(reserves._reserveETH, "ether"), 
        dvtReserve: Web3.utils.fromWei(reserves._reserveToken, "ether")
      });
    };
  };

  const swapHandler = async (t) => {
    console.log("swapHandler"); 
    console.log(trade);  
    if (window.web3) {
      window.web3.eth.Contract.handleRevert = true;
      const amount = Web3.utils.toWei(trade.sellAmount, "ether");
      const DexContract = new window.web3.eth.Contract(DexAbi, DexAddress);
      const TokenContract = new window.web3.eth.Contract(TokenAbi, TokenAddress);
      if (trade.sellEthBuyToken) { // buy DVT token, sell ETH
        console.log("buy tokens");
        const gas = await DexContract.methods.buy().estimateGas({from: wallet.account, value: amount});
        await DexContract.methods.buy().send({from: wallet.account, value: amount, gas});
      } else {  // buy ETH, sell DVT token
        // if selling token - we should approve withdraw first!
        console.log("approve withdrawal");
        var gas = await TokenContract.methods.approve(DexAddress, amount).estimateGas({from: wallet.account});
        await TokenContract.methods.approve(DexAddress, amount).send({from: wallet.account, gas});
        console.log("sell tokens");
        gas = await DexContract.methods.sell(amount).estimateGas({from: wallet.account});
        await DexContract.methods.sell(amount).send({from: wallet.account, gas});
      };
      await fetchWalletBalances();
      await fetchPoolReserves();
    };
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
      const amount = (isWalletConnected && trade.sellAmount)? price * parseFloat(trade.sellAmount): "";
      setTrade((prevTrade) => {
        return {...prevTrade, buyAmount: amount};
      });
    } catch (error) {
      console.log(error.message);
    };
  }, [trade.sellAmount, price, isWalletConnected]);

  useEffect(() => { // calculate price depending on pool reserves
    console.log("calculate price");
    setPrice(trade.sellEthBuyToken? LP.dvtReserve/LP.ethReserve: LP.ethReserve/LP.dvtReserve);
  }, [LP, trade.sellEthBuyToken]);

  useEffect(() => { // check insufficient funds
    console.log("check insufficient funds");
    setInsufficientFunds(
      isWalletConnected && trade.sellAmount > (trade.sellEthBuyToken?wallet.ethBalance:wallet.dvtBalance)
    );
  }, [isWalletConnected, wallet, trade.sellAmount]);

  function truncateAddress(addr) {
    if (addr) {
      return addr.substring(0,6) + '...' + addr.substring(addr.length-4,addr.length-1);
    };
    return "";
  };

  return (
  <div>
    <div class="account-pannel"> 
    <div id="account">{truncateAddress(wallet.account)}</div><button id="connect-wallet-button" onClick={ConnectWalletHandler}><div>{isWalletConnected?'Disconnect':'Connect'} wallet</div></button>
    </div>
    <div id="swap-container">
      <div id="swap-header">
        <div>Swap</div>
      </div>
      <TokenContainer callback={setSellAmount} amount={trade.sellAmount} 
          tradeside="SELL" 
          title="You pay" operationid="swap-sell-token" 
          tokenicon={trade.sellEthBuyToken?ethericon:dvticon} 
          tokensymbol={trade.sellEthBuyToken?"ETH":"DVT"} 
          tokenbalance={trade.sellEthBuyToken?wallet.ethBalance:wallet.dvtBalance}/>
      <div>
        <div class="swap-currency-button-container">
          <div id="swap-currency-button" color="#222222" onClick={swapCurrencyHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>
        </div>
      </div>
      <TokenContainer amount={trade.buyAmount} 
          tradeside="BUY" 
          title="You receive" operationid="swap-buy-token" 
          tokenicon={trade.sellEthBuyToken?dvticon:ethericon} 
          tokensymbol={trade.sellEthBuyToken?"DVT":"ETH"} 
          tokenbalance={trade.sellEthBuyToken?wallet.dvtBalance:wallet.ethBalance}/>
      <div class="price-container"><div>{isWalletConnected?(trade.sellEthBuyToken?'Price: 1 ETH = '+(price)+' DVT':'Price: 1 DVT = '+(price)+' ETH'):''}</div></div>
      <div>
        <button id="swap-button" onClick={swapHandler} 
            disabled={!trade.sellAmount || insufficientFunds || !isWalletConnected}>
          <div>{insufficientFunds?"Insufficient Funds":"Swap"}</div>
        </button>
      </div>
    </div>
  </div>
  );
}

export default App;
