const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const connectMongo = require('connect-mongo');

const { Error: { ValidationError: DbValidationError } } = require('mongoose');
const { Router } = require('express');

const { User } = require('../core');
const { ValidationError } = require('../core/errors');

const MongoStore = connectMongo(session);
const router = new Router();

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
    try {
        done(null, await User.findById(id));
    } catch (e) {
        done(e);
    }
});

/**
 * Функция генерации обработчика для входа или регистрации
 * @param tpl шаблон страницы
 * @param handlerFn функция обработки входящих данных
 * @return {function(*, *, *)}
 */
function loginSignupBuilder(tpl, handlerFn) {
    return async (req, res, next) => {
        try {
            const user = await handlerFn(req.body.email, req.body.password);

            req.logIn(user, (err) => (err
                ? next(err)
                : res.redirect('/posts')));
        } catch (e) {
            if (e instanceof ValidationError || e instanceof DbValidationError) {
                res.render(tpl, { error: e.message });
            } else {
                next(e);
            }
        }
    };
}

router.route('/login')
    .get((req, res, next) => res.render('login_form'))
    .post(loginSignupBuilder('login_form', User.login));

router.route('/signup')
    .get((req, res, next) => res.render('signup_form'))
    .post(loginSignupBuilder('signup_form', User.signup));

router.route('/logout')
    .get((req, res, next) => {
        req.session.destroy((err) => {
            if (err) {
                next(err);
            } else {
                res.redirect('/login');
            }
        });
    });

module.exports = [
    session({
        secret: "some session secret",
        resave: true,
        rolling: true,
        saveUninitialized: true,
        store: new MongoStore({
            stringify: false,
            mongooseConnection: mongoose.connection
        })
    }),
    passport.initialize(),
    passport.session(),
    (req, res, next) => {
        //  Системные переменные для шаблонов
        res.locals.loggedIn = !!req.user;
        res.locals.user = req.user;
        next();
    },
    router,
    (req, res, next) => {
        if (!req.user) {
            // Если пользователь не вошёл - перенаправляем на форму входа
            res.redirect('/login');
        } else {
            next();
        }
    }
];
