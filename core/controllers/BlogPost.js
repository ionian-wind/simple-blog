const mongoose = require('mongoose');
const { NotFoundError, AccessDenied } = require('../errors');
const { Types } = mongoose;

class BlogPostController {
    /**
     * Получение списка постов с поддержкой пагинации
     * @param page
     * @return {Promise<{posts: *, totalCount: *, currentPage: number, pagesCount: number}>}
     */
    static async getPostsListPageable(page = 1) {
        const currentPage = parseInt(page, 10);
        const limit = 5;

        if (Number.isNaN(currentPage)) {
            throw new NotFoundError();
        }

        const query = {};

        const totalCount = await this.count(query);
        const pagesCount = Math.ceil(totalCount / limit);

        if (currentPage !== 1 && currentPage > pagesCount) {
            throw new NotFoundError();
        }

        const posts = await this.find(query)
            .sort({ _createdOn: -1 })
            .skip((currentPage - 1) * limit)
            .limit(limit);

        return {
            posts,
            totalCount,
            currentPage,
            pagesCount: Math.ceil(totalCount / limit)
        };
    }

    /**
     * Получение поста по его идентификатору для редактирования.
     * Проверяет, является ли запрашивающий пользователь администратором
     * @param user
     * @param _id
     * @return {Promise<*>}
     */
    static async getPostById(user, _id) {
        if (!user.isAdmin) {
            throw new AccessDenied();
        }

        if (!Types.ObjectId.isValid(_id)) {
            throw new NotFoundError();
        }

        const post = await mongoose.model('post').findById(_id);

        if (!post) {
            throw new NotFoundError();
        }

        return post;
    }
}

module.exports = BlogPostController;
