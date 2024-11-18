const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: "localhost",
  dialect: "postgres",
  define: {
    freezeTableName: true,
  },
});

module.exports = sequelize;
