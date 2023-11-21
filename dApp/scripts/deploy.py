from brownie import Dex, DevToken
from .utils import get_account


# only for deploy to external testnet
def main():
    account = get_account()
    contract = DevToken.deploy({"from": account})
    Dex.deploy(contract.address,{"from": account})
    DevTokenContract = DevToken[-1]
    DexContract = Dex[-1]
    print(f"DevTokenContract is deployed at address={DevTokenContract.address}")
    print(f"DexContract is deployed at address={DexContract.address}")