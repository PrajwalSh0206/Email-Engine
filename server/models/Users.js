const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Users = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true, // E.g., "Gmail", "Yahoo"
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

module.exports = { Users };
