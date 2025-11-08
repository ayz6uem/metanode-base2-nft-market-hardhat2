// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyMoney is ERC20("MyMoney", "MMO") {

    function mintMoney(address to, uint256 v) external {
        _mint(to, v);
    }

}
