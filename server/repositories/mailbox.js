const { where } = require("sequelize");
const { Mailbox } = require("../models/index");

async function create(data) {
  return Mailbox.create(data);
}

async function findMail(attributes, condition, order = []) {
  return Mailbox.findOne({
    attributes,
    where: condition,
    order: order,
  });
}

async function updateMail(data, condition) {
  return Mailbox.update(data, {
    where: condition,
  });
}

async function createIfNotExist(data, condition) {
  let result = await find(["id"], condition);
  if (result) {
    await updateMail(data, condition);
  } else {
    result = await create({ ...data, ...condition });
  }
  return result;
}

async function createOrUpdateMail(data, condition) {
  let result = await findMail(["id"], condition);
  if (result) {
    const { status } = data;
    let statusResult = await findMail(["id"], { ...condition, status });
    if (!statusResult) await updateMail({ status }, condition);
  } else {
    result = await create({ ...data, ...condition });
  }
  return result;
}

async function findWithLimit(attributes, condition, offset, limit) {
  return Mailbox.findAll({
    attributes,
    offset: parseInt(offset),
    limit: parseInt(limit),
    order: [["messageId", "DESC"]], // Sort by newest first
    where: condition,
  });
}

module.exports = { create, createIfNotExist, findMail, findWithLimit, updateMail, createOrUpdateMail };
