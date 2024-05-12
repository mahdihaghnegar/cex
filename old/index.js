const ethers = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(
  "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d"
);

provider
  .getBlockNumber()
  .then((blockNumber) => {
    console.log(blockNumber);
  })
  .catch((error) => {
    console.error(error);
  });
