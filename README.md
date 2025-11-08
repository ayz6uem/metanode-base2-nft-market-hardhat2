# NFT Marketplace - 拍卖合约系统

一个基于 Hardhat 构建的 NFT 拍卖市场，支持多种代币支付和可升级合约架构。

## 🎯 项目概述

这是一个功能完整的 NFT 拍卖市场系统，实现了以下核心功能：

- **多代币支持**：支持 ETH 和 ERC20 代币竞价
- **价格预言机**：使用 Chainlink 价格预言机实现公平的跨代币竞价
- **动态手续费**：基于 USD 价值的阶梯式手续费计算
- **可升级架构**：使用 UUPS 模式实现合约安全升级
- **工厂模式**：统一的拍卖创建和管理

## 🏗️ 系统架构

### 核心智能合约

#### 1. MyAuction.sol - 核心拍卖合约
- **功能**：单个 NFT 的拍卖逻辑
- **特性**：
  - 支持 ETH 和 ERC20 代币支付
  - UUPS 可升级模式
  - 动态手续费计算（基础费率 6%）
  - Chainlink 价格预言机集成
  - 安全的 NFT 转移机制
  - 自动竞价退款系统

#### 2. MyAuctionFactory.sol - 拍卖工厂合约
- **功能**：创建和管理多个拍卖实例
- **特性**：
  - ERC1967Proxy 模式创建拍卖
  - 维护所有拍卖的注册表
  - 集中化的升级管理
  - 可拥有的合约权限控制

#### 3. MyAuctionV2.sol - 增强版拍卖合约
- **功能**：MyAuction 的升级版本
- **特性**：向后兼容的增强功能实现

#### 4. PriceProvider.sol - 价格预言机接口
- **功能**：连接 Chainlink 价格源
- **特性**：
  - ERC20 代币到 Chainlink V3 聚合器的映射
  - USD 计价的价格比较
  - 公平的多代币竞价支持

### 辅助合约

#### Token 合约（contracts/tokens/）
- **MyMoney.sol**：测试用 ERC20 代币

## 🧪 测试架构

### 测试文件

1. **MyAuction.t.js** - 核心拍卖功能测试
   - 完整拍卖生命周期测试（创建、开始、竞价、结束）
   - 多代币竞价场景
   - 价格预言机集成测试
   - 手续费计算验证
   - 边界条件和错误处理

2. **MyAuctionUpgrade.t.js** - 合约升级测试
   - UUPS 升级模式测试
   - 升级兼容性验证
   - 升级后功能确认

3. **Price.t.js** - 价格提供者测试
   - 预言机价格获取测试
   - 代币价格映射功能验证

## 🛠️ 技术栈

### 开发依赖
- **@nomicfoundation/hardhat-toolbox**: 核心 Hardhat 功能
- **@openzeppelin/hardhat-upgrades**: 合约升级管理
- **hardhat-deploy**: 部署脚本管理

### 生产依赖
- **@openzeppelin/contracts**: 标准 ERC20、ERC721 和工具合约
- **@openzeppelin/contracts-upgradeable**: 可升级合约实现
- **@chainlink/contracts**: 价格预言机接口和工具

## 📦 安装和设置

### 环境要求
- Node.js >= 16.0.0
- npm 或 yarn

### 安装步骤

```bash
# 克隆仓库
git clone <repository-url>
cd metanode-base2-nft-market-hardhat2

# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署到本地网络
npx hardhat node
npx hardhat run deploy/01_deploy_MyAuction.js --network localhost
```

## 🚀 部署和运行

### 基本命令

```shell
# 查看帮助
npx hardhat help

# 运行测试
npx hardhat test

# 运行测试并查看 gas 报告
REPORT_GAS=true npx hardhat test

# 启动本地节点
npx hardhat node
```

### 合约升级流程

```shell
## 1. 启动本地节点
npx hardhat node

## 2. 部署初始合约（新终端）
npx hardhat deploy --tags deployAuctionFactory --network localhost

## 3. 注意获取 proxyAddress 的值

## 4. 升级合约到 V2 版本
npx hardhat deploy --tags deployAuctionFactoryV2 --network localhost

## 5. 运行测试验证升级
npx hardhat test test/MyAuctionUpgrade.t.js --network localhost
```

## 💡 核心特性详解

### 1. 多代币拍卖系统
- 支持 ETH 和 ERC20 代币竞价
- 使用价格预言机比较 USD 价值
- 确保不同代币间的公平竞价

### 2. 动态手续费结构
- **基础费率**：6% (600/10000)
- **阶梯式模型**：高价值物品享受更低的有效费率
- **USD 计价**：手续费基于 USD 价值计算
- **代币转换**：自动转换回支付代币

### 3. 可升级架构
- **UUPS 模式**：节省 gas 的升级模式
- **工厂模式**：统一的拍卖创建管理
- **OpenZeppelin 标准**：遵循升级安全标准

## 📁 项目结构

```
D:\gowork\metanode-base2-nft-market-hardhat2\
├── contracts/                     # 智能合约
│   ├── MyAuction.sol             # 核心拍卖合约
│   ├── MyAuctionFactory.sol      # 拍卖工厂合约
│   ├── MyAuctionV2.sol           # 增强版拍卖合约
│   ├── providers/                # 提供者合约
│   │   └── PriceProvider.sol     # 价格预言机接口
│   └── tokens/                   # 代币合约
│       └── MyMoney.sol           # 测试用 ERC20 代币
├── test/                         # 测试文件
│   ├── MyAuction.t.js           # 主拍卖测试
│   ├── MyAuctionUpgrade.t.js    # 升级测试
│   └── Price.t.js               # 价格提供者测试
├── deploy/                       # 部署脚本
│   ├── 00_deploy_MyToken.js     # NFT 部署
│   └── 01_deploy_MyAuction.js   # 拍卖合约部署
├── hardhat.config.js             # Hardhat 配置
├── package.json                  # 项目依赖
└── README.md                     # 项目文档
```

