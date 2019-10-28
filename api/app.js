const app = require('./express');
const http = require('http');
const websocket = require('./web-socket');

class App {
  constructor(port) {
    this.port = port;
    this.start = this.start.bind(this);
    this.onServerStart = this.onServerStart.bind(this);
  }

  start() {
    this.server = http.Server(app);
    this.webSocket = new websocket(this.server);
    this.webSocket.start();
    this.server.listen(this.port, this.onServerStart);
  }

  onServerStart() {
    console.log(`Server started on port ${this.server.address().port}`);
  }
}

module.exports = App;
