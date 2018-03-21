const mongoose = require('mongoose');

const UserSchema = require('./schemas/User');
const BlogPostSchema = require('./schemas/BlogPost');

const UserController = require('./controllers/User');
const BlogPostController = require('./controllers/BlogPost');

UserSchema.loadClass(UserController);
BlogPostSchema.loadClass(BlogPostController);

module.exports = {
    User: mongoose.model('user', UserSchema),
    BlogPost: mongoose.model('post', BlogPostSchema)
};