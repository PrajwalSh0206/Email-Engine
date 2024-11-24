export default (socket, callback) => {
  socket.on("updateEmail", (message) => {
    callback("updateEmail", message);
  });
};
