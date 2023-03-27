// fetch account button from DOM
const accountsButton = document.getElementById("accounts");

accountsButton.addEventListener("click", () => {
  // send the user to the accounts page
  window.location.href = "./pages/accounts.html";
});

const miningButton = document.getElementById("mining");
miningButton.addEventListener("click", () => {
  // send the user to the mining page
  window.location.href = "./pages/mining.html";
});

const transactionsButton = document.getElementById("transact");
transactionsButton.addEventListener("click", () => {
  // send the user to the transactions page
  window.location.href = "./pages/transactions.html";
});

const settingsButton = document.getElementById("settings");
settingsButton.addEventListener("click", () => {
  // send the user to the settings page
  window.location.href = "./pages/settings.html";
});
