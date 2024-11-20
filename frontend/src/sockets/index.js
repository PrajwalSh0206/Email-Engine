// socket.js
import { io } from "socket.io-client";
import CONSTANTS from "../constants";

export default (provider, email, userId) =>
  io(CONSTANTS.BACKEND_URL, {
    auth: {
      provider,
      email,
      userId,
    },
    withCredentials: true,
  });
