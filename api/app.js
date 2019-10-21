const express = require('express');
const socketIo = require('socket.io');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error');
const createRoom = require('./utils/room');
const createUser = require('./utils/user');
const getViewer = require('./utils/viever');
const createVideo = require('./utils/video');
const messageUtil = require('./utils/message');

const io = socketIo(http);

let visualsRooms = [];
let visualsUsers = [];
const setVisualsRooms = rooms => (visualsRooms = rooms);
const setVisualsUsers = users => (visualsUsers = users);

io.use((socket, next) => {
  const { token, username, roomUnique } = socket.handshake.query;

  let user;

  if (token) {
    for (let i = 0; i < visualsUsers.length; i++) {
      if (visualsUsers[i].token === token) {
        visualsUsers[i].username = username;
        visualsUsers[i].id = socket.id;
        user = visualsUsers[i];
        break;
      }
    }
  }

  if (!user) {
    user = createUser(socket.id, username);
    socket.handshake.token = user.token;
    visualsUsers.push(user);
  }
  const messageResponse = messageUtil.createUserMessage(
    null,
    user,
    messageUtil.MESSAGE_USER_JOIN
  );

  let room;
  for (let i = 0; i < visualsRooms.length; i++) {
    if (visualsRooms[i].unique !== roomUnique) continue;

    visualsRooms[i].viewers.push(getViewer(user));
    visualsRooms[i].messages.push(messageResponse);
    room = visualsRooms[i];
    break;
  }

  if (!room) {
    room = createRoom(roomUnique, user);
    room.messages.push(messageResponse);
    visualsRooms.push(room);
  }

  socket.join(roomUnique);
  io.to(roomUnique).emit('message', messageResponse);
  io.to(roomUnique).emit('user-join', getViewer(user));
  socket.emit('user', user);
  socket.emit('room', room);

  return next();
}).on('connection', socket => {
  console.log('Connection created');
  const { roomUnique } = socket.handshake.query;

  /**
   *
   * IS VIDEO PLAYING
   */
  socket.on('is-playing', isPlaying => {
    console.log('Requested is-playing');
    const user = visualsUsers.find(u => u.id === socket.id);
    const messageResponse = messageUtil.createUserMessage(
      isPlaying,
      user,
      messageUtil.MESSAGE_VIDEO_IS_PLAYING
    );
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];

      // Same room
      if (room.unique !== roomUnique) {
        continue;
      }
      visualsRooms[i].messages.push(messageResponse);
      break;
    }
    io.to(roomUnique).emit('message', messageResponse);
    io.to(roomUnique).emit('is-playing', isPlaying);
  });

  /**
   *
   * SCROLL ON SEEK
   */
  socket.on('seek', seek => {
    console.log('Requested Seek');
    const user = visualsUsers.find(u => u.id === socket.id);
    const messageResponse = messageUtil.createUserMessage(
      seek,
      user,
      messageUtil.MESSAGE_VIDEO_SEEK
    );
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];

      // Same room
      if (room.unique !== roomUnique) {
        continue;
      }
      visualsRooms[i].messages.push(messageResponse);
      break;
    }
    io.to(roomUnique).emit('message', messageResponse);
    io.to(roomUnique).emit('seek', seek);
  });

  socket.on('skip', currentlyPlaying => {
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];

      // Same room
      if (room.unique !== roomUnique) {
        continue;
      }

      // Skipping the same video
      const { playing } = room.videos;
      if (playing && playing.unique !== currentlyPlaying) {
        continue;
      }
      console.log('Request skip');
      const nextVideoExists = room.videos.playlist.length;
      const oldVideo = room.videos.playing;
      visualsRooms[i].videos.history.push(room.videos.playing);
      if (nextVideoExists) {
        visualsRooms[i].videos.playing = room.videos.playlist[0];
        room.videos.playlist.splice(i, 1);
      } else {
        visualsRooms[i].videos.playing = null;
      }

      const user = visualsUsers.find(u => u.id === socket.id);
      const messageResponse = messageUtil.createUserMessage(
        oldVideo,
        user,
        messageUtil.MESSAGE_VIDEO_SKIP
      );
      visualsRooms[i].messages.push(messageResponse);
      io.to(roomUnique).emit('message', messageResponse);
      io.to(roomUnique).emit('next-video', visualsRooms[i].videos);
      return;
    }
  });

  /**
   *
   * STARTS PLAYING NEXT VIDEO
   */
  socket.on('next-video', currentlyPlaying => {
    console.log('Requested next-video');
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];

      // Same room
      if (room.unique !== roomUnique) {
        continue;
      }

      // Skipping the same video
      const { playing } = room.videos;
      if (playing && playing.unique !== currentlyPlaying) {
        continue;
      }
      console.log('next-video');
      const nextVideoExists = room.videos.playlist.length;
      visualsRooms[i].videos.history.push(room.videos.playing);
      if (nextVideoExists) {
        visualsRooms[i].videos.playing = room.videos.playlist[0];
        room.videos.playlist.splice(i, 1);
      } else {
        visualsRooms[i].videos.playing = null;
      }
      const messageResponse = messageUtil.createUserMessage(
        visualsRooms[i].videos.playing,
        null,
        messageUtil.MESSAGE_VIDEO_NEXT
      );
      visualsRooms[i].messages.push(messageResponse);
      io.to(roomUnique).emit('message', messageResponse);
      io.to(roomUnique).emit('next-video', visualsRooms[i].videos);
      return;
    }
  });

  /**
   *
   * ADD VIDEO TO QUE
   */
  socket.on('add-video', videoInformation => {
    console.log('Requested add-video');
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];
      if (room.unique !== roomUnique) {
        continue;
      }

      const user = visualsUsers.find(u => u.id === socket.id);

      createVideo(videoInformation, user).then(video => {
        console.log('video-add');
        if (room.videos.playing) {
          visualsRooms[i].videos.playlist.push(video);
        } else {
          visualsRooms[i].videos.playing = video;
        }
        const messageResponse = messageUtil.createUserMessage(
          video,
          user,
          messageUtil.MESSAGE_VIDEO_ADD
        );
        visualsRooms[i].messages.push(messageResponse);
        io.to(roomUnique).emit('message', messageResponse);
        io.to(roomUnique).emit('add-video', visualsRooms[i].videos);
      });
      break;
    }
  });

  /**
   *
   * REMOVE VIDEO FROM QUE
   */
  socket.on('remove-video', videoUnique => {
    console.log('Requested remove-video');
    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];
      if (room.unique !== roomUnique) continue;

      let newPlaylist = [];
      let toHistory = null;
      for (let j = 0; j < room.videos.playlist.length; j++) {
        const video = room.videos.playlist[j];
        // match room
        if (video.unique === videoUnique) {
          toHistory = video;
        } else {
          newPlaylist.push(video);
        }
      }

      visualsRooms[i].videos.playlist = newPlaylist;
      visualsRooms[i].videos.history.push(toHistory);

      const user = visualsUsers.find(u => u.id === socket.id);
      const messageResponse = messageUtil.createUserMessage(
        toHistory,
        user,
        messageUtil.MESSAGE_VIDEO_DELETE
      );
      visualsRooms[i].messages.push(messageResponse);
      io.to(roomUnique).emit('message', messageResponse);
      io.to(roomUnique).emit('remove-video', {
        toHistory,
        removeFromQue: videoUnique,
        requestedBy: user,
      });
      break;
    }
  });

  /**
   *
   * Video play order
   */
  socket.on('play-order', order => {
    console.log('Requested play-order');
    if (!['linear', 'random'].includes(order)) return;

    const user = visualsUsers.find(u => u.id === socket.id);

    for (let i = 0; i < visualsRooms.length; i++) {
      if (visualsRooms[i].unique !== roomUnique) continue;

      visualsRooms[i].videos.playOrder = order;
      const messageResponse = messageUtil.createUserMessage(
        order,
        user,
        messageUtil.MESSAGE_VIDEO_PALAY_ORDER
      );
      visualsRooms[i].messages.push(messageResponse);
      io.to(roomUnique).emit('message', messageResponse);
      break;
    }

    io.to(roomUnique).emit('play-order', order);
  });

  socket.on('user-message', message => {
    console.log('Requested user-mesasge');

    const user = visualsUsers.find(u => u.id === socket.id);
    const messageResponse = messageUtil.createUserMessage(
      message,
      user,
      messageUtil.MESSAGE_USER
    );
    for (let i = 0; i < visualsRooms.length; i++) {
      if (visualsRooms[i].unique !== roomUnique) continue;

      visualsRooms[i].messages.push(messageResponse);
      break;
    }
    io.to(roomUnique).emit('message', messageResponse);
  });

  /**
   *
   * Change Name
   */
  socket.on('user-username-change', newName => {
    console.log('Requested user-username-change');

    let oldUser;
    let newUser;
    for (let i = 0; i < visualsUsers.length; i++) {
      const user = visualsUsers[i];
      if (user.id !== socket.id) return;
      oldUser = Object.assign({}, visualsUsers[i]);
      visualsUsers[i].username = newName;
      newUser = visualsUsers[i];
      break;
    }
    const messageResponse = messageUtil.createUserMessage(
      oldUser,
      newUser,
      messageUtil.MESSAGE_USER_USERNAME_CHANGE
    );
    for (let i = 0; i < visualsRooms.length; i++) {
      if (visualsRooms[i].unique !== roomUnique) continue;

      visualsRooms[i].messages.push(messageResponse);
      break;
    }
    io.to(roomUnique).emit('message', messageResponse);
    io.to(roomUnique).emit('user-username-change', newUser);
  });

  /**
   *
   * User disconnect
   */
  socket.on('disconnect', () => {
    socket.leave(roomUnique);

    let user;

    for (let i = 0; i < visualsUsers.length; i++) {
      if (visualsUsers[i].id === socket.id) {
        user = visualsUsers[i];
        io.to(roomUnique).emit('user-leave', visualsUsers[i].unique);
        visualsUsers.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < visualsRooms.length; i++) {
      const room = visualsRooms[i];

      if (room.unique !== roomUnique) continue;

      visualsRooms[i].viewers = room.viewers.filter(
        v => v.unique !== user.unique
      );
      const messageResponse = messageUtil.createUserMessage(
        null,
        user,
        messageUtil.MESSAGE_USER_LEAVE
      );
      io.to(roomUnique).emit('message', messageResponse);
      break;
    }
  });
});

//

/**
 *
 * EXPRESS
 *
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).send('');
  }
  next();
});
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.visuals = {
    rooms: visualsRooms,
    users: visualsUsers,
    setVisualsRooms,
    setVisualsUsers,
  };
  next();
});

app.get('/api', (req, res) => {
  res.status(200).json(req.visuals.users);
});

app.use((req, res) => {
  return res.status(404).json({
    error: {
      message: 'Invalid request address',
    },
  });
});
app.use(errorHandler);

module.exports = http;
