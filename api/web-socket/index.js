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
    this.sendToRoom = this.sendToRoom.bind(this);
    this.addVisualsRoom = this.addVisualsRoom.bind(this);
    this.getVisualsRoom = this.getVisualsRoom.bind(this);
    this.updateVisualsRoom = this.updateVisualsRoom.bind(this);
    this.deleteVisualsRoom = this.deleteVisualsRoom.bind(this);
    this.addVisualsUser = this.addVisualsUser.bind(this);
    this.getVisualsUser = this.getVisualsUser.bind(this);
    this.updateVisualsUser = this.updateVisualsUser.bind(this);
    this.deleteVisualsUser = this.deleteVisualsUser.bind(this);
  }

  handleConnection(socket) {
    socket.sendToRoom = this.sendToRoom;
    socket.addVisualsRoom = this.addVisualsRoom;
    socket.getVisualsRoom = this.getVisualsRoom;
    socket.updateVisualsRoom = this.updateVisualsRoom;
    socket.deleteVisualsRoom = this.deleteVisualsRoom;
    socket.addVisualsUser = this.addVisualsUser;
    socket.getVisualsUser = this.getVisualsUser;
    socket.updateVisualsUser = this.updateVisualsUser;
    socket.deleteVisualsUser = this.deleteVisualsUser;

    socket.on(WS_TYPES.IS_PLAYING, msg => onIsPlaying(socket, msg));
    socket.on(WS_TYPES.SEEK, msg => onSeek(socket, msg));
    socket.on(WS_TYPES.SKIP, msg => onSkip(socket, msg));
    socket.on(WS_TYPES.NEXT_VIDEO, msg => onNextVideo(socket, msg));
    socket.on(WS_TYPES.ADD_VIDEO, msg => onAddVideo(socket, msg));
    socket.on(WS_TYPES.REMOVE_VIDEO, msg => onRemoveVideo(socket, msg));
    socket.on(WS_TYPES.PLAY_ORDER, msg => onPlayOrder(socket, msg));
    socket.on(WS_TYPES.USER_MESSAGE, msg => onUserMessage(socket, msg));
    socket.on(WS_TYPES.REORDER, msg => onReorder(socket, msg));
    socket.on(WS_TYPES.USER_USERNAME_CHANGE, msg =>
      onUserUsernameChange(socket, msg)
    );
    socket.on(WS_TYPES.DISCONNECT, msg => onDisconnect(socket, msg));
  }

  start() {
    this.io = socketIo(this.server);

    this.io.use((s, n) => authenticate(s, n, this));

    this.io.on(WS_TYPES.CONNECTION, this.handleConnection);
  }

  sendToRoom(room, type, content) {
    this.io.to(room).emit(type, content);
  }

  addVisualsRoom(room) {
    this.visualRooms.push(room);
  }

  getVisualsRoom(unique) {
    for (let i = 0; i < this.visualRooms.length; i++) {
      if (this.visualRooms[i].unique !== unique) continue;

      return this.visualRooms[i];
    }
  }

  updateVisualsRoom(unique, modifiedRoom) {
    for (let i = 0; i < this.visualRooms.length; i++) {
      if (this.visualRooms[i].unique !== unique) continue;

      const newRoom = {
        ...this.visualRooms[i],
        ...modifiedRoom,
        unique: this.visualRooms[i].unique,
      };

      this.visualRooms[i] = newRoom;
      return newRoom;
    }
  }

  deleteVisualsRoom(unique) {
    for (let i = 0; i < this.visualRooms.length; i++) {
      if (this.visualRooms[i].unique !== unique) continue;

      this.visualRooms[i].splice(i, 1);
      break;
    }
  }

  addVisualsUser(user) {
    this.visualUsers.push(user);
  }

  getVisualsUser(auth, byToken = false) {
    for (let i = 0; i < this.visualUsers.length; i++) {
      const match = byToken
        ? this.visualUsers[i].token === auth
        : this.visualUsers[i].id === auth;
      if (!match) continue;

      return this.visualUsers[i];
    }
  }

  updateVisualsUser(unique, modifiedUser) {
    for (let i = 0; i < this.visualUsers.length; i++) {
      if (this.visualUsers[i].unique !== unique) continue;

      const newUser = {
        ...this.visualUsers[i],
        ...modifiedUser,
        unique: this.visualUsers[i].unique,
      };

      this.visualUsers[i] = newUser;
      return newUser;
    }
  }

  deleteVisualsUser(token, roomUnique = null) {
    let user;

    for (let i = 0; i < this.visualUsers.length; i++) {
      if (this.visualUsers[i].token !== token) continue;

      if (roomUnique) user = this.visualUsers[i];
      this.visualUsers.splice(i, 1);
      break;
    }

    if (!roomUnique) return;

    const room = this.getVisualsRoom(roomUnique);
    for (let i = 0; i < room.viewers.length; i++) {
      if (room.viewers[i].unique !== user.unique) continue;

      room.viewers.splice(i, 1);
      this.updateVisualsRoom(roomUnique, room);
      break;
    }
  }
}

module.exports = WebSocket;
