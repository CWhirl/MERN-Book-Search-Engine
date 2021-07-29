const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    user: async (parent, { email, password }, context) => {
      const user = await User.findOne({_id:context.user._id})
      return user
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    createUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return {user, token};
    },
    saveBook: async (parent, {bookdata}, context) => {
      console.log(context.user)
      //mongo specfic database queries'
      if (context.user) {
        const user = await User.findOneAndUpdate(
          {_id:context.user._id},
          {$push:{savedbooks:bookdata}},
          {new:true}
        );
        return user;
      }
      throw new AuthenticationError("Not logged in")
    },
    removeBook: async (parent, { bookId }, context) => {
      const user = await User.findOneAndUpdate(
        {_id:context.user._id},
        {$pull:{savedbooks:{bookId}}},
        {new:true}
      );
      return user;
    },
  },
};

module.exports = resolvers;
