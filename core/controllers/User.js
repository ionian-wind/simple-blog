const mongoose = require('mongoose');

class UserController {
    /**
     * Функция входапользователя
     * Ищет пользователя в БД и проверяет пароль
     * @param email
     * @param password
     * @return {Promise<User>} Объект пользователя
     */
    static async login(email, password) {
        const user = await mongoose.model('user').findOne({ email });

        if (!user) {
            throw new ValidationError('user not found');
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new ValidationError('user not found');
        }

        return user;
    }

    /**
     * Функция регистрации пользователя
     * @param email
     * @param password
     * @return {Promise<User>} Объект пользователя
     */
    static async signup(email, password) {
        return mongoose.model('user').create({ email, password });
    }
}

module.exports = UserController;
