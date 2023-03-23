const { createHash } = require("crypto");
const { readFileSync } = require("fs");
const { getSystemInformation } = require("../src/platform.js");

// open the "accounts.txt file" and read each line
const accountsBuffer = readFileSync(
  getAppdataPath() + "/accounts/accounts.txt"
);

const accountList = accountsBuffer.toString().split("\n");

const accountsSelect = document.getElementById("accounts");

accountList.forEach((account) => {
  if (account == "") {
    return;
  }

  const accountOption = document.createElement("option");
  accountOption.value = account;
  accountOption.innerText = account;

  accountsSelect.appendChild(accountOption);
});

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

  await window.blockchain.open();
  await window.blockchain.put(genesis.hash, genesis.toString());
  await window.blockchain.put("lastHash", genesis.hash);
  await window.blockchain.close();

  console.log("Genesis block created");
}

async function checkForExistingBlockchain() {
  await window.blockchain.open();

  // a blockchain already exists if the genesis block exists
  window.blockchain
    .get("0")
    .then((value) => {
      console.log("Blockchain already exists");
    })
    .catch((err) => {
      console.log("No blockchain found");
      genesisBlock();
    });

  await window.blockchain.close();
}

async function deleteExistingBlockchain() {
  await window.blockchain.open();
  await window.blockchain.clear();
  await window.blockchain.close();
  console.log("Blockchain data deleted");
}

const mineButton = document.getElementById("mine-button");

mineButton.addEventListener("click", async () => {
  await checkForExistingBlockchain(); // check for the presence of the genesis block

  await mine();
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
  // Check local mempool for pending transactions
  await window.mempool.open();

  // get the local mempool
  const transactions = await window.mempool
    .get("transactions")
    .then((value) => {
      return value;
    })
    .catch((err) => {
      return [];
    });

  console.log("Transactions in mempool: " + transactions.length);

  // get the last block in the blockchain
  const lastHash = await window.mempool.get("lastHash");

  const block = new Block(transactions, lastHash);
  await block.proofOfWork(TARGET);
}

updatePendingTransactions();
function updatePendingTransactions() {
  // fetch pending transactions from other nodes
  // add them to the local mempool
  const peerList = [];

  peer.listAllPeers((peers) => {
    for (const discoveredPeer of peers) {
      if (discoveredPeer !== peer.id) {
        peerList.push(discoveredPeer);
      }
    }

    for (const peerId of peerList) {
      const conn = peer.connect(peerId);
      conn.on("open", () => {
        conn.send({ type: "fetchMempool" });

        conn.on("data", (data) => {
          if (data.type == "mempool") {
            console.log("Received mempool from peer");
            console.log(data.transactions);

            // get the current mempool
            window.mempool
              .get("transactions")
              .then((value) => {
                console.log("Current mempool: " + JSON.stringify(value));
                // add the new transactions to the current mempool

                const newTx = [];
                for (transaction of value) {
                  for (const tx of data.transactions) {
                    if (transaction.signature !== tx.signature) {
                      newTx.push(tx);
                    } else {
                      console.log("Duplicate transaction!");
                    }
                  }
                }

                const newMempool = value.concat(newTx);

                // update the mempool
                window.mempool.put("transactions", newMempool);
              })
              .catch((err) => {
                console.log(err);
                console.log("No mempool found");
                // no mempool exists, create a new one
                window.mempool.put("transactions", data.transactions);
              });
          }
        });
      });
    }
  });
}
