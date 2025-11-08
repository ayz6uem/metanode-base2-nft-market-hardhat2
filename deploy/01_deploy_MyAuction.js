const { ethers, upgrades } = require("hardhat");

const getAddr = (c) => (typeof c === 'string' ? c : (c?.address ?? c?.target));

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  
  console.log("开始部署MyAuction合约...");
  const MyAuction = await ethers.getContractFactory("MyAuction");
  const MyAuctionImpl = await upgrades.deployImplementation(MyAuction);
  console.log("部署完成MyAuction合约 :", MyAuctionImpl);

  console.log("开始部署PriceProvider合约...");
  const PriceProvider = await ethers.getContractFactory("PriceProvider");
  const priceProvider = await PriceProvider.deploy();
  await priceProvider.waitForDeployment();
  console.log("部署完成PriceProvider合约 :", priceProvider);

  console.log("开始部署MyAuctionFactory合约...");
  const MyAuctionFactory = await ethers.getContractFactory("MyAuctionFactory");
  const myAuctionFactoryProxy = await upgrades.deployProxy(MyAuctionFactory, [getAddr(deployer), getAddr(priceProvider), getAddr(MyAuctionImpl)], {
    kind: "uups",
  });
  console.log("部署完成MyAuctionFactory合约 :", getAddr(myAuctionFactoryProxy));
};
module.exports.tags = ['MyAuction'];