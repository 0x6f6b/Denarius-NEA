const { Level } = require("level");
const { getAppdataPath } = require("../src/platform.js");

window.accounts = new Level(getAppdataPath() + "/accounts", {
  valueEncoding: "json",
});

window.blockchain = new Level(getAppdataPath() + "/blockchain", {
  valueEncoding: "json",
});

window.mempool = new Level(getAppdataPath() + "/mempool", {
  valueEncoding: "json",
});

console.log("Databases initialized");
