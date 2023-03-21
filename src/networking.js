const uuid = require("uuid");
const Peer = require("peerjs").Peer;

const peerList = [];

const peer = new Peer(uuid.v4(), {
  host: "13.50.13.83",
  port: 9000,
  path: "/denarius",
});

setInterval(() => {
  peer.listAllPeers((peers) => {
    console.log(peers);
  });
}, 1000);

peer.on("open", (id) => {
  console.log("My peer ID is: " + id);
});
