const { readFileSync } = require("node:fs");
const { getAppdataPath, getAccountData } = require("../src/utils");
const HDKey = require("hdkey");
const { createSign, createPrivateKey } = require("crypto");

class Transaction {
  constructor(
    sender, // public key of the sender
    recipient, // public key of the recipient
    amount, // amount of money to be sent
    description = "", // description of the transaction
    timestamp = Date.now() // timestamp of the transaction
  ) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.description = description;
    this.timestamp = timestamp;
  }

  sign(genKey) {
    console.log(genKey);

    const txData = JSON.stringify({
      sender: this.sender,
      recipient: this.recipient,
      amount: this.amount,
      description: this.description,
      timestamp: this.timestamp,
    });
  }
}

const transactionMetadata = document.getElementById("transaction-metadata");

// open the "accounts.txt file" and read each line
const accountsBuffer = readFileSync(
  getAppdataPath() + "/accounts/accounts.txt"
);

const accountList = accountsBuffer.toString().split("\n");

const accountsSelect = document.getElementById("accounts");

accountList.forEach((account) => {
  console.log("account:", account);
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
  const { privateKey, publicKey, genKey } = await getAccountData(sender);

  // create a new transaction
  const transaction = new Transaction(publicKey, recipient, amount, reference);

  // sign the transaction
  transaction.sign(genKey);
});

module.exports = Transaction;
