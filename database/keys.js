module.exports = {
  mongodb: {
    URI: process.env.NODE_ENV !== "production" ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
  },
};
