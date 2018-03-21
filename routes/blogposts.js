const { BlogPost } = require('../core');
const { Router } = require('express');

const { Error: { ValidationError: DbValidationError } } = require('mongoose');
const { ValidationError } = require('../core/errors');

const router = new Router();

router.route('/posts')
    .get(async (req, res, next) => {// Получение списка постов блога
        try {
            res.render('post_list', {
                post: { title: '', content: '' },
                postsList: await BlogPost.getPostsListPageable(req.query.page)
            });
        } catch (e) {
            next(e);
        }
    })
    .post(async (req, res, next) => {// Создание нового поста
        const post = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            _createdBy: req.user._id
        });

        try {
            await post.save();

            res.redirect('/posts');
        } catch (e) {
            if (e instanceof ValidationError || e instanceof DbValidationError) {
                res.render('post_list', {
                    error: e.message,
                    post,
                    postsList: await BlogPost.getPostsListPageable(req.query.page)
                });
            } else {
                next(e);
            }
        }
    });

router.route('/posts/:_id')
    .all(async (req, res, next) => {
        try {
            req.blogPost = await BlogPost.getPostById(req.user, req.params._id);
            next();
        } catch (e) {
            next(e);
        }
    })
    .get(async (req, res, next) => res.render('post_form', { post: req.blogPost }))// Отображение формы редактирования
    .post(async (req, res, next) => {// Обновление поста
        try {
            req.blogPost.set({
                title: req.body.title,
                content: req.body.content
            });

            await req.blogPost.save();

            res.redirect('/posts');
        } catch (e) {
            if (e instanceof ValidationError || e instanceof DbValidationError) {
                res.render('post_form', {
                    error: e.message,
                    post: req.blogPost
                });
            } else {
                next(e);
            }
        }
    })
    .delete(async (req, res, next) => {// Удаление поста
        try {
            await req.blogPost.remove();

            res.redirect('/posts');
        } catch (e) {
            next(e);
        }
    });

module.exports = router;
