// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// simplified DEX:
// user can swap ETH for another token and vice versa
// user can add liquidity to pool in exchange for LP tokens (same amount as ETH), 
// removes liquidity from pool and burn LP tokens
contract Dex is ERC20 {
    address public tokenAddress;  // contract address for token

    constructor(address _token) ERC20("LP Token", "LP") {
        require(_token != address(0), "Token address passed is a null address");
        tokenAddress = _token;
    }
    function getReserves() public view returns (uint _reserveETH, uint _reserveToken) {
        _reserveETH = address(this).balance;
        _reserveToken = ERC20(tokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable {
        require(msg.value > 0, "you should send ETH");
        (uint ethBalance, uint tokenBalance) = getReserves();
        // ! ethBalance includes amount of ETH transfered in this transaction !
        ERC20 token = ERC20(tokenAddress);
        if(tokenBalance == 0) {
            // empty pool: user provides {token_amount, ETH_amount} setting price of token
            token.transferFrom(msg.sender, address(this), _amount);
            _mint(msg.sender, msg.value);  // send LP tokens to wallet
        } else {
            // non-empty pool: adding liquidity such that to keep same price 
            // (t + dt)/(e + de) = t/e,  t - amount of token, e - amount of ETH
            // dt = de * t / e
            uint dt = (tokenBalance * msg.value) / (ethBalance - msg.value);
            require(_amount >= dt, "Amount of tokens sent is less than the minimum tokens required");
            token.transferFrom(msg.sender, address(this), dt); // transfer token to pool from wallet
            _mint(msg.sender, msg.value);  // send LP tokens to wallet
        }
    }

    function removeLiquidity(uint _amount) public {
        // _amount - amount of LP tokens (= amount of ETH user wants to withdraw)
        require(_amount > 0, "_amount should be greater than zero");
        (uint ethBalance, uint tokenBalance) = getReserves(); 
        require(_amount < ethBalance, "insufficient liquidity");
        // (t + dt)/(e + de) = t/e,  t - amount of token, e - amount of ETH
        // dt = de * t / e
        uint dt = _amount * tokenBalance / ethBalance;
        require(dt < tokenBalance, "insufficient liquidity");
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(_amount);  // transfer ETH to wallet
        ERC20(tokenAddress).transfer(msg.sender, dt);  // transfer token to wallet
    }

    // buy token = swap ETH for token 
    // user specifies amount of ETH to exchange
    function buy() public payable {
        (uint ethBalance, uint tokenBalance) = getReserves();
        // ! ethBalance includes amount of ETH transfered in this transaction !
        // constant product formula: x * y = k
        // buy dx, sell dy:  dx = dy * x / (y + dy)
        // buy dt, sell de:  dt = de * t / (e + de)
        uint dt = msg.value * tokenBalance / ethBalance;
        require(dt < tokenBalance, "insufficient liquidity");
        ERC20(tokenAddress).transfer(msg.sender, dt);  // transfer token from pool to wallet
    }
    // sell token = swap token for ETH 
    // user specifies amount of token to exchange
    function sell(uint _amount) public {
        (uint ethBalance, uint tokenBalance) = getReserves();
        // constant product formula: x * y = k
        // buy dx, sell dy:  dx = dy * x / (y + dy)
        // buy de, sell dt:  de = dt * e / (t + dt)
        uint de = _amount * ethBalance / (tokenBalance + _amount);
        require(de < ethBalance, "insufficient liquidity");
        ERC20 token = ERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), _amount);  // transfer token from wallet to pool
        payable(msg.sender).transfer(de); // transfer ETH to wallet
    }
}
