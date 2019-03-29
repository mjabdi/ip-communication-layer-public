const express = require('express');
const router = express.Router();
const server = require('./../server');

router.get('/ready', function (req, res) {
 
  if (server.ready())
  {
    res.json({
      status: 'UP'
    });
  }
  else
  {
    res.status(500).send('server is not ready yet! please wait...');
  }
});

router.get('/live', function (req, res) {
 
  if (server.live())
  {
    res.json({
      status: 'UP'
    });
  }
  else
  {
    res.status(500).send('server is dead!');
  }
});


module.exports = router;
