const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { Users } = require("./Users");

const Mailbox = sequelize.define("mailbox", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  folderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    // type: DataTypes.ENUM("read", "unread", "archived"), // Example statuses
    type: DataTypes.STRING,
    defaultValue: "UNSEEN",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
});

module.exports = { Mailbox };
