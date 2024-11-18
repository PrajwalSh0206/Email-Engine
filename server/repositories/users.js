const { Users } = require("../models/index");

async function create(data) {
  return Users.create(data);
}

async function find(attributes, condition) {
  return Users.findOne({
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
