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
    this.addVisualsRoom = this.addVisualsRoom.bind(this);
    this.getVisualsRoom = this.getVisualsRoom.bind(this);
    this.updateVisualsRoom = this.updateVisualsRoom.bind(this);
    this.deleteVisualsRoom = this.deleteVisualsRoom.bind(this);
    this.addVisualsUser = this.addVisualsUser.bind(this);
    this.getVisualsUser = this.getVisualsUser.bind(this);
    this.updateVisualsUser = this.updateVisualsUser.bind(this);
    this.disconnectUser = this.disconnectUser.bind(this);
    this.wrapAction = this.wrapAction.bind(this);
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
    socket.disconnectUser = this.disconnectUser;

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

      this.visualRooms.splice(i, 1);
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

  disconnectUser(user, roomUnique = null) {
    for (let j = 0; j < this.visualRooms.length; j++) {
      const room = this.visualRooms[j];

      if (roomUnique && room.unique !== roomUnique) {
        continue;
      }

      for (let k = 0; k < room.viewers.length; k++) {
        if (room.viewers[k].unique !== user.unique) {
          continue;
        }

        this.visualRooms[j].viewers.splice(k, 1);
        break;
      }
    }
  }
}

module.exports = WebSocket;
