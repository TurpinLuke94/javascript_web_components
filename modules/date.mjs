const OPTIONS = {
    hour12: true,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
};

function stringifyCurrentDate() {
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 0) {
        return console.error(
            TypeError(
                `stringifyCurrentDate() takes no arguments (${NUM_ARGS} given)`
            )
        );
    }

    return new Date().toLocaleString(undefined, OPTIONS);
}

function stringifyDate(value) {
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 1) {
        return console.error(
            TypeError(
                `stringifyDate() takes exactly 1 argument (${NUM_ARGS} given)`
            )
        );
    }
    if (value === null || value === undefined) {
        return value;
    }

    if (isNaN(value) === false) {
        value = Number(value);
    }
    const DATE = new Date(value).toLocaleString(undefined, OPTIONS);
    if (DATE === 'Invalid Date') {
        throw new TypeError(
            "stringifyDate() 'value' argument is not recognised as a valid date"
        );
    }
    return DATE;
}

export { stringifyCurrentDate, stringifyDate };
