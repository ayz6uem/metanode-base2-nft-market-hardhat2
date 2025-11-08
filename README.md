# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

### 升级说明

```shell

## 启动本地节点

npx hardhat node

## 注意获取 proxyAddress 后的值

## 复制scripts脚本到 deploy

npx hardhat deploy --tags depolyAuctionFactoryV2 --network localhost

## 运行测试

npx hardhat test test/auction.js --network localhost

```
