from brownie import Dex, DevToken
from brownie import accounts, reverts
from brownie.network.transaction import Status

GAS_LIMIT = 8*10**6


def _setup(account):
    contract = DevToken.deploy({"from": account})
    Dex.deploy(contract.address,{"from": account})
    DevTokenContract = DevToken[-1]
    DexContract = Dex[-1]
    DevTokenContract.issueToken({"from": account})  # issue 1000 DVT tokens
    return DevTokenContract, DexContract


def test_add_liquidity_failed():
    # failed to add liquidity, since
    # DexContract is not allowed to withdraw DVT tokens from account
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)
    assert 0 == DevTokenContract.allowance(account, DexContract.address)
    with reverts():  # transaction reverted
        DexContract.addLiquidity(
            400*10**18, {"from": account, "value": 25*10**16, "gas_limit": GAS_LIMIT}
        )


def test_add_liquidity_to_empty_pool_success():
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)  # issued 1000 DVT to account
    initial_eth_balance = account.balance()
    initial_dvt_balance = 1000*10**18  

    dvt_amount = 400*10**18
    eth_amount = 25*10**16
    # give allowance to DexContract to withdraw DVT tokens from account
    DevTokenContract.approve(DexContract.address, dvt_amount, {"from": account})
    assert dvt_amount == DevTokenContract.allowance(account, DexContract.address)
    tx = DexContract.addLiquidity(
        dvt_amount, {"from": account, "value": eth_amount, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    assert (eth_amount, dvt_amount) == DexContract.getReserves({"from": account}) 
    assert (initial_dvt_balance - dvt_amount) == DevTokenContract.balanceOf(account)  
    assert (initial_eth_balance - eth_amount) == account.balance()  
    assert eth_amount == DexContract.balanceOf(account)  # LP tokens


def test_add_liquidity_to_not_empty_pool_success():
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)  # issued 1000 DVT to account
    initial_eth_balance = account.balance()
    initial_dvt_balance = 1000*10**18  

    # add liquidity to empty pool
    DevTokenContract.approve(DexContract.address, 400*10**18, {"from": account})
    tx = DexContract.addLiquidity(
        400*10**18, {"from": account, "value": 25*10**16, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    # add liquidity to non-empty pool
    # !this should not noticably change price
    DevTokenContract.approve(DexContract.address, 100*10**18, {"from": account})
    assert 100*10**18 == DevTokenContract.allowance(account, DexContract.address)
    tx = DexContract.addLiquidity(
        100*10**18, {"from": account, "value": 5*10**16, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    eth_amount, dvt_amount = DexContract.getReserves({"from": account}) 
    dt = 80 * 10**18  # dt = de * t / e = 5*10**16 * 400*10**18 / 25*10**16  (! to keep price const)
    assert dvt_amount == 400*10**18 + dt
    assert eth_amount == 30*10**16
    assert (initial_dvt_balance - dvt_amount) == DevTokenContract.balanceOf(account)  
    assert (initial_eth_balance - eth_amount) == account.balance() 
    assert eth_amount == DexContract.balanceOf(account)  # LP tokens


def test_remove_liquidity_failed():
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)  # issued 1000 DVT to account  
    DevTokenContract.approve(DexContract.address, 400*10**18, {"from": account})
    tx = DexContract.addLiquidity(
        400*10**18, {"from": account, "value": 25*10**16, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    with reverts():  # transaction reverted
        DexContract.removeLiquidity(30*10**16, {"from": account, "gas_limit": GAS_LIMIT})


def test_remove_liquidity_success():
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)  # issued 1000 DVT to account  
    DevTokenContract.approve(DexContract.address, 800*10**18, {"from": account})
    tx = DexContract.addLiquidity(
        800*10**18, {"from": account, "value": 50*10**16, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    assert 50*10**16 == DexContract.balanceOf(account)
    eth_amount = account.balance()
    dvt_amount = DevTokenContract.balanceOf(account)

    DexContract.approve(DexContract.address, 25*10**16, {"from": account})  # LP tokens
    tx = DexContract.removeLiquidity(25*10**16, {"from": account, "gas_limit": GAS_LIMIT})
    assert tx.status == Status.Confirmed
    assert (25*10**16, 400*10**18) == DexContract.getReserves({"from": account})
    assert 25*10**16 == DexContract.balanceOf(account)  # LP tokens
    assert eth_amount + 25*10**16 == account.balance()
    assert dvt_amount + 400*10**18 == DevTokenContract.balanceOf(account)


def test_buy_and_sell_success():
    account = accounts[0]
    DevTokenContract, DexContract = _setup(account)  # issued 1000 DVT to account  
    DevTokenContract.approve(DexContract.address, 400*10**18, {"from": account})
    tx = DexContract.addLiquidity(
        400*10**18, {"from": account, "value": 25*10**16, "gas_limit": GAS_LIMIT}
    )
    assert tx.status == Status.Confirmed
    eth_balance = account.balance()
    dvt_balance = DevTokenContract.balanceOf(account)

    # const product formula: after buy/sell product of reserves remains the same
    # buy DVT token for ETH
    e, t = DexContract.getReserves({"from": account})
    de = 25*10**16  # ETH sold
    tx = DexContract.buy({"from": account, "value": de})
    assert tx.status == Status.Confirmed
    dt = DevTokenContract.balanceOf(account) - dvt_balance  # DVT tokens bought
    print(f"dt={dt}, de={de}, t={t}, e={e}")
    assert (e + de, t - dt) == DexContract.getReserves({"from": account})
    assert (t - dt)*(e + de) == t * e  
    # sell what we've bought
    # const product formula: t+dt)
    DevTokenContract.approve(DexContract.address, dt, {"from": account})
    tx = DexContract.sell(dt, {"from": account})
    assert tx.status == Status.Confirmed
    assert account.balance() == eth_balance
    assert DevTokenContract.balanceOf(account) == dvt_balance
