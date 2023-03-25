const TARGET = 0xa59cd2e4d5ae06dc823f9ef9d8adaa633a91a5935584e2135aff04d6a76n;
const REWARD = 50;

class Block {
  constructor(transactions, previousHash) {
    this.transactions = transactions;
    this.previousHash = previousHash;
  }

  // Proof of Work (PoW) consensus algorithm
  async proofOfWork(target, minerAddress) {
    // add the miner's address to the block
    this.miner = minerAddress;

    // for debugging purposes
    target = TARGET;

    this.nonce = 0;
    this.timestamp = Date.now();

    let hash = this.calculateHash();
    let hashValue = BigInt("0x" + hash);

    const startTime = Date.now();
    let hashed = 0;
    while (hashValue > target) {
      this.timestamp = Date.now();
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
  }

  // Convert entire block to a string by overriding the toString() method
  toString() {
    return JSON.stringify(this);
  }

  calculateHash() {
    // hash the block using SHA-256
    // hash specific properties of the block
    const hash = createHash("sha256")
      .update(
        this.previousHash +
          this.timestamp +
          this.nonce +
          this.transactions +
          this.miner
      )
      .digest("hex");

    return hash;
  }
}

module.exports = { Block, TARGET, REWARD };
