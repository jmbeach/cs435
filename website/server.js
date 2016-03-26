/**
 * Title:
 * Description:
 */

// Get process enviornment for Heroku
process.env.PWD = process.cwd();

// #region MODULES
var express = require("express"),
  app = express(),
  config = require("config"),
  port = process.env.PORT || config.get("Debug.port"),
  env = process.env.NODE_ENV || 'development'; // process.env.NODE_ENV determines whether this is the heroku app
// #endregion

// #region SERVER_CONFIG
app.enable('trust proxy');

//Files in the public folder are served staticly
app.all('*', function (req, res, next) {
    app.use(express.static(process.env.PWD + '/public'));
    app.use('/bower_components', express.static(process.env.PWD + '/bower_components'));
    next();
});

var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});
// #endregion

// #region MAIN_ROUTE
app.get("(/[a-zA-Z(%20)0-9]+)+", function (req, res) {
    console.log(req.url);
    console.log("sending home page indirectly");
    res.sendFile(process.env.PWD + '/public/index.html');
});
// #endregion

// #region REQUESTS
// #region GET
// #endregion

// #region POST
// #endregion
// #endregion
