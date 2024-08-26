module.exports = {
  user: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: false,
    },
    lastloggedAt: {
      type: Number,
      required: true,
      default: new Date(),
    },
    isOnline: {
      type: Boolean,
      required: true,
      default: false,
    },
    socketId: {
      type: String,
      required: false,
      default: "",
    },
  },
  todo: {
    userId: {
      type: String,
      required: true,
    },
    todos: [
      {
        task: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
};
