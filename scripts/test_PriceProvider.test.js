const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const PriceProvider = await hre.ethers.getContractFactory("PriceProvider");
    const priceProvider = PriceProvider.connect(deployer).attach("0xa3D9f334eCdfA17E83d937Ad39A9438D36aF9235");
    await priceProvider.putPriceData("0x0000000000000000000000000000000000000000", "0x694AA1769357215DE4FAC081bf1f309aDC325306");

    console.log(await priceProvider.getPrice("0x0000000000000000000000000000000000000000"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});