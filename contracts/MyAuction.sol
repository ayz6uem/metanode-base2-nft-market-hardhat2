// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

//拍卖合约
contract MyAuction is ERC721Holder, Initializable, UUPSUpgradeable, OwnableUpgradeable {
    
    // 拍卖定义
    struct AuctionInfo {
        uint256 auctionId;
        address seller;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        bool isActive;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        address collectionAddress;
        uint256 collectionId;
    }

    event AuctionCreated(uint256 indexed auctionId,address indexed seller,uint256 startingPrice,uint256 duration,address collectionAddress,uint256 collectionId);
    event AuctionStarted(uint256 indexed auctionId,address indexed seller,address collectionAddress,uint256 collectionId);
    event BidPlaced(uint256 indexed auctionId,address indexed bidder,uint256 bidAmount);
    event AuctionEnded(uint256 indexed auctionId,address indexed highestBidder,uint256 highestBid);

    AuctionInfo public info;
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function initialize(
        uint256 auctionId,
        address seller,
        uint256 startingPrice,
        uint256 duration,
        address collectionAddress,
        uint256 collectionId
    ) public initializer{
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        require(duration >= 1 days, "Duration must be greater than 1 day");
        require(startingPrice > 0, "startingPrice must be greater than 0");
        info = AuctionInfo({
            auctionId: auctionId,
            seller: seller,
            startingPrice: startingPrice,
            highestBid: startingPrice,
            highestBidder: address(0),
            isActive: false,
            duration: duration,
            startTime: 0,
            endTime: 0,
            collectionAddress: collectionAddress,
            collectionId: collectionId
        });

        emit AuctionCreated(auctionId, msg.sender, startingPrice, duration, collectionAddress, collectionId);
    }

    function startAuction() external {
        IERC721(info.collectionAddress).safeTransferFrom(info.seller, address(this), info.collectionId);
        info.isActive = true;
        info.startTime = block.timestamp;
        info.endTime = block.timestamp + info.duration;
    }

    // 竞标
    function bid() external payable {
        require(info.isActive, "Auction is not active");
        require(block.timestamp < info.endTime, "Auction has ended");
        require(msg.sender != info.seller, "Seller cannot bid on their own auction");
        require(msg.value > info.highestBid && msg.value >= info.startingPrice, "Bid too low");

        // 退还之前的最高出价者
        if (info.highestBidder != address(0)) {
            payable(info.highestBidder).transfer(info.highestBid);
        }

        info.highestBid = msg.value;
        info.highestBidder = msg.sender;

        emit BidPlaced(info.auctionId, msg.sender, msg.value);
    }

    // 结束拍卖
    function endAuction() external {
        require(info.isActive, "Auction is not active");
        require(block.timestamp >= info.endTime, "Auction has not ended yet");
        require(msg.sender == info.seller, "Only seller can end the auction");

        info.isActive = false;

        IERC721 nft = IERC721(info.collectionAddress);
        // 如果有人出价，把NFT转给最高出价者，把钱转给卖家
        if (info.highestBidder != address(0)) {
            payable(info.seller).transfer(info.highestBid);
            nft.safeTransferFrom(address(this), info.highestBidder, info.collectionId);
        } else {
            // 如果没人出价，把NFT退还给卖家
            nft.safeTransferFrom(address(this), info.seller, info.collectionId);
        }
        emit AuctionEnded(info.auctionId, info.highestBidder, info.highestBid);
    }
}