## 🔧 使用示例

### 创建拍卖

```javascript
// 部署拍卖工厂
const factory = await ethers.getContractFactory("MyAuctionFactory");
const auctionFactory = await factory.deploy();

// 创建新拍卖
await auctionFactory.createAuction(
    nftAddress,      // NFT 合约地址
    tokenId,         // NFT ID
    startingPrice,   // 起始价格
    duration,        // 拍卖时长
    paymentToken     // 支付代币地址（ETH 使用 0x0）
);
```

### 参与竞价

```javascript
// 获取拍卖实例
const auctionAddress = await auctionFactory.getAuction(auctionId);
const auction = await ethers.getContractAt("MyAuction", auctionAddress);

// 竞价
await auction.placeBid(
    bidAmount,       // 竞价金额
    bidToken         // 竞价代币地址
);
```

## 🔒 安全考虑

- **重入攻击防护**：使用 OpenZeppelin 的 ReentrancyGuard
- **整数溢出保护**：Solidity 0.8+ 内置溢出检查
- **访问控制**：基于角色的权限管理
- **价格操纵防护**：使用去中心化的 Chainlink 预言机

## 📄 许可证

本项目采用特定许可证，详情请查看 LICENSE 文件。

---

**注意**：这是一个用于学习和演示目的的项目。在生产环境使用前，请进行充分的安全审计。

## 测试结果

Version
=======
> solidity-coverage: v0.8.16

Instrumenting for coverage...
=============================

> MyAuction.sol
> MyAuctionFactory.sol
> MyAuctionFactoryV2.sol
> MyAuctionV2.sol
> providers\PriceProvider.sol
> test\MockV3Aggregator.sol
> tokens\MyMoney.sol
> tokens\MyToken.sol

Compilation:
============

Note: Reinitializers are not included in validations by default

    contracts\MyAuctionFactoryV2.sol:22: If you want to validate this function as an initializer, annotate it with '@custom:oz-upgrades-validate-as-initializer'

Compiled 40 Solidity files successfully (evm target: paris).

Network Info
============
> HardhatEVM: v2.27.0
> network:    hardhat



  MyAuction
    Initial State
      ✔ should have correct initial state
    Create Auction
      ✔ should create auction correctly
      ✔ should not allow zero starting price
      ✔ should not allow duration less than 1 day
    Start Auction
      ✔ should start auction correctly
    Bidding
      ✔ should accept valid bid
      ✔ should accept higher bid
      ✔ should reject bid lower than current highest
      ✔ should not allow seller to bid
      ✔ should highestBid is ETH
      ✔ should highestBid is MMO
    End Auction
      ✔ should end auction with no bids correctly
      ✔ should only allow seller to end auction
      ✔ should not allow bidding on ended auction
      ✔ should not allow ending auction twice
      ✔ should transfer NFT and funds correctly when auction ends with bids
bidder2 balance: 10000000000000000000n
bidder2 balance: 6999999999999925036n
sellerBalance: 5000000000000000000n
bidder2 balance: 9999999999999925036n
      ✔ should transfer NFT and funds correctly when auction ends with bids MMO (45ms)

  MyAuctionUpgrade
    Auction Upgrade
      ✔ should create auction correctly
    AuctionFactory Upgrade
address: 0xcD0048A5628B37B8f743cC2FeA18817A29e97270
      ✔ should create auction correctly (41ms)

  test price
price: 4000n
    ✔ it should be get price


  20 passing (2s)

-------------------------|----------|----------|----------|----------|----------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------------|----------|----------|----------|----------|----------------|
 contracts\              |    59.38 |    46.15 |    60.87 |     62.9 |                |
  MyAuction.sol          |      100 |    82.35 |     87.5 |      100 |                |
  MyAuctionFactory.sol   |       90 |       50 |    83.33 |    93.75 |             73 |
  MyAuctionFactoryV2.sol |      100 |       50 |      100 |      100 |                |
  MyAuctionV2.sol        |    11.63 |     8.82 |     12.5 |    16.67 |... 187,188,196 |
 contracts\providers\    |      100 |      100 |      100 |      100 |                |
  PriceProvider.sol      |      100 |      100 |      100 |      100 |                |
 contracts\test\         |    33.33 |      100 |    42.86 |    69.23 |                |
  MockV3Aggregator.sol   |    33.33 |      100 |    42.86 |    69.23 |    43,46,49,55 |
 contracts\tokens\       |      100 |      100 |      100 |      100 |                |
  MyMoney.sol            |      100 |      100 |      100 |      100 |                |
  MyToken.sol            |      100 |      100 |      100 |      100 |                |
-------------------------|----------|----------|----------|----------|----------------|
All files                |    59.81 |    46.15 |    62.86 |    65.52 |                |
-------------------------|----------|----------|----------|----------|----------------|

## 测试网部署地址 Sepolia

MyAuction合约 : 0x76218456bAe93A111480A7DE806c463a31CC3670
PriceProvider合约 : 0xa3D9f334eCdfA17E83d937Ad39A9438D36aF9235
MyAuctionFactory合约 : 0x5BAc5bB988E5603C11cD69BeA907723E418E6Dae

测试网测试流程

```shell
## 添加价格
npx hardhat run scripts/test_PriceProvider.js --network sepolia

## 创建拍卖
npx hardhat run scripts/test_createAuction.js --network sepolia

## 出价
npx hardhat run scripts/test_bid.js --network sepolia

## 结束
npx hardhat run scripts/test_end.js --network sepolia
```