const markdownIt = require('markdown-it');
const { Schema } = require('mongoose');
const { inHTMLData: xssSanitize } = require('xss-filters');

const md = markdownIt({
    xhtmlOut: true,
    breaks: true,
    linkify: true,
    typographer: true
});

const BlogPostSchema = new Schema({
    _createdOn: {
        type: Number,
        default: Date.now
    },
    _createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    parsed_content: {
        type: String,
        required: true
    }
});

/**
 * Нормальизация данных поста
 * @param post
 */
function normalizePost(post) {
    // Чистим заголовок и содержимое
    post.parsed_content = md.render(post.content);
    post.title = xssSanitize(post.title);
    post.content = xssSanitize(post.content);
}

BlogPostSchema.pre('validate', async function (next) {
    try {
        normalizePost(this);

        next();
    } catch (e) {
        next(e);
    }
});

module.exports = BlogPostSchema;
