const uuid = require("uuid");
const Peer = require("peerjs").Peer;
const { Transaction } = require("../src/Transaction.js");

var peer = new Peer(uuid.v4(), {
  host: "13.48.124.177",
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
