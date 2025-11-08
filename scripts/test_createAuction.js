const hre = require("hardhat");

const parseEther = ethers.parseEther ?? ethers.utils.parseEther;
  const ONE_DAY = 24 * 60 * 60; // 1 day in seconds

async function main() {
    const [seller] = await hre.ethers.getSigners();
    const MyAuctionFactory = await hre.ethers.getContractFactory("MyAuctionFactory");
    const NFT = await hre.ethers.getContractAt("ERC20", "0xaD0c2cE2AC162145b9aAeB65490E98133F143c89");
    const factory = MyAuctionFactory.connect(seller).attach("0x5BAc5bB988E5603C11cD69BeA907723E418E6Dae");

    const tx = await factory.connect(seller).createAuction(parseEther("0.0001"), ONE_DAY, "0xaD0c2cE2AC162145b9aAeB65490E98133F143c89", 1);
    await tx.wait();
    const auctionAddress = await factory.getAuction(1);
    const myAuction = await hre.ethers.getContractAt("MyAuction", auctionAddress);
    await NFT.connect(seller).approve(auctionAddress, 1);
    await myAuction.connect(seller).startAuction();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});