const crypto = require('crypto');
const nanoid = require('nanoid');

/**
 *
 * @param {any} val
 * @return {boolean}
 */
const isObject = val => typeof val === 'object' && val !== null;

/**
 *
 * @param {Error} err
 * @return {string}
 */
const formatErr = err => {
  return `${err} | ${err.stack.split('\n').slice(0, 2).join('\n')}`;
};

/**
 *
 * @param {string} bytes
 * @return {string}
 */
const genRandToken = (bytes = 64) => {
  return crypto.randomBytes(bytes).toString('base64url');
};

/**
 *
 * @param {number} len
 * @return {string}
 */
const genRandString = len => {
  return nanoid(len);
};

module.exports = {
  isObject,
  formatErr,
  genRandToken,
  genRandString,
};
