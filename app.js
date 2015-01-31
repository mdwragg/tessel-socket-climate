var router = require('tiny-router'),
    ws = require("nodejs-websocket"),
    fs = require('fs'),
    tessel = require('tessel'),
    climatelib = require('climate-si7005'),
    climate = climatelib.use(tessel.port['A']),
    wifi = require('wifi-cc3000');

wifi.on('connect', function(){

  climate.on('ready', function () {
    router
        .use('static', {path: './static'})
        .use('fs', fs)
        .listen(8080);

    // Create a websocket server on port 8001
    ws.createServer(function (conn) {
      console.log("New connection")

      setInterval(function() {
        climate.readTemperature('c', function (err, temp) {
          climate.readHumidity(function (err, humid) {
            var returnObj = {'temp': temp, 'humid': humid};
            conn.sendText(JSON.stringify(returnObj));
          });
        });

      }, 2000);

      // Notify the console when the connection closes
      conn.on("close", function (code, reason) {
          console.log("Connection closed")
      })
    }).listen(8081)

    console.log('Running Server');
  });
});
