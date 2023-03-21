const uuid = require("uuid");
const Peer = require("peerjs").Peer;

var peer = new Peer(uuid.v4(), {
  host: "16.171.67.146",
  port: 9000,
  path: "/denarius",
});

peer.on("open", (id) => {
  console.log("My peer ID is: " + id);
});

peer.on("connection", (conn) => {
  console.log("Connected to peer");
  conn.on("data", (data) => {
    switch (data.type) {
      case "transaction":
        console.log("Received transaction");
        handleTransaction(data.data);
    }
  });
});

function handleTransaction(transaction) {
  console.log(transaction);
  console.log("Verifying transaction authenticity");
}
