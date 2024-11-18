module.exports = (socket) => {
  socket.on("connect", () => {
    console.log(socket.connected); // true
  });

  socket.on("mail", (message) => {
    let { messageId } = message;
    mail[messageId] = message;
    setMail({ ...mail });
  });
};
