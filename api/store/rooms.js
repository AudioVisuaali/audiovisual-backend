module.exports = {
  rooms: [],

  add: function(room) {
    this.rooms.push(room);
  },

  getById: function(unique) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].unique !== unique) continue;

      return this.rooms[i];
    }
  },

  update: function(unique, newModifiedRoom) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].unique !== unique) continue;

      const newRoom = {
        ...this.rooms[i],
        ...newModifiedRoom,
        unique: this.rooms[i].unique,
      };

      this.rooms[i] = newRoom;
      return newRoom;
    }
  },

  delete: function(unique) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].unique !== unique) continue;

      this.rooms.splice(i, 1);
      break;
    }
  },

  deleteUser: function(user, roomUnique = null) {
    this.rooms = this.rooms.map(room => {
      if (roomUnique && room.unique !== roomUnique) {
        return room;
      }

      const newViewers = room.viewers.filter(
        viewer => viewer.unique !== user.unique
      );

      return {
        ...room,
        viewers: newViewers,
      };
    });
  },
};
