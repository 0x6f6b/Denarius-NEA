const { randomBytes, createHash } = require("crypto");
const { writeFileSync } = require("fs");
const { generatePrivateKey, storeAccount } = require("../src/cryptography.js");

window.onload = () => {
  refreshAccountList();
};

const createAccountBtn = document.getElementById("create-account-btn");
const importAccountBtn = document.getElementById("import-account-btn");

createAccountBtn.addEventListener("click", async () => {
  const seedPhrase = generateSeedPhrase();
  console.log(seedPhrase);
  const seedPhraseCopy = seedPhrase.join(" ");

  // create a modal
  const modal = document.getElementById("seed-phrase-modal");

  // make it visible
  modal.style.display = "block";

  const closeModal = document.getElementById("close-modal");
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // populate the modal with the seed phrase
  const columns = document.querySelectorAll(".seed-phrase-column");
  columns.forEach((column) => {
    column.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const word = seedPhrase.shift();
      const wordDiv = document.createElement("div");

      wordDiv.id = "word";

      wordDiv.innerHTML = word;
      column.appendChild(wordDiv);
    }
  });

  const copyButton = document.getElementById("copy-phrase-btn");
  copyButton.addEventListener("click", () => {
    // copy the seed phrase to the clipboard
    navigator.clipboard.writeText(seedPhraseCopy);

    // change the button text to "copied"
    copyButton.innerHTML = "Copied!";

    // change the button text back to "copy" after 2 seconds
    setTimeout(() => {
      copyButton.innerHTML = "Copy Phrase";
    }, 2000);
  });

  const saveButton = document.getElementById("confirm-phrase-btn");
  saveButton.addEventListener("click", async () => {
    const { extendedPrivateKey, extendedPublicKey } =
      generatePrivateKey(seedPhraseCopy);

    const accountName = document.getElementById("name-account").value;
    if (accountName === "") {
      alert("Please name your account before saving it.");
    } else {
      await storeAccount(accountName, extendedPrivateKey, extendedPublicKey);

      // close the seed phrase modal
      modal.style.display = "none";
    }
  });
});

importAccountBtn.addEventListener("click", async () => {
  const modal = document.getElementById("input-seed-phrase-modal");

  // make it visible
  modal.style.display = "block";

  const closeModal = document.getElementById("close-input-modal");
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const importButton = document.getElementById("confirm-import-phrase-btn");
  importButton.addEventListener("click", () => {
    const seedPhrase = [];

    const inputFields = document.querySelectorAll(".input-word");
    inputFields.forEach((inputField) => {
      seedPhrase.push(inputField.value);
    });

    const seedPhraseCopy = seedPhrase.join(" ");

    const accountName = document.getElementById("input-name-account").value;
    if (accountName === "") {
      alert("Please name your account before saving it.");
    } else {
      const { extendedPrivateKey, extendedPublicKey } =
        generatePrivateKey(seedPhraseCopy);
      storeAccount(accountName, extendedPrivateKey, extendedPublicKey);
      console.log("Stored account", privateKey);
    }
  });
});

function byteToBinaryString(bytes) {
  return bytes.map((byte) => {
    // convert the entropy bytes to multiple binary strings of length 8
    // by padding them if appropriate

    let byteAsBinaryString = byte.toString(2); // (base-2)
    while (byteAsBinaryString.length < 8) {
      byteAsBinaryString = "0" + byteAsBinaryString;
    }

    return byteAsBinaryString;
  });
}

// generate a seed phrase using 256-bit of entropy
function generateSeedPhrase() {
  const wordlist = require("../util/english.json");

  const strength = 256;
  const bytesOfStrength = strength / 8;

  const entropy = randomBytes(bytesOfStrength);

  // convert the random bytes to multiple binary strings of length 8
  const entropyBinaryArray = byteToBinaryString(Array.from(entropy));

  const binaryEntropy = entropyBinaryArray.join("");

  const ent = entropy.length * 8;
  const checksumLength = ent / 32;

  const checksumHash = createHash("sha256").update(entropy).digest();
  const checksumHashBytes = Array.from(checksumHash);

  const checksumBitsArray = byteToBinaryString(checksumHashBytes);

  const binaryChecksum = checksumBitsArray.join("").slice(0, checksumLength);

  const bits = binaryEntropy + binaryChecksum;
  const chunks = bits.match(/(.{1,11})/g);

  const words = chunks.map((binary) => {
    // find the index of the word within the wordlist file
    // convert the binary to a byte
    const byte = parseInt(binary, 2);
    return wordlist[byte];
  });

  return words;
}

