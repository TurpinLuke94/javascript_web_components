class CustomError extends Error {
    constructor(message, ...params) {
        if (typeof message !== 'string') {
            return new TypeError("'message' argument is not a 'string' type");
        }

        super(message, ...params);
        this.name = this.constructor.name;
    }

    render() {
        console.error(this);
    }
}

class ApiForbiddenError extends CustomError {}

class ApiMethodError extends CustomError {}

class ApiNotFoundError extends CustomError {}

class ApiRequestError extends CustomError {}

class ApiUnauthorizedError extends CustomError {}

class ApiValidationError extends CustomError {
    constructor(message, errors = {}, ...params) {
        if (typeof message !== 'string') {
            return new TypeError("'message' argument is not a 'string' type");
        }
        if (!Object.prototype.toString.call(errors).includes('Object')) {
            return new TypeError(
                "'errors' argument is not an 'Object' object type"
            );
        }

        super(message, ...params);
        this.errors = new Map(Object.entries(errors));
    }

    render() {
        super.render();
        console.group(`Validation errors (${this.errors.size})`);
        for (let [name, message] of this.errors) {
            if (name === '__all__') {
                name = '*applies to no specific field';
            }
            console.error(`Field: ${name}\nDescription: ${message}`);
        }
        console.groupEnd();
    }
}

class ValueError extends CustomError {}

function renderError(error) {
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 1) {
        return console.error(
            TypeError(
                `renderError() takes exactly 1 argument (${NUM_ARGS} given)`
            )
        );
    }
    if (error instanceof Error === false) {
        return console.error(
            new TypeError(
                `renderError()'s 'error' argument is not an instance of 'Error'`
            )
        );
    }

    try {
        error.render();
    } catch {
        console.error(error);
    }
}

export {
    ApiForbiddenError,
    ApiMethodError,
    ApiNotFoundError,
    ApiRequestError,
    ApiUnauthorizedError,
    ApiValidationError,
    renderError,
    ValueError,
};
