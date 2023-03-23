const { totalmem } = require("os");
const { osInfo, cpu } = require("systeminformation");
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

async function getSystemInformation() {
  const cpuData = await cpu();
  const osData = await osInfo();

  const data = await fetch("https://api.ipify.org?format=json");
  const publicIP = await data.json();

  const systemInformation = {
    hostname: osData.hostname,
    platform: osData.codename + " " + osData.arch,
    release: osData.release,
    cpu: cpuData.vendor + " " + cpuData.brand,
    cpuCores: cpuData.cores,
    memory: Math.round(totalmem() / 1024 / 1024) + " MB",
    publicIP: publicIP.ip,
  };

  return systemInformation;
}

module.exports = {
  getAppdataPath,
  getSystemInformation,
};
