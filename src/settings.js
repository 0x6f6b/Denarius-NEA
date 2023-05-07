const { writeFileSync } = require("fs");

const settingsForm = document.getElementById("server-settings");

// if there is a config file, load the server IP and port and prepopulate the form with them
try {
  const config = JSON.parse(readFileSync(getAppdataPath() + "/config.json"));
  document.getElementById("server-ip").value = config.serverIP;
  document.getElementById("server-port").value = config.serverPort;
} catch (_err) {
  console.log("No config file found");
}

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("Saving settings");

  const formData = new FormData(settingsForm);

  const serverIP = formData.get("server-ip");
  const serverPort = formData.get("server-port");

  // store the server IP and port in a config file
  const config = {
    serverIP,
    serverPort,
  };
  try {
    writeFileSync(getAppdataPath() + "/config.json", JSON.stringify(config));
    console.log("Settings saved");

    // reload the page to apply the new settings
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
});
