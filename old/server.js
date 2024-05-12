const express = require("express");
const BigNumber = require("bignumber");
const { ethers } = require("ethers");
const { Web3 } = require("web3");

// Replace with the actual test BNB RPC endpoint URL
const bnbrpcUrl =
  // "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
  "https://bsc-testnet.public.blastapi.io";
const app = express();
const port = 3000;

async function getBlockNumber() {
  const provider = new ethers.providers.JsonRpcProvider(bnbrpcUrl);
  const blockNumber = await provider.getBlockNumber();
  return blockNumber; // new BigNumber(blockNumber).toString();
}

// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";

// Create a new Ethereum wallet
async function createWallet() {
  const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
  const web3 = new Web3(web3Provider);
  //console.log("f");
  const wallet = web3.eth.accounts.create();
  console.log(`New wallet address: ${wallet.address}`);
  web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ", result);
  });
  return wallet;
}

app.get("/", async (req, res) => {
  try {
    const latestBlockNumber = await getBlockNumber();
    const wallet = await createWallet();

    res.send(
      `The latest block number on the test BNB network is: ${latestBlockNumber}.holesky New wallet address: ${wallet.address}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching block number");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
