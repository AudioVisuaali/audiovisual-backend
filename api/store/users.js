module.exports = {
  users: [],

  add: function(user) {
    this.users.push(user);
  },

  getById: function(id) {
    return this.users.find(user => user.id === id);
  },

  getByToken: function(token) {
    return this.users.find(user => user.token === token);
  },

  getAll: function() {
    return this.users;
  },

  update: function(unique, modifiedUser) {
    let mergedUser = null;
    this.users = this.users.map((user, i) => {
      const isMatch = user.unique === unique;

      if (!isMatch) {
        return user;
      }

      const newUser = {
        ...this.users[i],
        ...modifiedUser,
        unique: this.users[i].unique,
      };

      mergedUser = newUser;
      this.users[i] = newUser;
      return newUser;
    });

    return mergedUser;
  },
};
