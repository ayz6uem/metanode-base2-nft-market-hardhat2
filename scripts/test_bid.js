const hre = require("hardhat");

const parseEther = ethers.parseEther ?? ethers.utils.parseEther;

async function main() {
    const [seller,bidder] = await hre.ethers.getSigners();
    const MyAuctionFactory = await hre.ethers.getContractFactory("MyAuctionFactory");
    const factory = MyAuctionFactory.connect(bidder).attach("0x5BAc5bB988E5603C11cD69BeA907723E418E6Dae");

    const auctionAddress = await factory.getAuction(1);
    const myAuction = await hre.ethers.getContractAt("MyAuction", auctionAddress);

    await myAuction.connect(bidder).bid("0x0000000000000000000000000000000000000000", parseEther("0.01"), {value : parseEther("0.01")});
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});