function refreshAccountList() {
  const accountsList = document.getElementById("account-list");
  accountsList.innerHTML = "";

  // open the "accounts.txt file" and read each line
  try {
    const accountsBuffer = readFileSync(
      getAppdataPath() + "/accounts/accounts.txt"
    );

    const accounts = accountsBuffer.toString().split("\n");

    accounts.forEach((account) => {
      if (account == "") {
        return;
      }

      const accountButton = document.createElement("div");
      accountButton.classList.add("account-data");

      const accountName = document.createElement("p");
      accountName.classList.add("account-name");
      accountName.innerText = account;
      accountButton.appendChild(accountName);

      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("account-buttons-container");

      const balanceContainer = document.createElement("p");
      balanceContainer.classList.add("account-balance");
      balanceContainer.innerText = "Loading...";
      getLocalBalance(account).then((balance) => {
        console.log("Balance", balance);
        balanceContainer.innerText = balance + " 𐆖";
      });

      const copyAddress = document.createElement("button");
      copyAddress.classList.add("select-account-btn");
      copyAddress.innerText = "Copy Address";

      copyAddress.addEventListener("click", async () => {
        await window.accounts.open();
        const { extendedPublicKey } = await window.accounts.get(account);
        console.log("Copying address", extendedPublicKey);
        await window.accounts.close();

        navigator.clipboard.writeText(extendedPublicKey);

        // change the button text to "copied"
        copyAddress.innerHTML = "Copied!";
        const bgColor = copyAddress.style.backgroundColor;
        copyAddress.style.backgroundColor = "#ccc";

        // change the button text back to "copy address" after 2 seconds
        setTimeout(() => {
          copyAddress.innerHTML = "Copy Address";
          copyAddress.style.backgroundColor = bgColor;
        }, 2000);
      });

      const deleteAccount = document.createElement("button");
      deleteAccount.classList.add("delete-account-btn");
      deleteAccount.innerText = "Delete";

      deleteAccount.addEventListener("click", async () => {
        // remove the account from the accounts.txt file
        const accountsBuffer = readFileSync(
          getAppdataPath() + "/accounts/accounts.txt"
        );

        const accounts = accountsBuffer.toString().split("\n");

        const newAccounts = accounts.filter((acc) => {
          return acc != account;
        });

        const newAccountsString = newAccounts.join("\n");

        writeFileSync(
          getAppdataPath() + "/accounts/accounts.txt",
          newAccountsString
        );

        // remove the account's private key file
        await window.accounts.open();
        await window.accounts.del(account);
        await window.accounts.close();

        // refresh the account list
        refreshAccountList();
      });

      buttonsContainer.appendChild(balanceContainer);
      buttonsContainer.appendChild(copyAddress);
      buttonsContainer.appendChild(deleteAccount);
      accountButton.appendChild(buttonsContainer);

      accountsList.appendChild(accountButton);
    });
  } catch (err) {
    console.log("No accounts found.");
    console.log(err);
    return;
  }
}

async function getLocalBalance(accountName) {
  await window.accounts.open();
  const { extendedPublicKey } = await window.accounts.get(accountName);
  await window.accounts.close();

  await window.balances.open();
  try {
    const balance = await window.balances.get(extendedPublicKey);
    console.log("Balance", balance);
    await window.balances.close();
    return balance;
  } catch (err) {
    console.log("No balance found.");
    console.log(err);
    await window.balances.close();
    return 0;
  }
}

module.exports = { refreshAccountList };
