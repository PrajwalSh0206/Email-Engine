const { Users } = require("../models/index");

async function create(data) {
  return Users.create(data);
}

async function updateUser(data, condition) {
  return Users.update(data, {
    where: condition,
  });
}

async function findUser(attributes, condition) {
  return Users.findOne({
    attributes,
    where: condition,
  });
}

async function createIfNotExist(data, condition) {
  let result = await findUser(["id"], condition);
  if (!result) {
    result = await create(data);
  }
  return result;
}

module.exports = { findUser, createIfNotExist, updateUser };
