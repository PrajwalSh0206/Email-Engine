const { Mailbox } = require("../models/index");

async function create(data) {
  return Mailbox.create(data);
}

async function find(attributes, condition) {
  return Mailbox.findOne({
    attributes,
    where: condition,
  });
}

async function createIfNotExist(data, condition) {
  let result = await find(["id"], condition);
  if (!result) {
    result = await create(data);
  }
  return result;
}

module.exports = { create, createIfNotExist };
