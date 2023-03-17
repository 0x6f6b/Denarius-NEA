class Transaction {
  constructor(
    sender,
    recipient,
    amount,
    description = "",
    timestamp = Date.now()
  ) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.description = description;
    this.timestamp = timestamp;
  }
}
