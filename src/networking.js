// const Peer = require("peerjs").Peer;

// const peer = new Peer("", {
//   host: "9000-peers-peerjsserver-awwrvjtyuee.ws-eu87.gitpod.io",
//   path: "/denarius",
//   port: 443,
// });

// function setupPeer() {
//   peer.on("open", function (id) {
//     console.log("My peer ID is: " + id);
//   });
// }

// let mempool = [];

// // listen for incoming transactions or blocks from peers
// peer.on("connection", function (conn) {
//   conn.on("data", function (data) {
//     // data is either a transaction or a block
//     if (data.type === "transaction") {
//       // add transaction to mempool
//       mempool.push(data);
//     } else if (data.type === "block") {
//       // verify block contents and add to blockchain
//     }
//   });
// });

// function broadcastBlock(block) {
//   // broadcast a block to all peers
// }

// module.exports = {
//   setupPeer,
//   broadcastBlock,
// };
