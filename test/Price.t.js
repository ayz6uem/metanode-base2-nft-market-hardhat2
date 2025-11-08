const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("test price", function(){
    it("it should be get price", async function(){
        let MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
        let mock = await MockV3Aggregator.deploy(10, "ETH/USD", 4000);
        await mock.waitForDeployment();
        let data = await mock.latestRoundData();
        console.log("price:", data.answer);
    });
});