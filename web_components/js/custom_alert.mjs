import { stringifyCurrentDate } from '../../modules/date.mjs';

class Alert extends HTMLElement {
    static get observedAttributes() {
        return ['alert-class', 'alert-heading', 'alert-text'];
    }

    constructor() {
        super();

        this._shadow = this.attachShadow({ mode: 'closed' });

        const ALERT = document.createElement('div');
        ALERT.className = 'alert alert-dismissible';
        ALERT.setAttribute('role', 'alert');
        ALERT.addEventListener('animationend', () => {
            if (
                Boolean(this.parentElement) &&
                this.parentElement.classList.contains('alerts-container')
            ) {
                this.parentElement.removeAttribute('style');
            }
            this.remove();
        });
        ALERT.addEventListener('animationiteration', () => {
            ALERT.style.animationPlayState = 'paused';
            if (
                Boolean(this.parentElement) &&
                this.parentElement.classList.contains('alerts-container')
            ) {
                this.parentElement.style.minHeight = `${this.offsetHeight}px`;
            }
        });

        const HEADER = ALERT.appendChild(document.createElement('div'));
        HEADER.className = 'alert-header';
        const HEADING = HEADER.appendChild(document.createElement('h5'));
        HEADING.className = 'alert-heading';
        const DATETIME = HEADER.appendChild(document.createElement('span'));
        DATETIME.className = 'alert-datetime';
        DATETIME.textContent = stringifyCurrentDate();

        ALERT.append(document.createElement('hr'));

        const TEXT = ALERT.appendChild(document.createElement('p'));
        TEXT.className = 'alert-text';

        const CLOSE = ALERT.appendChild(document.createElement('button'));
        CLOSE.ariaLabel = 'Close';
        CLOSE.className = 'close';
        CLOSE.type = 'button';
        CLOSE.addEventListener('click', this.close);
        const CROSS = CLOSE.appendChild(document.createElement('span'));
        CROSS.ariaHidden = 'true';
        CROSS.textContent = '\u00d7';

        const STYLESHEET = document.createElement('link');
        STYLESHEET.href = '../css/alert.css';
        STYLESHEET.rel = 'stylesheet';

        const BOOTSTRAP = document.createElement('link');
        BOOTSTRAP.crossOrigin = 'anonymous';
        BOOTSTRAP.href =
            'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
        BOOTSTRAP.integrity =
            'sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh';
        BOOTSTRAP.rel = 'stylesheet';

        this._shadow.append(STYLESHEET, BOOTSTRAP, ALERT);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'alert-class':
                const ALERT = this._shadow.querySelector('.alert');
                if (oldValue === null) {
                    ALERT.classList.add(newValue);
                    break;
                }
                newValue !== null
                    ? ALERT.classList.replace(oldValue, newValue)
                    : ALERT.classList.remove(oldValue);
                break;
            case 'alert-heading':
                this._shadow.querySelector('.alert-heading').textContent =
                    newValue !== null ? newValue : '';
                break;
            case 'alert-text':
                this._shadow.querySelector('.alert-text').textContent =
                    newValue !== null ? newValue : '';
                break;
        }
    }

    get alertClass() {
        return this.hasAttribute('alert-class')
            ? this.getAttribute('alert-class')
            : undefined;
    }

    set alertClass(value) {
        value !== null && value !== undefined
            ? this.setAttribute('alert-class', value)
            : this.removeAttribute('alert-class');
    }

    get alertHeading() {
        return this.hasAttribute('alert-heading')
            ? this.getAttribute('alert-heading')
            : undefined;
    }

    set alertHeading(value) {
        value !== null && value !== undefined
            ? this.setAttribute('alert-heading', value)
            : this.removeAttribute('alert-heading');
    }

    get alertText() {
        return this.hasAttribute('alert-text')
            ? this.getAttribute('alert-text')
            : undefined;
    }

    set alertText(value) {
        value !== null && value !== undefined
            ? this.setAttribute('alert-text', value)
            : this.removeAttribute('alert-text');
    }

    close = () =>
        (this._shadow.querySelector('.alert').style.animationPlayState =
            'running');
}

export { Alert };
