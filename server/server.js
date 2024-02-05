const express = require('express');
const path = require('path');
const next = require('next');
const logger = require('../logs');

const expressValidator = require('express-validator');
const https = require("https");
const fs = require('fs');
const favicon = require('serve-favicon');
const cors = require('cors');
const { parse } = require('url')
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const auth = require('./google');
const {bouncie} = require('./lib/bouncie');

const options = {
  key: fs.readFileSync('/etc/ssl/private/private.key', 'utf8'),
  cert: fs.readFileSync('/etc/ssl/certificate.crt', 'utf8')
};

dotenv.config();
const app = express();
const server = https.createServer(options, app);

//Handle Database
const database = require('./lib/db');

const PORT = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

//var machines = require('./api/machines/machines');
const tasks = require('./lib/tasks.js');
const workOrders = require('./lib/work_orders.js');
const workOrderDetail = require('./lib/work_order_detail.js');
const signs = require('./lib/signs.js');
const taskLists = require('./lib/task_lists.js');
const pdf = require('./lib/pdf.js');
const crew = require('./lib/crew.js');
const vehicles = require('./lib/vehicles.js');
const calendar = require('./lib/calendar.js');
const entities = require('./lib/entities.js');
const settings = require('./lib/settings.js');
const inventory = require('./lib/inventory.js');
const inventoryKits = require('./lib/inventoryKits.js');
const inventoryOrdersOut = require('./lib/inventoryOrdersOut.js');
const inventoryPartsRequest = require('./lib/inventoryPartsRequest.js');
const notifications = require('./lib/notifications.js');
const {imageRouter} = require('./lib/images.js');
const webPush = require('./lib/webPush');

const {emailRouter} = require('./lib/email');


global.SERVER_APP_ROOT = __dirname;
global.ROOT_URL = process.env.NODE_ENV == 'production' ? "https://icontrol.raineyelectronics.com" : `https://icontrol.raineyelectronics.com:${process.env.PORT}`;
nextApp
  .prepare()
  .then(() => {

    app.use(favicon(__dirname + '/../public/static/favicon.ico'));
    app.use(expressValidator());
    app.use(bodyParser.json({limit: '50mb'}));

    // The next two gets allow normal handle of regular static/next assets
    //   that do not need google auth. This needs to be before passport.session
    app.get('/_next*', (req, res) => {
      handle(req, res);
    });

    app.get('/static/*', (req, res) => {
      handle(req, res);
    });
    ////////////////

    app.use(cors({ origin: '*' }));
    //Custom Routes//
    app.use('/scheduling/tasks', tasks);
    app.use('/scheduling/workOrders', workOrders);
    app.use('/scheduling/workOrderDetail', workOrderDetail);
    app.use('/scheduling/signs', signs);
    app.use('/scheduling/taskLists', taskLists);
    app.use('/scheduling/pdf', pdf);
    app.use('/scheduling/email', emailRouter);
    app.use('/scheduling/crew', crew);
    app.use('/scheduling/entities', entities);
    app.use('/scheduling/settings', settings);
    app.use('/scheduling/inventory', inventory);
    app.use('/scheduling/inventoryKits', inventoryKits);
    app.use('/scheduling/inventoryOrdersOut', inventoryOrdersOut);
    app.use('/scheduling/inventoryPartsRequest', inventoryPartsRequest);
    app.use('/scheduling/notifications', notifications.router);
    app.use('/scheduling/webPush', webPush.router);
    app.use('/images', imageRouter);
    ///

    //Session   ////
    //Has to be above custom routes, otherwise req.session is not available to them
    var options = {
      host: process.env.host,
      port: 3306,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
      expiration: (14 * 24 * 60 * 60)
    };
    
    var sessionStore = new MySQLStore(options);
    //Could use existing connection like this 
    //var sessionStore = new MySQLStore({}/* session store options */, connection);
    
    app.use(session({
        name: 'scheduling.sid',
        secret: 'HD2w.)q*VqRT4/#NK2M/,E^B)}FED5fWU!dKe[wk',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 14 * 24 * 60 * 60 * 1000,
        }, 
        key: 'session_cookie_name',
        store: sessionStore,
    }));
    /////////////////
    // Authenticate User
    auth({ ROOT_URL, app ,database})
    bouncie({ROOT_URL, app, database});
    
    // Custom Routes with session
      //Place vehicles here, because we need to access session.passport.user 
    app.use('/scheduling/vehicles', vehicles);
    app.use('/scheduling/calendar', calendar);
    //

    app.get('*', (req, res) => {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl;

      if (pathname === '/sw.js' || pathname.startsWith('/workbox-')) {
        console.log("SW or Worker");
        const filePath = path.join(__dirname, '/../public', pathname)
        logger.info(filePath);
        nextApp.serveStatic(req, res, filePath)
      } else {
        handle(req, res, parsedUrl)
      }
      //return handle(req, res);
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
