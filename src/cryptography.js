const { normalize } = require("path");
const { appendFileSync, existsSync, mkdirSync } = require("fs");
const { fromSeed } = require("bip32");
const { pbkdf2Sync } = require("crypto");
const { getAppdataPath } = require("../src/platform.js");
const { Level } = require("level");

function generatePrivateKey(seedphrase) {
  const seed = generateSeed(seedphrase);
  const genKey = fromSeed(seed);

  const extendedPublicKey = genKey.neutered().toBase58();
  const extendedPrivateKey = genKey.toBase58();

  console.log(extendedPrivateKey);
  console.log(extendedPublicKey);

  return { extendedPrivateKey, extendedPublicKey };
}

function generateSeed(phrase) {
  const phraseBuffer = Buffer.from(normalize(phrase), "utf8");

  return pbkdf2Sync(phraseBuffer, "mnemonic", 2048, 64, "sha512");
}

async function storeAccount(
  accountName,
  extendedPrivateKey,
  extendedPublicKey
) {
  // create the accounts directory if it doesn't exist
  if (!existsSync(getAppdataPath() + "/accounts")) {
    mkdirSync(getAppdataPath() + "/accounts");
  }

  console.log(1);

  // Write private key to database using private key
  console.log(1.1);
  await window.accounts.open();
  console.log(1.2);
  await window.accounts.put(accountName, {
    extendedPrivateKey,
    extendedPublicKey,
  });
  console.log(1.3);
  await window.accounts.close();
  console.log(1.4);

  console.log(2);

  // add the account name to a file so they can be iterated throuh
  try {
    // create the accounts directory if it doesn't exist
    if (!existsSync(getAppdataPath() + "/accounts")) {
      mkdirSync(getAppdataPath() + "/accounts");
    }

    console.log(3);

    appendFileSync(
      getAppdataPath() + "/accounts/accounts.txt",
      accountName + "\n"
    );

    console.log(4);
    // reload the page
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
}

async function getAccountData(accountName) {
  console.log("accountName: " + accountName);
  await window.accounts.open();
  const data = await window.accounts.get(accountName);
  await window.accounts.close();

  console.log("data: " + data);

  return data;
}

module.exports = {
  generatePrivateKey,
  storeAccount,
  getAccountData,
};
