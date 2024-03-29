'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

// const {Sequelize} = require("sequelize")


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ownerId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      address: {
        type: Sequelize.STRING,
        allowNull:false
      },
      city: {
        type: Sequelize.STRING,
        allowNull:false
      },
      state: {
        type: Sequelize.STRING,
        allowNull:false
      },
      country: {
        type: Sequelize.STRING,
        allowNull:false
      },
      lat: {
        type: Sequelize.DECIMAL,
        allowNull:true
      },
      lng: {
        type: Sequelize.DECIMAL,
        allowNull:true,

      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING(1500)
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      // deletedAt: {
      //   type: Sequelize.DATE,
      //   allowNull: false
      // }
    },
    // Sequelize,
    options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.dropTable('Spots');
  }
};
