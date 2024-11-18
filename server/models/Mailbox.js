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
  subject: {
    type: DataTypes.STRING,
    allowNull: false, // Subject of the email
  },
  text: {
    type: DataTypes.TEXT, // Email body content
    allowNull: false,
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false, // Sender email address
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false, // Date the email was sent or received
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
