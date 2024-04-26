import { stringifyCurrentDate } from './date.mjs';
import { ValueError } from './errors.mjs';

function generateAlert(type, heading, text) {
    const ALERT = document.querySelector('#alert');
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 3) {
        if (!ALERT.hasAttribute('alert-hidden')) {
            ALERT.querySelector('.close').click();
        }
        throw new TypeError(
            `generateAlert() takes exactly 3 arguments (${NUM_ARGS} given)`
        );
    }
    for (const [KEY, VALUE] of [
        ['type', type],
        ['heading', heading],
        ['text', text],
    ]) {
        if (typeof VALUE === 'string') {
            continue;
        }
        if (!ALERT.hasAttribute('alert-hidden')) {
            ALERT.querySelector('.close').click();
        }
        throw new TypeError(
            `generateAlert()'s '${KEY}' argument is not a 'String' type`
        );
    }
    let types = [
        'danger',
        'dark',
        'info',
        'light',
        'primary',
        'secondary',
        'success',
        'warning',
    ];
    if (types.includes(type) === false) {
        if (!ALERT.hasAttribute('alert-hidden')) {
            ALERT.querySelector('.close').click();
        }
        types = types.join(', ').replace(/,(?!.+,)/, ', or');
        throw new ValueError(
            `generateAlert()'s 'type' argument does not have a valid value. It's value must be one of the following: ${types}`
        );
    }

    if (!ALERT.hasAttribute('alert-hidden')) {
        ALERT.parentElement.style.minHeight = `${ALERT.offsetHeight}px`;
        ALERT.setAttribute('alert-hidden', '');
    }
    for (const CLASS of ALERT.classList) {
        if (CLASS !== 'alert' && CLASS !== 'alert-dismissible') {
            ALERT.classList.remove(CLASS);
        }
    }
    ALERT.classList.add(`alert-${type}`);
    ALERT.querySelector('.alert-heading').textContent = heading;
    ALERT.querySelector('.alert-datetime').textContent = stringifyCurrentDate();
    ALERT.querySelector('.alert-text').textContent = text;
    ALERT.style.animationPlayState = 'running';
}

export { generateAlert };
