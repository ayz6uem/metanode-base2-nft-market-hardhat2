// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./MyAuction.sol";

contract MyAuctionFactory is ERC721Holder, Initializable, UUPSUpgradeable, OwnableUpgradeable {

    address[] public auctions;
    uint256 public auctionCount;
    address public auctionImplementation;
    
    function initialize(address _implementation) public initializer{
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        auctionImplementation = _implementation;
        auctionCount = 0;
    }

    function setAuctionImplementation(address _implementation) external onlyOwner {
        auctionImplementation = _implementation;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // 创建拍卖
    function createAuction(
        uint256 startingPrice,
        uint256 duration,
        address collectionAddress,
        uint256 collectionId
    ) public returns (address) {
        auctionCount++;

        bytes memory data = abi.encodeWithSelector(MyAuction.initialize.selector, auctionCount, msg.sender, startingPrice, duration, collectionAddress, collectionId);
        ERC1967Proxy proxy = new ERC1967Proxy(auctionImplementation, data);
        address myAuctionAddress = address(proxy);

        auctions.push(myAuctionAddress);
        return myAuctionAddress;
    }

    function getAuctions() public view returns (address[] memory) {
        return auctions;
    }

    function getAuction(uint256 auctionId) public view returns (address) {
        require(auctionId > 0 && auctionId <= auctions.length, "Index out of bounds");
        return auctions[auctionId - 1];
    }

}