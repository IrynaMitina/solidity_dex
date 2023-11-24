import Web3 from "web3";
import {address as DexAddress, abi as DexAbi} from "./DexContract.js";
import {address as TokenAddress, abi as TokenAbi} from "./TokenContract.js";

const GAS_LIMIT = 8*10**8;

async function fetchPoolReserves(window) {
    const web3 = window.web3;
    const DexContract = new web3.eth.Contract(DexAbi, DexAddress);
    const reserves = await DexContract.methods.getReserves().call();
    return {
        ethReserve: Web3.utils.fromWei(reserves._reserveETH, "ether"), 
        dvtReserve: Web3.utils.fromWei(reserves._reserveToken, "ether")
    };
  };

async function getWalletAccount(window) {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
}

async function fetchWalletBalances(window) {
    const walletAccount = await getWalletAccount(window);
    const web3 = window.web3;
    const eth = await web3.eth.getBalance(walletAccount);
    const TokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);
    const dvt = await TokenContract.methods.balanceOf(walletAccount).call();
    return {
        ethBalance: Web3.utils.fromWei(eth, "ether"),
        dvtBalance: Web3.utils.fromWei(dvt, "ether")
    };
};

async function connectWallet(window) {
    if (!window.ethereum) {
        alert("Cannot find wallet to connect!");
        return;
    };
    await window.ethereum.request({method: 'eth_requestAccounts'});
    window.web3 = new Web3(window.ethereum); 
}

function disconnectWallet(window) {
    window.web3 = null;
}

async function trade(window, sellEthBuyToken, sellAmount, _from) {
    // sellEthBuyToken - bool (trade direction)
    // sellAmount in ETH or DVT
    const web3 = window.web3;
    web3.eth.Contract.handleRevert = true;
    const amount = Web3.utils.toWei(sellAmount, "ether");
    const DexContract = new web3.eth.Contract(DexAbi, DexAddress);
    const TokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);
    if (sellEthBuyToken) { // buy DVT token, sell ETH
        console.log("buy tokens");
        const gas = await DexContract.methods.buy().estimateGas({from: _from, value: amount});
        await DexContract.methods.buy().send({from: _from, value: amount, gas});
    } else {  // buy ETH, sell DVT token
        // if selling token - we should approve withdraw first!
        console.log("approve withdrawal");
        var gas = await TokenContract.methods.approve(DexAddress, amount).estimateGas({from: _from});
        await TokenContract.methods.approve(DexAddress, amount).send({from: _from, gas});
        console.log("sell tokens");
        gas = await DexContract.methods.sell(amount).estimateGas({from: _from});
        await DexContract.methods.sell(amount).send({from: _from, gas});
    };
}

async function addLiquidityToPool(window, ethAmount, dvtAmount, _from) {
    // addLiquidity(uint _amount)
    const web3 = window.web3;
    web3.eth.Contract.handleRevert = true;
    ethAmount = Web3.utils.toWei(ethAmount, "ether");
    dvtAmount = Web3.utils.toWei(dvtAmount, "ether");
    console.log(ethAmount, dvtAmount);
    const DexContract = new web3.eth.Contract(DexAbi, DexAddress);
    const TokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);
    console.log("approve withdrawal");
    var gas = await TokenContract.methods.approve(DexAddress, dvtAmount).estimateGas({from: _from});
    await TokenContract.methods.approve(DexAddress, dvtAmount).send({from: _from, gas});
    console.log("sell tokens");
    gas = await DexContract.methods.addLiquidity(dvtAmount).estimateGas({from: _from, value: ethAmount});
    await DexContract.methods.addLiquidity(dvtAmount).send({from: _from, value: ethAmount, gas});
}

export {
    trade,
    connectWallet, disconnectWallet,
    fetchWalletBalances, getWalletAccount,
    fetchPoolReserves,
    addLiquidityToPool
}