
testing `web3.js` requests on ganache-desctop (local testnet)
run in `node` console:
```js
> let { Web3 } = require("web3");
> var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
> const accounts = await web3.eth.getAccounts();
> wallet = accounts[0];
> web3.eth.getBalance(wallet).then(function(result) {console.log(web3.utils.fromWei(result, "ether"));});
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 908,
  [Symbol(trigger_async_id_symbol)]: 892
}
> 99.96775732


> const DexAddress = "0xE9EC95868275eCA5a51945B6E4Fbe069546847f3";
> const DexAbi = [{"inputs": [{"internalType": "address",...}]
> const DexContract = new web3.eth.Contract(DexAbi, DexAddress);
> const TokenAddress = "0xF10f70482B69FcF4D53abb90B46dcD4CA2CF364C";
> const TokenAbi = [{"inputs": [],...}]
> var TokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);

// issue DVT tokens and send it to wallet
> TokenContract.methods.issueToken().send({from: wallet}).then(function(res){console.log('done');});
Promise {...}
> done
> // one more time
> TokenContract.methods.balanceOf(wallet).call().then(console.log);
Promise {...}
> 2000000000000000000000n

		 
// add liquidity to DEX pool 
// (first approve withdrawal of DVT tokens from wallet by DEX)
> await TokenContract.methods.approve(DexAddress, 800*10**18).send({from: wallet});
{ transactionHash: '0xbfd1c0ef4c6fe7473ecdf611e042f10aaefa40a5916aef3cbace5880ea55d37a',...}
> await TokenContract.methods.allowance(wallet, DexAddress).call();
800000000000000000000n
> var gas = await DexContract.methods.addLiquidity(800*10**18).estimateGas({from: wallet, value: 10*10**18});
> gas
109996n
> DexContract.methods.addLiquidity(800*10**18).send({from: wallet, value: 10*10**18, gas}).on('error', function(error) {console.log("ERROR:" + error); }).then(function(res) {console.log('done')});
Promise {...}
> done
> await DexContract.methods.getReserves().call();
{
  '0': 10000000000000000000n,
  '1': 800000000000000000000n,
  __length__: 2,
  _reserveETH: 10000000000000000000n,
  _reserveToken: 800000000000000000000n
}
> await TokenContract.methods.balanceOf(wallet).call();
1200000000000000000000n
> await web3.eth.getBalance(wallet);
89966445669596420154n

// buy DVT token for ETH
> gas = await DexContract.methods.buy().estimateGas({from: wallet, value: 2*10**18});
40481n
> await DexContract.methods.buy().send({from: wallet, value: 2*10**18, gas}).on('error', function(error) {console.log("ERROR:" + error); }).then(function(res) {console.log('done')});
done
> await TokenContract.methods.balanceOf(wallet).call();
1333333333333333333333n
> await web3.eth.getBalance(wallet);
87966331204996226875n
> await DexContract.methods.getReserves().call();
{
  '0': 12000000000000000000n,
  '1': 666666666666666666667n,
  __length__: 2,
  _reserveETH: 12000000000000000000n,
  _reserveToken: 666666666666666666667n
}

// sell DVT for ETH
> await TokenContract.methods.approve(DexAddress, 200*10**18).send({from: wallet});
{transactionHash: '0xa9d160e75afb399eb3c0f381a55af1325b887c6fd5aeb252ad91265d731721cc',...}
> await TokenContract.methods.allowance(wallet, DexAddress).call();
200000000000000000000n
> gas = await DexContract.methods.sell(130*10**18).estimateGas({from: wallet});
55780n
> DexContract.methods.sell(130*10**18).send({from: wallet, gas}).on('error', function(error) {console.log("ERROR:" + error); }).then(function(res) {console.log('done')});
Promise {
  <pending>,
  [Symbol(async_id_symbol)]: 9089,
  [Symbol(trigger_async_id_symbol)]: 6
}
> done

> await TokenContract.methods.balanceOf(wallet).call();
1203333333333333333333n
> await web3.eth.getBalance(wallet);
89924213608984792963n
> await DexContract.methods.getReserves().call();
{
  '0': 10041841004184100419n,
  '1': 796666666666666666667n,
  __length__: 2,
  _reserveETH: 10041841004184100419n,
  _reserveToken: 796666666666666666667n
}
> 
```