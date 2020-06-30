const express = require('express');
const path = require('path');
const next = require('next');
const logger = require('../logs');

const expressValidator = require('express-validator');
const http = require("http");
const favicon = require('serve-favicon');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const server = http.createServer(app);




const PORT = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

//var machines = require('./api/machines/machines');
const tasks = require('./lib/tasks.js');
const workOrders = require('./lib/work_orders.js');
const taskLists = require('./lib/task_lists.js');
const pdf = require('./lib/pdf.js');
const crew = require('./lib/crew.js');
const {emailRouter} = require('./lib/email');

global.SERVER_APP_ROOT = __dirname;

nextApp
  .prepare()
  .then(() => {

    app.use(favicon(__dirname + '/../public/static/favicon.ico'));
    app.use(expressValidator());
    app.use(bodyParser.json({limit: '50mb'}));

    //app.use('/api/machines', machines);
    
    app.use(cors({ origin: '*' }));

    //This is how we can send variables like settings from mysql to nextjs
    /*var settings = require('./settings.js');
    app.get('/', (req, res) => {

      //settings.doGetAll(nextApp, database,req,res);
      
      //settings.handleRequest(nextApp, database, req, res);
    });*/

    app.use('/scheduling/tasks', tasks);
    app.use('/scheduling/workOrders', workOrders);
    app.use('/scheduling/taskLists', taskLists);
    app.use('/scheduling/pdf', pdf);
    app.use('/scheduling/email', emailRouter);
    app.use('/scheduling/crew', crew);

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, err => {
      if (err) throw err;
      logger.info(`> Ready on localhost:${PORT}`);
    });


  })
  .catch(ex => {
    logger.error(ex.stack);
    process.exit(1);
  });

  if(dev) {
    process.once('uncaughtException', function(err) {
      logger.error('FATAL: Uncaught exception.');
      logger.error(err.stack||err);
      setTimeout(function(){
        process.exit(1);
      }, 100);
    });
  }