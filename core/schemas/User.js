const { Schema } = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { ValidationError } = require('../errors');

const UserSchema = new Schema({
    _createdOn: {
        type: Number,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        required: true,
        type: String,
        maxlength: 64,
        minlength: 6
    }
});

/**
 * Проверка данных пользователя
 * @param user
 * @return {Promise<void>}
 */
async function validateUser(user) {
    if (!validator.isEmail(user.email)) {
        throw new ValidationError('invalid email');
    }

    if (user.isNew) {
        // Не должно быть дубликатов email
        const inDb = await user.constructor.count({ email: user.email });

        if (inDb > 0) {
            throw new ValidationError('email already registered');
        }

        // Первого пользователя делаем администратором
        user.set({ isAdmin: (await user.constructor.count({})) === 0 });
    }
}

UserSchema.pre('validate', async function (next) {
    try {
        await validateUser(this);

        // Хэшируем пароль
        this.password = await bcrypt.hash(this.password, 10);

        next();
    } catch (e) {
        next(e);
    }
});

module.exports = UserSchema;
