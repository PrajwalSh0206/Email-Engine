const crypto = require("crypto");
const nanoid = require("nanoid");

/**
 *
 * @param {any} val
 * @return {boolean}
 */
const isObject = (val) => typeof val === "object" && val !== null;

/**
 *
 * @param {Error} err
 * @return {string}
 */
const formatErr = (err) => {
  return `${err} | ${err.stack.split("\n").slice(0, 2).join("\n")}`;
};

/**
 *
 * @param {string} bytes
 * @return {string}
 */
const genRandToken = (bytes = 64) => {
  return crypto.randomBytes(bytes).toString("base64url");
};

/**
 *
 * @param {number} len
 * @return {string}
 */
const genRandString = (len) => {
  return nanoid(len);
};

// Formatter for date only
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Formatter for time only
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true, // For AM/PM formatting
});

const convertArrayToObj = (arr = [], id) => {
  let obj = {};
  arr.forEach((value) => {
    let objId = value[id];
    obj[objId] = value;
  });
  return obj;
};

module.exports = {
  isObject,
  formatErr,
  genRandToken,
  genRandString,
  dateFormatter,
  timeFormatter,
  convertArrayToObj,
};
