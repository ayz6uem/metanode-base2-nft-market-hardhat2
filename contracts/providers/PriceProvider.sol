// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * 价格提供者
 * @title 
 * @author 
 * @notice 
 */
contract PriceProvider {
    
    mapping(address erc20 => AggregatorV3Interface priceData) priceDatas;
    
    function putPriceData(address erc20, address v) external {
        priceDatas[erc20] = AggregatorV3Interface(v);
    }

    function getPrice(address erc20) public view returns (uint256) {
        (,int256 price,,,) = priceDatas[erc20].latestRoundData();
        return uint256(price);
    }
}