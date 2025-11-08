const hre = require("hardhat");

const parseEther = ethers.parseEther ?? ethers.utils.parseEther;

async function main() {
    const [seller] = await hre.ethers.getSigners();
    const MyAuctionFactory = await hre.ethers.getContractFactory("MyAuctionFactory");
    const factory = MyAuctionFactory.connect(seller).attach("0x5BAc5bB988E5603C11cD69BeA907723E418E6Dae");

    const auctionAddress = await factory.getAuction(1);
    const myAuction = await hre.ethers.getContractAt("MyAuction", auctionAddress);

    await myAuction.connect(seller).endAuction();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});