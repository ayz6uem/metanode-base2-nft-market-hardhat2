const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Compatibility helpers for ethers v5/v6 differences
const parseEther = ethers.parseEther ?? ethers.utils.parseEther;
const toHex = (value) => (ethers.toBeHex ? ethers.toBeHex(value) : ethers.utils.hexlify(value));
// helper to get deployed contract address for ethers v5/v6 (some returned objects use .target)
const getAddr = (c) => (typeof c === 'string' ? c : (c?.address ?? c?.target));

describe("MyAuction", function () {
  let MyAuction, myAuction;
  let MyToken, myToken;
  let MyAuctionFactory, myAuctionFactory;
  let seller, bidder1, bidder2;
  const ONE_DAY = 24 * 60 * 60; // 1 day in seconds
  const STARTING_PRICE = parseEther("0.001");
  const FIRST_BID = parseEther("0.002");
  const SECOND_BID = parseEther("0.003");
  const INITIAL_BALANCE = parseEther("10");

  beforeEach(async function () {
    [seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy MyToken contract
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();
    await myToken.waitForDeployment();

    // Deploy MyAuction contract
    MyAuction = await ethers.getContractFactory("MyAuction");
    myAuction = await MyAuction.deploy();
    await myAuction.waitForDeployment();

    // Deploy MyAuctionFactory contract
    MyAuctionFactory = await ethers.getContractFactory("MyAuctionFactory");
    myAuctionFactory = await upgrades.deployProxy(MyAuctionFactory, [getAddr(myAuction)], { initializer: 'initialize', kind: 'uups' });

    // Mint token to seller
    await myToken.connect(seller).mint(seller.address);

    // Set initial balance for bidders
    await ethers.provider.send("hardhat_setBalance", [
      bidder1.address,
      toHex(INITIAL_BALANCE)
    ]);
    await ethers.provider.send("hardhat_setBalance", [
      bidder2.address,
      toHex(INITIAL_BALANCE)
    ]);
  });

  describe("Initial State", function () {
    it("should have correct initial state", async function () {
      expect(await myAuctionFactory.auctionCount()).to.equal(0);
      expect(await myToken.ownerOf(1)).to.equal(seller.address);
      expect(await ethers.provider.getBalance(bidder1.address)).to.equal(INITIAL_BALANCE);
      expect(await ethers.provider.getBalance(bidder2.address)).to.equal(INITIAL_BALANCE);
    });
  });

  describe("Create Auction", function () {
    it("should create auction correctly", async function () {
      const tx = await myAuctionFactory.connect(seller).createAuction(STARTING_PRICE,ONE_DAY,getAddr(myToken),1);
      await tx.wait();  // Wait for the transaction to be mined
      const auctionAddress = await myAuctionFactory.getAuction(1);  // Get the auction address from the factory
      const auctionInfo = await MyAuction.attach(auctionAddress).info();

      expect(await myAuctionFactory.auctionCount()).to.equal(1);
      expect(auctionInfo.seller).to.equal(seller.address);
      expect(auctionInfo.startingPrice).to.equal(STARTING_PRICE);
      expect(auctionInfo.isActive).to.be.false;
      expect(auctionInfo.collectionAddress).to.equal(getAddr(myToken));
      expect(auctionInfo.collectionId).to.equal(1);
    });

    it("should not allow zero starting price", async function () {
      // Then test the zero starting price case
      await expect(
        myAuctionFactory.connect(seller).createAuction(0,ONE_DAY,getAddr(myToken),1)
      ).to.be.revertedWith("startingPrice must be greater than 0");
    });

    it("should not allow duration less than 1 day", async function () {
      await expect(
        myAuctionFactory.connect(seller).createAuction(STARTING_PRICE, ONE_DAY - 1, getAddr(myToken), 1)
      ).to.be.revertedWith("Duration must be greater than 1 day");
    });
  });

  describe("Start Auction", function () {
    beforeEach(async function () {
      const tx = await myAuctionFactory.connect(seller).createAuction(STARTING_PRICE,ONE_DAY,getAddr(myToken),1);
      await tx.wait();  // Wait for the transaction to be mined
      const auctionAddress = await myAuctionFactory.getAuction(1);  // Get the auction address from the factory
      myAuction = await MyAuction.attach(auctionAddress);
    });
    it("should start auction correctly", async function () {
      await myToken.connect(seller).approve(getAddr(myAuction), 1);
      await myAuction.connect(seller).startAuction();

      const auctionInfo = await myAuction.info();
      expect(auctionInfo.isActive).to.be.true;
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
      const tx = await myAuctionFactory.connect(seller).createAuction(STARTING_PRICE,ONE_DAY,getAddr(myToken),1);
      await tx.wait();  // Wait for the transaction to be mined
      const auctionAddress = await myAuctionFactory.getAuction(1);  // Get the auction address from the factory
      myAuction = await MyAuction.attach(auctionAddress);
      await myToken.connect(seller).approve(auctionAddress, 1);
      await myAuction.connect(seller).startAuction();
    });

    it("should accept valid bid", async function () {
      await myAuction.connect(bidder1).bid({ value: FIRST_BID });

      const auctionState = await myAuction.info();
      expect(auctionState.highestBid).to.equal(FIRST_BID);
      expect(auctionState.highestBidder).to.equal(bidder1.address);
    });

    it("should accept higher bid", async function () {
      await myAuction.connect(bidder1).bid({ value: FIRST_BID });
      await myAuction.connect(bidder2).bid({ value: SECOND_BID });

      const auctionState = await myAuction.info();
      expect(auctionState.highestBid).to.equal(SECOND_BID);
      expect(auctionState.highestBidder).to.equal(bidder2.address);
    });

    it("should reject bid lower than current highest", async function () {
      await myAuction.connect(bidder1).bid({ value: FIRST_BID });
      await expect(
        myAuction.connect(bidder2).bid({ value: STARTING_PRICE })
      ).to.be.revertedWith("Bid too low");
    });

    it("should not allow seller to bid", async function () {
      await expect(
        myAuction.connect(seller).bid({ value: FIRST_BID })
      ).to.be.revertedWith("Seller cannot bid on their own auction");
    });
  });

  describe("End Auction", function () {
    beforeEach(async function () {
      const tx = await myAuctionFactory.connect(seller).createAuction(STARTING_PRICE,ONE_DAY,getAddr(myToken),1);
      await tx.wait();  // Wait for the transaction to be mined
      const auctionAddress = await myAuctionFactory.getAuction(1);  // Get the auction address from the factory
      myAuction = await MyAuction.attach(auctionAddress);
      await myToken.connect(seller).approve(auctionAddress, 1);
      await myAuction.connect(seller).startAuction();
    });

    it("should end auction with no bids correctly", async function () {
      await time.increase(ONE_DAY + 1);
      await myAuction.connect(seller).endAuction();

      expect(await myToken.ownerOf(1)).to.equal(getAddr(seller));
      const auctionState = await myAuction.info();
      expect(auctionState.isActive).to.be.false;
    });

    it("should only allow seller to end auction", async function () {
      await time.increase(ONE_DAY + 1);
      await expect(
        myAuction.connect(bidder1).endAuction()
      ).to.be.revertedWith("Only seller can end the auction");
    });

    it("should not allow bidding on ended auction", async function () {
      await time.increase(ONE_DAY + 1);
      await myAuction.connect(seller).endAuction();
      await expect(
        myAuction.connect(bidder1).bid({ value: FIRST_BID })
      ).to.be.revertedWith("Auction is not active");
    });

    it("should not allow ending auction twice", async function () {
      await time.increase(ONE_DAY + 1);
      await myAuction.connect(seller).endAuction();
      await expect(
        myAuction.connect(seller).endAuction()
      ).to.be.revertedWith("Auction is not active");
    });

    it("should transfer NFT and funds correctly when auction ends with bids", async function () {
      await myAuction.connect(bidder1).bid({ value: FIRST_BID });
      await myAuction.connect(bidder2).bid({ value: SECOND_BID });

      await time.increase(ONE_DAY + 1);
      await myAuction.connect(seller).endAuction();

      expect(await myToken.ownerOf(1)).to.equal(getAddr(bidder2));
    });
  });
});