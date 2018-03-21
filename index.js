const http = require('http');

const moment = require('moment');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const { NotFoundError, AccessDenied } = require('./core/errors');

mongoose.set('bufferCommands', false);

(async () => {
    const host = process.env.APP_HOST || 'localhost';
    const port = process.env.APP_PORT || 8080;
    const mongoUri = process.env.MONGO_CONNECT_URI || 'mongodb://localhost/app_blog';

    await mongoose.connect(mongoUri);

    const app = express();

    app.locals.moment = moment;

    app.set('views', './views');
    app.set('view engine', 'pug');

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(require('./routes/auth')); // Подключение обработчиков входа и регистрации

    // Подключаем обработчики для эмуляции запросов DELETE, PATCH и прочих через поддерживаемые без JS GET и POST
    app.use(
        methodOverride('_method'),
        methodOverride('X-HTTP-Method'),          // Microsoft
        methodOverride('X-HTTP-Method-Override'), // Google/GData
        methodOverride('X-Method-Override'),      // IBM
    );

    app.use(require('./routes/blogposts')); // Подключение обработчиков просмотра блога и создания/редактирования постов

    app.use(
        (req, res, next) => next(new NotFoundError('route not found')),// Обработка остутствующих адресов запросов
        (err, req, res, next) => {// Обработка ошибок
            console.log(err);
            res.status(err.status || 502);

            // Отображаем страницу с ошибкой в зависимости от типа ошибки

            if (err instanceof AccessDenied) {
                res.render('error_not_admin');
            } else if (err instanceof NotFoundError) {
                res.render('error_404');
            } else {
                res.render('error_5xx');
            }
        }
    );

    const server = http.createServer(app)
        .listen(
            port,
            host,
            () => console.log(`Worker ${process.pid} started ${host}:${port}`)
        );

    server.on('connection', socket => socket.setNoDelay()); // Отключаем алгоритм Нагла.
})()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
