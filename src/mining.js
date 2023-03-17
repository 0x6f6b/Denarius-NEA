const { Level } = require("level");
const { createHash } = require("node:crypto");
const { getAppdataPath, getSystemInformation } = require("../src/utils");

const TARGET = 0xa59cd2e4d5ae06dc823f9ef9d8adaa633a91a5935584e2135aff04d6a76n;

class Block {
  constructor(transactions, previousHash) {
    this.transactions = transactions;
    this.previousHash = previousHash;
  }

  // Proof of Work (PoW) consensus algorithm
  async proofOfWork(target) {
    // for debugging purposes
    target = TARGET;

    this.nonce = 0;

    let hash = this.calculateHash();
    let hashValue = BigInt("0x" + hash);

    const startTime = Date.now();
    let hashed = 0;
    while (hashValue > target) {
      this.nonce = Math.random().toString();
      hash = this.calculateHash();

      hashed++;

      if (hashed % 100000 == 0) {
        const time = Date.now() - startTime;
        const hashrate = Math.round(hashed / (time / 1000));
        const megaHashrate = hashrate / 1000000;

        await setValueOfHashHolder(megaHashrate);
      }

      hashValue = BigInt("0x" + hash);
    }

    console.log("Found proof of work: " + hash);
    this.hash = hash;
    this.timestamp = Date.now();
  }

  // Convert entire block to a string by overriding the toString() method
  toString() {
    return JSON.stringify(this);
  }

  calculateHash() {
    const hash = createHash("sha256").update(this.toString()).digest("hex");

    return hash;
  }
}

// This function must be called if the blockchain is empty (the beginning of the blockchain)
async function genesisBlock() {
  console.log("Creating genesis block");
  const transactions = [];
  const previousHash = "0";
  const genesis = new Block(transactions, previousHash);

  await genesis.proofOfWork(TARGET);

  const db = new Level(getAppdataPath() + "/blockchain");
  await db.open();
  db.put(genesis.hash, genesis.toString());
  await db.close();

  console.log("Genesis block created");
}

async function checkForExistingBlockchain() {
  const db = new Level(getAppdataPath() + "/blockchain");
  await db.open();

  // a blockchain already exists if the genesis block exists
  db.get("0")
    .then((value) => {
      console.log("Blockchain already exists");
    })
    .catch((err) => {
      console.log("No blockchain found");
      genesisBlock();
    });

  await db.close();
}

async function deleteExistingBlockchain() {
  const db = new Level(getAppdataPath() + "/blockchain");
  await db.open();
  await db.clear();
  await db.close();
  console.log("Blockchain data deleted");
}

const mineButton = document.getElementById("mine-button");

let mining = false;
mineButton.addEventListener("click", async () => {
  mining = !mining;

  if (mining) {
    await checkForExistingBlockchain(); // check for the presence of the genesis block

    await mine();
  }
});

const resetBlockchainButton = document.getElementById("reset-blockchain");
resetBlockchainButton.addEventListener("click", async () => {
  console.log("Resetting Blockchain Data");
  deleteExistingBlockchain();
});

// populate the system information panel
(async () => {
  const systemInformation = document.getElementById("system-info");

  systemInformation.innerHTML = "Fetching system information...";

  const sysinfo = await getSystemInformation();
  systemInformation.innerHTML = `
  <p>Hostname: ${sysinfo.hostname}</p>
  <p>Platform: ${sysinfo.platform}</p>
  <p>CPU: ${sysinfo.cpu}</p>
  <p>CPU Cores: ${sysinfo.cpuCores}</p>
  <p>Total Memory: ${sysinfo.memory}</p>
  <p>External IP: ${sysinfo.publicIP}</p>
`;
})();

async function setValueOfHashHolder(megaHashrate) {
  // sleep for 10ms to prevent the UI from freezing
  await new Promise((resolve) => setTimeout(resolve, 10));
  document.getElementById("hash-holder").innerHTML =
    "Hashrate: " + megaHashrate + " MH/s";
}

async function mine() {
  // firstly, setup the peer
  const { setupPeer } = require("../src/networking");
  setupPeer();
}
