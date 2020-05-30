const socketIo = require('socket.io');
const authenticate = require('./authentication');

const onAddVideo = require('./onAddVideo');
const onIsPlaying = require('./onIsPlaying');
const onNextVideo = require('./onNextVideo');
const onSeek = require('./onSeek');
const onSkip = require('./onSkip');
const onRemoveVideo = require('./onRemoveVideo');
const onPlayOrder = require('./onPlayOrder');
const onUserMessage = require('./onUserMessage');
const onUserUsernameChange = require('./onUserUsernameChange');
const onDisconnect = require('./onDisconnect');
const onReorder = require('./onReorder');
const WS_TYPES = require('./wsTypes');

class WebSocket {
  constructor(server) {
    this.start = this.start.bind(this);
    this.server = server;
    this.io = null;
    this.visualRooms = [];
    this.visualUsers = [];

    this.handleConnection = this.handleConnection.bind(this);
    this.applyAuthentication = this.applyAuthentication.bind(this);
    this.sendToRoom = this.sendToRoom.bind(this);
    this.wrapAction = this.wrapAction.bind(this);
  }

  handleConnection(socket) {
    socket.sendToRoom = this.sendToRoom;

    const wrap = fnc => this.wrapAction(socket, fnc);

    socket.on(WS_TYPES.IS_PLAYING, wrap(onIsPlaying));
    socket.on(WS_TYPES.SEEK, wrap(onSeek));
    socket.on(WS_TYPES.SKIP, wrap(onSkip));
    socket.on(WS_TYPES.NEXT_VIDEO, wrap(onNextVideo));
    socket.on(WS_TYPES.ADD_VIDEO, wrap(onAddVideo));
    socket.on(WS_TYPES.REMOVE_VIDEO, wrap(onRemoveVideo));
    socket.on(WS_TYPES.PLAY_ORDER, wrap(onPlayOrder));
    socket.on(WS_TYPES.USER_MESSAGE, wrap(onUserMessage));
    socket.on(WS_TYPES.REORDER, wrap(onReorder));
    socket.on(WS_TYPES.DISCONNECT, wrap(onDisconnect));
    socket.on(WS_TYPES.USER_USERNAME_CHANGE, wrap(onUserUsernameChange));
  }

  wrapAction(socket, fnc) {
    return msg => {
      try {
        fnc(socket, msg);
      } catch (error) {
        console.error('Error during action', error);
      }
    };
  }

  start() {
    this.io = socketIo(this.server);

    this.io.use(this.applyAuthentication);

    this.io.on(WS_TYPES.CONNECTION, this.handleConnection);
  }

  applyAuthentication(s, n) {
    try {
      authenticate(s, n, this);
    } catch (error) {
      console.log('Error during authentication', error);
    }
  }

  sendToRoom(room, type, content) {
    this.io.to(room).emit(type, content);
  }
}

module.exports = WebSocket;
