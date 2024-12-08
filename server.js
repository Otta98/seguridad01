'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet'); // Seguridad adicional

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
  }
}));

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use(helmet()); // Protección de cabeceras HTTP

app.use('/public', express.static(process.cwd() + '/public'));

// Usar CORS de manera restringida
app.use(cors({origin: 'https://your-allowed-origin.com'})); // Solo permitir ciertos orígenes

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Para pruebas de FCC
fccTestingRoutes(app);

// Rutas de la API
apiRoutes(app);  

// Middleware de 404 Not Found
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Iniciar el servidor
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // Para pruebas
