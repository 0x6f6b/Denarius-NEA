// fetch account button from DOM
const accountsButton = document.getElementById("accounts");

accountsButton.addEventListener("click", () => {
  // send the user to the accounts page
  window.location.href = "./pages/accounts.html";
});
