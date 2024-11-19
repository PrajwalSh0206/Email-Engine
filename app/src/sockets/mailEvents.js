module.exports = (socket, callback) => {
  socket.on("connect", () => {
    console.log(socket.connected); // true
  });

  socket.on("updateEmail", (message) => {
    callback("updateEmail", message);
  });
};
