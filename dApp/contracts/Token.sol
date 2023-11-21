// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21; // solidity version for compiler

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DevToken is ERC20, Ownable{
	constructor() ERC20("DevToken", "DVT") Ownable(msg.sender) {}
	function issueToken() public onlyOwner{
		_mint(msg.sender, 1000*10**18);
	}
}