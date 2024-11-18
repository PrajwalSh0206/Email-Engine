const sequelize = require("../config/database");
const { Users } = require("./Users");
const { Mailbox } = require("./Mailbox");

// Set up associations
Users.hasMany(Mailbox, { foreignKey: "userId", as: "mailboxes" });
Mailbox.belongsTo(Users, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, Users, Mailbox };
