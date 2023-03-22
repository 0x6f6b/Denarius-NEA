class Transaction {
  constructor(
    sender, // public key of the sender
    recipient, // public key of the recipient
    amount, // amount of money to be sent
    description = "", // description of the transaction
    timestamp = Date.now(), // timestamp of the transaction
    signature = ""
  ) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.description = description;
    this.timestamp = timestamp;
    this.signature = signature;
  }

  sign(xpriv) {
    const txData = JSON.stringify({
      sender: this.sender,
      recipient: this.recipient,
      amount: this.amount,
      description: this.description,
      timestamp: this.timestamp,
    });

    const txHash = createHash("sha256").update(txData).digest(); // hash in buffer format

    const genKey = HDKey.fromExtendedKey(xpriv);

    const signature = genKey.sign(txHash);

    // convert signature from buffer to hex
    this.signature = signature.toString("hex");

    console.log(this.verify());
  }

  verify() {
    const txData = JSON.stringify({
      sender: this.sender,
      recipient: this.recipient,
      amount: this.amount,
      description: this.description,
      timestamp: this.timestamp,
    });

    const signature = Buffer.from(this.signature, "hex");

    const txHash = createHash("sha256").update(txData).digest(); // hash in buffer format

    // verify the signature using the public key to check it worked
    const hdKey = HDKey.fromExtendedKey(this.sender);
    const verified = hdKey.verify(txHash, signature);

    return verified;
  }
}

module.exports = { Transaction };
