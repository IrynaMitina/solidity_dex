# Compile, deploy and interactions. 

```bash
brownie compile
brownie console --network sepolia
```

To work with local brownie ganache testnet - launch `brownie console`.

```python
from brownie import Dex, DevToken
from scripts.utils import get_account

def print_balances():
    print("Dex liquidity: " + repr(DexContract.getReserves({"from": account})))  
    print("DVT in wallet: " + repr(DevTokenContract.balanceOf(account)))  
    print("ETH in wallet: " + repr(account.balance())) 
    print("LP tokens in wallet: " + repr(DexContract.balanceOf(account))) 


# 1a. deploy to testnet
from scripts.utils import get_account
account = get_account()  # wallet - metamask for sepolia and accounts[0] for local testnet
contract = DevToken.deploy({"from": account})
Dex.deploy(contract.address,{"from": account})
DevTokenContract = DevToken[-1]
DexContract = Dex[-1]
print(f"DevTokenContract is deployed at address={DevTokenContract.address}")
print(f"DexContract is deployed at address={DexContract.address}")
# check contract on https://sepolia.etherscan.io/
# 1b. re-create contract from prev session using its address (contracts data persists between sessions)
DevTokenContract = Contract("0xBB6F07A931F53da1f4e4C82DD9dac2EA13c77Bf8") 
DexContract = Contract("0xECdc562F32F2095cA8d6d72c40FECd28eEBAA9FE")
reserves = DexContract.getReserves({"from": account})
from brownie.convert import Wei
Wei(reserves[0]).to('ether')  # Fixed('0.006374501992031873')


# 2. issue DVT tokens to wallet
DevTokenContract.issueToken({"from": account})
print(DevTokenContract.balanceOf(account))

# 3. add liquidity
#    give Dex allowance to withdraw DVT tokens
DevTokenContract.approve(DexContract.address, 800*10**18, {"from": account})
print("allowance to Dex for DVT: " + repr(DevTokenContract.allowance(account, DexContract.addre
ss)))
tx = DexContract.addLiquidity(800*10**18, {"from": account, "value": 50*10**16, "gas_limit": 8*10**6})
print_balances() 

# 4. buy
tx = DexContract.buy({"from": account, "value": 10**16, "gas_limit": 8*10**6})
print_balances() 

# 5. sell
DevTokenContract.approve(DexContract.address, 200*10**18, {"from": account})
tx = DexContract.sell(200*10**18, {"from": account, "gas_limit": 8*10**6})
print_balances() 

# 6. remove liquidity
DexContract.approve(DexContract.address, 25*10**16, {"from": account})  # LP tokens
tx = DexContract.removeLiquidity(25*10**16, {"from": account, "gas_limit": 8*10**6})
print_balances() 
```