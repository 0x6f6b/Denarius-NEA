const { pbkdf2Sync, createHmac } = require("crypto");
const { normalize } = require("path");
const { appendFileSync } = require("node:fs");
const { Level } = require("level");
const HDKey = require("hdkey");
const path = require("path");

function getAppdataPath() {
  const platform = process.platform;

  switch (platform) {
    case "darwin":
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "Denarius"
      );
    case "win32":
      return path.join(process.env.APPDATA, "Denarius");
    case "linux":
      return path.join(process.env.HOME, ".denarius");
    default:
      throw new Error("Unsupported platform");
  }
}

function generateSeed(phrase) {
  const phraseBuffer = Buffer.from(normalize(phrase), "utf8");

  return pbkdf2Sync(phraseBuffer, "mnemonic", 2048, 64, "sha512");
}

function generatePrivateKey(seedphrase) {
  const seed = generateSeed(seedphrase);

  // Use the HDKey library to generate the private key
  const hdkey = HDKey.fromMasterSeed(seed);

  const privateKey = hdkey.privateKey.toString("hex");
  console.log(privateKey + " is the private key");

  return privateKey;
}

async function storeAccount(accountName, privateKey) {
  // Write private key to database using private key
  const db = new Level(getAppdataPath() + "/accounts", {
    valueEncoding: "json",
  });
  await db.open();
  await db.put(accountName, privateKey);
  await db.close();

  // add the account name to a file so they can be iterated throuh
  appendFileSync(
    getAppdataPath() + "/accounts/accounts.txt",
    accountName + "\n"
  );

  refreshAccountList();
}

module.exports = { getAppdataPath, generatePrivateKey, storeAccount };
