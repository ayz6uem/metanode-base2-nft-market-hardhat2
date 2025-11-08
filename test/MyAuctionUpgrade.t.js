const { expect } = require("chai");
const { ethers,upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const parseEther = ethers.parseEther ?? ethers.utils.parseEther;
const getAddr = (c) => (typeof c === 'string' ? c : (c?.address ?? c?.target));

describe("MyAuctionUpgrade", function () {
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
    myAuctionFactory = await upgrades.deployProxy(MyAuctionFactory, [getAddr(seller), "0x0000000000000000000000000000000000000000", getAddr(myAuction)], { initializer: 'initialize', kind: 'uups' });

    // Mint token to seller
    await myToken.connect(seller).mint(seller.address);
  });

  describe("Auction Upgrade", function () {
    it("should create auction correctly", async function () {
        const MyAuctionV2 = await ethers.getContractFactory("MyAuctionV2");
        const myAuctionV2 = await MyAuctionV2.deploy();

        await myAuctionFactory.setAuctionImplementation(getAddr(myAuctionV2));

        const tx = await myAuctionFactory.connect(seller).createAuction(STARTING_PRICE,ONE_DAY,getAddr(myToken),1);
        await tx.wait();  // Wait for the transaction to be mined
        const auctionAddress = await myAuctionFactory.getAuction(1);  // Get the auction address from the factory
        myAuction = myAuctionV2.attach(auctionAddress);
        const name = await myAuction.name();

        expect(name).to.equal("poly auctioning");
    });
  });
  

  describe("AuctionFactory Upgrade", function () {
    it("should create auction correctly", async function () {
        const MyAuctionFactoryV2 = await ethers.getContractFactory("MyAuctionFactoryV2");
        await upgrades.upgradeProxy(getAddr(myAuctionFactory), MyAuctionFactoryV2, { call: { fn: 'initializeV2', args:["poly auction"] } });
        console.log("address:", getAddr(myAuctionFactory));
        const myAuctionFactoryV2 = MyAuctionFactoryV2.attach(getAddr(myAuctionFactory));
        
        const name = await myAuctionFactoryV2.name();
        expect(name).to.equal("poly auction");
    });
  });

});