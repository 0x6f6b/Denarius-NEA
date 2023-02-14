const { pbkdf2Sync, createHmac } = require("crypto");
const { normalize } = require("path");
const { appendFileSync } = require("node:fs");
const { platform, arch, release, totalmem, cpus } = require("node:os");
const { osInfo, cpu, cpuTemperature } = require("systeminformation");
const axios = require("axios");

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

async function getSystemInformation() {
  const cpuData = await cpu();
  const osData = await osInfo();
  const publicIP = await axios.get("https://api.ipify.org?format=json");

  const systemInformation = {
    hostname: osData.hostname,
    platform: osData.codename + " " + osData.arch,
    release: osData.release,
    cpu: cpuData.vendor + " " + cpuData.brand,
    cpuCores: cpuData.cores,
    memory: Math.round(totalmem() / 1024 / 1024) + " MB",
    publicIP: publicIP.data.ip,
  };

  return systemInformation;
}

module.exports = {
  getAppdataPath,
  generatePrivateKey,
  storeAccount,
  getSystemInformation,
};
