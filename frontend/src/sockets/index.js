// socket.js
import { io } from "socket.io-client";
import CONSTANTS from "../constants";

export default (provider, email, userId, folderName) =>
  io(CONSTANTS.BACKEND_URL, {
    auth: {
      provider,
      email,
      userId,
      folderName,
    },
    withCredentials: true,
  });
