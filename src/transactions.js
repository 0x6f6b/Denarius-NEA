const { readFileSync } = require("node:fs");
const { getAppdataPath, getAccountData } = require("../src/utils");
const { createHash } = require("crypto");

const transactionMetadata = document.getElementById("transaction-metadata");

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

// remove the default submit action
transactionMetadata.addEventListener("submit", async (e) => {
  e.preventDefault();

  // get the form data
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;
  const reference = document.getElementById("reference").value;
  const sender = document.getElementById("accounts").value;

  // get the public key corresponding to the selected account
  const { extendedPrivateKey, extendedPublicKey } = await getAccountData(
    sender
  );

  // create a new transaction
  const { Transaction } = require("../src/Transaction.js");

  const transaction = new Transaction(
    extendedPublicKey,
    recipient,
    amount,
    reference
  );

  // sign the transaction
  transaction.sign(extendedPrivateKey);

  broadcastTransaction(transaction);
});

function broadcastTransaction(transaction) {
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
        conn.send({ type: "transaction", data: transaction });
      });
    }
  });
}
