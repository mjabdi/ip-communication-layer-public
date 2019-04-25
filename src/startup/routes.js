const express = require('express');
const health = require('../routes/health');
const index = require('../routes/index');

module.exports = (app) => {
  app.use(express.json());
  app.use('/health', health);
  app.use('/' , index );
  //.. add other routes here
  //..
}