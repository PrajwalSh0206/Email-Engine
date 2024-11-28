export default (socket, callback) => {
  socket.on("updateEmail", (message) => {
    callback("updateEmail", message);
  });

  socket.on("newEmail", (message) => {
    callback("newEmail", message);
  });
};
