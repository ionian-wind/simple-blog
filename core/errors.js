class GenericError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }

        this.status = status;
        this.timestamp = Date.now();
    }
}

class AccessDenied extends GenericError {
    constructor(message = 'access denied') {
        super(message, 403);
    }
}

class ServerError extends GenericError {
    constructor(message) {
        super(message, 502);
    }
}

class ValidationError extends GenericError {
    constructor(message) {
        super(message, 422);
    }
}

class NotFoundError extends GenericError {
    constructor(message = 'not found') {
        super(message, 404);
    }
}


module.exports = {
    ValidationError,
    ServerError,
    AccessDenied,
    NotFoundError
};