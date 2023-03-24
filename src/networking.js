const uuid = require("uuid");
const Peer = require("peerjs").Peer;
const { Transaction } = require("../src/Transaction.js");
const { Block, TARGET, REWARD } = require("../src/Block.js");

var peer = new Peer(uuid.v4(), {
  host: "13.50.246.63",
  port: 9000,
  path: "/denarius",
});

peer.on("open", (id) => {
  console.log("My peer ID is: " + id);
});

peer.on("connection", (conn) => {
  console.log("Connected to peer");
  conn.on("data", async (data) => {
    switch (data.type) {
      case "transaction":
        console.log("Received transaction");
        await addToMempool(data.data);
        break;
      case "fetchMempool":
        console.log("Received request for mempool");
        await sendMempool(conn);
        break;
      case "block":
        console.log("Received block");
        await addBlock(data.data);
    }
  });
});

async function addToMempool(transaction) {
  console.log("Verifying transaction authenticity");
  const txData = new Transaction();
  Object.assign(txData, transaction);
  console.log("Transaction Authentic:", txData.verify());
  const authentic = txData.verify();

  // place the transaction in the transaction pool
  // if the transaction is valid
  if (authentic) {
    console.log("Adding transaction to mempool");

    await window.mempool.open();
    // get the mempool accounting for the possibility that it doesn't exist
    const transactions = await window.mempool
      .get("transactions")
      .then((value) => {
        return value;
      })
      .catch((err) => {
        return [];
      });
    transactions.push(transaction);
    await window.mempool.put("transactions", transactions);

    console.log("Transaction added to mempool");
    console.log("Mempool:", transactions);

    await window.mempool.close();
  }
}

async function sendMempool(conn) {
  await window.mempool.open();
  const transactions = await window.mempool
    .get("transactions")
    .then((value) => {
      return value;
    })
    .catch((err) => {
      return [];
    });

  await window.mempool.close();

  conn.send({ type: "mempool", transactions: transactions });
}

async function addBlock(block) {
  // add the block to the blockchain

  // check if the block is valid
  console.log("Verifying block authenticity");
  console.log(JSON.stringify(block));

  // check that the hash is less than the target
  // hash the block
  const blockReceived = new Block();
  Object.assign(blockReceived, block);

  const hash = blockReceived.calculateHash();
  console.log("Hash:", hash);

  // check that the hash is less than the target
  const hashInt = BigInt("0x" + hash);

  if (hashInt < TARGET) {
    console.log("Block hash is valid");
  }

  // check that the transactions within the block are valid
  const transactions = block.transactions;
  for (const transaction of transactions) {
    const txData = new Transaction();
    Object.assign(txData, transaction);
    console.log("Transaction Authentic:", txData.verify());
    const authentic = txData.verify();

    if (!authentic) {
      console.log("Block is invalid");
      return;
    }
  }

  console.log("Block is valid");

  // add the block to the local blockchain
  const prevBlockHash = block.previousHash;

  await window.blockchain.open();
  const lastHashInDatabase = await window.blockchain.get("lastHash");

  if (prevBlockHash !== lastHashInDatabase) {
    console.log("Block is not the next block in the local chain");
    return;
  }

  // add the block to the local blockchain
  await window.blockchain.put("lastHash", block.hash);
  await window.blockchain.put(block.hash, block);

  await window.blockchain.close();

  // update account balances in the local balances database
  await updateBalances(transactions);

  // credit the miner
  if (block.miner !== "genesis") {
    await creditMiner(block.miner);
  }
}

async function updateBalances(transactions) {
  // update the balances database
  console.log("Updating balances database");
  await window.balances.open();

  for (const transaction of transactions) {
    const sender = transaction.sender;
    const receiver = transaction.receiver;
    const amount = transaction.amount;

    // get the sender's balance
    const senderBalance = await window.balances
      .get(sender)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        return 0;
      });

    // get the receiver's balance
    const receiverBalance = await window.balances
      .get(receiver)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        return 0;
      });

    // update the balances
    await window.balances.put(sender, senderBalance - amount);
    await window.balances.put(receiver, receiverBalance + amount);
  }

  await window.balances.close();
}

async function creditMiner(miner) {
  console.log("Crediting miner");
  await window.balances.open();

  // get the miner's balance
  const minerBalance = await window.balances
    .get(miner)
    .then((value) => {
      return value;
    })
    .catch((err) => {
      return 0;
    });

  // update the miner's balance
  await window.balances.put(miner, minerBalance + REWARD);

  await window.balances.close();
}
