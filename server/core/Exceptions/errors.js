class ErrorBase extends Error {
    status;
    constructor(message,status) {
        super(message);
        this.status = status
    }
}

class BadRequestError extends ErrorBase {
    constructor(message) {
        super(message ?? 'Bad Request',400);
    }
}

class UnauthorizedError extends ErrorBase {
    constructor(message) {
        super(message ?? 'Unauthorized',401);
    }
}

class ForbiddenError extends ErrorBase {
    constructor(message) {
        super(message ?? 'Forbidden access',403);
    }
}

class NotFoundError extends ErrorBase {
    constructor(message) {
        super(message ?? 'Not Found',404);
    }
}

module.exports = {ErrorBase, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError};


