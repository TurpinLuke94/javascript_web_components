import { stringifyDate } from '../../modules/date.mjs';
import { renderError } from '../../modules/errors.mjs';
import { generateFetch } from '../../modules/fetch.mjs';
import { generateConfirmModal } from '../../modules/modals.mjs';
import {
    fetchPosts,
    fetchThread,
    manageFormErrorMessage,
    redirectToLogin,
} from '../../modules/posts.mjs';

class Post extends HTMLElement {
    static get observedAttributes() {
        return [
            'content',
            'deleted-on',
            'edited-on',
            'history',
            'like-action',
            'likes',
            'posted-by',
            'posted-on',
            'post-id',
            'replies',
            'reply-to-id',
            'reply-to-by',
            'restricted',
        ];
    }

    constructor() {
        super();

        this._shadow = this.attachShadow({ mode: 'closed' });

        const POST = document.createDocumentFragment();

        const REPLYING_TO = POST.appendChild(document.createElement('div'));
        REPLYING_TO.className = 'replying-to';
        REPLYING_TO.append('Replying to ');
        const REPLYING_TO_ANCHOR = REPLYING_TO.appendChild(
            document.createElement('a')
        );
        const SPAN = document.createElement('span');
        SPAN.textContent = '[undefined]';
        REPLYING_TO_ANCHOR.append(SPAN, "'s post");
        REPLYING_TO.style.display = 'none';

        const POSTED_BY = POST.appendChild(document.createElement('div'));
        POSTED_BY.className = 'posted-by';
        const POSTED_BY_ANCHOR = POSTED_BY.appendChild(
            document.createElement('a')
        );
        POSTED_BY_ANCHOR.textContent = '[undefined]';

        const POST_DATES = POST.appendChild(document.createElement('div'));
        POST_DATES.className = 'post-dates';
        const DATES = ['posted', 'edited', 'deleted'];
        for (const DATE of DATES) {
            const SPAN = POST_DATES.appendChild(document.createElement('span'));
            SPAN.className = `${DATE}-on`;
            SPAN.append(
                `${DATE[0].toUpperCase()}${DATE.slice(1)} on: `,
                document.createElement('span')
            );
            SPAN.lastElementChild.textContent = '[undefined]';
            SPAN.style.display = DATE === 'posted' ? 'block' : 'none';
        }

        const CONTENT = POST.appendChild(document.createElement('div'));
        CONTENT.className = 'post-content';
        CONTENT.textContent = '[undefined]';

        const POST_FORM = POST.appendChild(document.createElement('form'));
        POST_FORM.className = 'post-form';
        const FORM_CONTENT = POST_FORM.appendChild(
            document.createElement('textarea')
        );
        FORM_CONTENT.className = 'form-content form-control';
        FORM_CONTENT.maxLength = 255;
        FORM_CONTENT.required = true;
        FORM_CONTENT.rows = 2;
        const ERROR_MESSAGE = POST_FORM.appendChild(
            document.createElement('div')
        );
        ERROR_MESSAGE.className = 'error-message';
        ERROR_MESSAGE.textContent = 'There was an error!';
        const FORM_BUTTONS = POST_FORM.appendChild(
            document.createElement('div')
        );
        FORM_BUTTONS.className = 'form-btns';
        const ACTIONS = ['Post', 'Cancel'];
        for (const ACTION of ACTIONS) {
            const BUTTON = FORM_BUTTONS.appendChild(
                document.createElement('input')
            );
            BUTTON.className = `btn btn-primary btn-sm ${ACTION.toLowerCase()}`;
            BUTTON.type = ACTION === 'Post' ? 'submit' : 'button';
            BUTTON.value = ACTION;
            if (ACTION === 'Cancel') {
                BUTTON.addEventListener('click', this.hidePostForm);
            }
        }

        const POST_BUTTONS = POST.appendChild(document.createElement('div'));
        POST_BUTTONS.className = 'unrestricted post-btns';

        const LIKE_BTN = POST_BUTTONS.appendChild(
            document.createElement('button')
        );
        LIKE_BTN.className = 'like btn btn-primary btn-sm';
        LIKE_BTN.type = 'button';
        LIKE_BTN.append('Likes ');
        const POST_LIKES = LIKE_BTN.appendChild(document.createElement('span'));
        POST_LIKES.className = 'badge badge-light';
        POST_LIKES.textContent = '0';
        const LIKE_ACTION = document.createElement('span');
        LIKE_ACTION.className = 'action';
        LIKE_ACTION.textContent = 'like';
        LIKE_BTN.append(' (', LIKE_ACTION, ')');
        LIKE_BTN.addEventListener('click', this.updateLikes);

        const REPLY_BTN = POST_BUTTONS.appendChild(
            document.createElement('button')
        );
        REPLY_BTN.className = 'reply btn btn-primary btn-sm';
        REPLY_BTN.type = 'button';
        REPLY_BTN.textContent = 'Add Reply';
        REPLY_BTN.addEventListener('click', () => this.showPostForm('reply'));

        const REPLIES_BTN = POST_BUTTONS.appendChild(
            document.createElement('button')
        );
        REPLIES_BTN.className = 'replies btn btn-primary btn-sm';
        REPLIES_BTN.type = 'button';
        REPLIES_BTN.append('View Replies ');
        const POST_REPLIES = REPLIES_BTN.appendChild(
            document.createElement('span')
        );
        POST_REPLIES.className = 'badge badge-light';
        POST_REPLIES.textContent = '0';

        const HISTORY_BTN = POST_BUTTONS.appendChild(
            document.createElement('button')
        );
        HISTORY_BTN.className = 'history btn btn-primary btn-sm';
        HISTORY_BTN.type = 'button';
        HISTORY_BTN.append('View Post History ');
        const POST_HISTORY = HISTORY_BTN.appendChild(
            document.createElement('span')
        );
        POST_HISTORY.className = 'badge badge-light';
        POST_HISTORY.textContent = '0';

        const RESTRICTED_BUTTONS = POST.appendChild(
            document.createElement('div')
        );
        RESTRICTED_BUTTONS.className = 'restricted post-btns';

        const EDIT_BTN = RESTRICTED_BUTTONS.appendChild(
            document.createElement('button')
        );
        EDIT_BTN.className = 'edit btn btn-primary btn-sm';
        EDIT_BTN.type = 'button';
        EDIT_BTN.textContent = 'Edit Post';
        EDIT_BTN.addEventListener('click', () => this.showPostForm('edit'));

        const DELETE_BTN = RESTRICTED_BUTTONS.appendChild(
            document.createElement('button')
        );
        DELETE_BTN.className = 'delete btn btn-primary btn-sm';
        DELETE_BTN.type = 'button';
        DELETE_BTN.textContent = 'Delete Post';
        DELETE_BTN.addEventListener('click', () => {
            let modal = generateConfirmModal(
                'Yes',
                'Are you sure you want to delete this post?',
                'No',
                'Confirm!'
            );
            modal.actionButton.onclick = () => {
                // Hide bootstrap modal requires the use of JQuery
                $('#modal').modal('hide');
                this.deletePost();
            };
        });

        const STYLESHEET = document.createElement('link');
        STYLESHEET.href = '../css/post.css';
        STYLESHEET.rel = 'stylesheet';

        const BOOTSTRAP = document.createElement('link');
        BOOTSTRAP.crossOrigin = 'anonymous';
        BOOTSTRAP.href =
            'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
        BOOTSTRAP.integrity =
            'sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh';
        BOOTSTRAP.rel = 'stylesheet';

        this._shadow.append(STYLESHEET, BOOTSTRAP, POST);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'post-id':
                const REPLYING_TO = this._shadow.querySelector('.replying-to');
                const REPLIES = this._shadow.querySelector('.replies');
                const HISTORY = this._shadow.querySelector('.history');
                if (newValue === null) {
                    REPLYING_TO.lastElementChild.onclick = null;
                    REPLIES.onclick = null;
                    HISTORY.onclick = null;
                    break;
                }
                REPLYING_TO.lastElementChild.onclick = () =>
                    window.sessionStorage.setItem('postId', newValue);
                REPLIES.onclick = () =>
                    window.location.assign(
                        new URL(`thread/${newValue}`, window.location.origin)
                    );
                HISTORY.onclick = () =>
                    window.location.assign(
                        new URL(`history/${newValue}`, window.location.origin)
                    );
                break;
            case 'reply-to-id':
            case 'reply-to-by':
                const REPLY_TO = this._shadow.querySelector('.replying-to');
                if (name === 'reply-to-id') {
                    const ANCHOR = REPLY_TO.querySelector('a');
                    newValue !== null
                        ? (ANCHOR.href = new URL(
                              `thread/${newValue}`,
                              window.location.origin
                          ))
                        : ANCHOR.removeAttribute('href');
                } else if (name === 'reply-to-by') {
                    REPLY_TO.querySelector('span').textContent =
                        newValue !== null ? newValue : '[undefined]';
                }
                this.hasAttribute('reply-to-id') &&
                this.hasAttribute('reply-to-by')
                    ? REPLY_TO.removeAttribute('style')
                    : (REPLY_TO.style.display = 'none');
                break;
            case 'posted-by':
                const POSTED_BY = this._shadow.querySelector('.posted-by > a');
                if (newValue === null) {
                    POSTED_BY.removeAttribute('href');
                    POSTED_BY.textContent = '[undefined]';
                    break;
                }
                POSTED_BY.href = new URL(newValue, window.location.origin);
                POSTED_BY.textContent = newValue;
                break;
            case 'posted-on':
                this._shadow.querySelector('.posted-on > span').textContent =
                    newValue !== null ? newValue : '[undefined]';
                break;
            case 'edited-on':
                const EDITED_ON = this._shadow.querySelector('.edited-on');
                if (newValue === null) {
                    EDITED_ON.lastElementChild.textContent = '[undefined]';
                    EDITED_ON.style.display = 'none';
                    break;
                }
                EDITED_ON.lastElementChild.textContent = newValue;
                EDITED_ON.style.display = 'block';
                break;
            case 'deleted-on':
                const DELETED_ON = this._shadow.querySelector('.deleted-on');
                if (newValue === null) {
                    DELETED_ON.lastElementChild.textContent = '[undefined]';
                    DELETED_ON.style.display = 'none';
                    break;
                }
                DELETED_ON.lastElementChild.textContent = newValue;
                DELETED_ON.style.display = 'block';
                break;
            case 'content':
                this._shadow.querySelector('.post-content').textContent =
                    newValue !== null ? newValue : '[undefined]';
                break;
            case 'likes':
                this._shadow.querySelector('.like > .badge').textContent =
                    newValue !== null ? newValue : '0';
                break;
            case 'like-action':
                this._shadow.querySelector('.like > .action').textContent =
                    newValue !== null ? newValue : 'like';
                break;
            case 'replies':
                this._shadow.querySelector('.replies > .badge').textContent =
                    newValue !== null ? newValue : '0';
                break;
            case 'history':
                this._shadow.querySelector('.history > .badge').textContent =
                    newValue !== null ? newValue : '0';
                break;
            case 'restricted':
                this._shadow.querySelector(
                    '.restricted.post-btns'
                ).style.display = newValue === null ? 'flex' : 'none';
                break;
        }
    }

    get postId() {
        return this.hasAttribute('post-id')
            ? this.getAttribute('post-id')
            : undefined;
    }

    set postId(value) {
        value !== null && value !== undefined
            ? this.setAttribute('post-id', value)
            : this.removeAttribute('post-id');
    }

    get replyToId() {
        return this.hasAttribute('reply-to-id')
            ? this.getAttribute('reply-to-id')
            : undefined;
    }

    set replyToId(value) {
        value !== null && value !== undefined
            ? this.setAttribute('reply-to-id', value)
            : this.removeAttribute('reply-to-id');
    }

    get replyToBy() {
        return this.hasAttribute('reply-to-by')
            ? this.getAttribute('reply-to-by')
            : undefined;
    }

    set replyToBy(value) {
        value !== null && value !== undefined
            ? this.setAttribute('reply-to-by', value)
            : this.removeAttribute('reply-to-by');
    }

    get postedBy() {
        return this.hasAttribute('posted-by')
            ? this.getAttribute('posted-by')
            : undefined;
    }

    set postedBy(value) {
        value !== null && value !== undefined
            ? this.setAttribute('posted-by', value)
            : this.removeAttribute('posted-by');
    }

    get postedOn() {
        return this.hasAttribute('posted-on')
            ? this.getAttribute('posted-on')
            : undefined;
    }

    set postedOn(value) {
        value !== null && value !== undefined
            ? this.setAttribute('posted-on', value)
            : this.removeAttribute('posted-on');
    }

    get editedOn() {
        return this.hasAttribute('edited-on')
            ? this.getAttribute('edited-on')
            : undefined;
    }

    set editedOn(value) {
        value !== null && value !== undefined
            ? this.setAttribute('edited-on', value)
            : this.removeAttribute('edited-on');
    }

    get deletedOn() {
        return this.hasAttribute('deleted-on')
            ? this.getAttribute('deleted-on')
            : undefined;
    }

    set deletedOn(value) {
        value !== null && value !== undefined
            ? this.setAttribute('deleted-on', value)
            : this.removeAttribute('deleted-on');
    }

    get content() {
        return this.hasAttribute('content')
            ? this.getAttribute('content')
            : undefined;
    }

    set content(value) {
        value !== null && value !== undefined
            ? this.setAttribute('content', value)
            : this.removeAttribute('content');
    }

    get likes() {
        return this.hasAttribute('likes')
            ? this.getAttribute('likes')
            : undefined;
    }

    set likes(value) {
        value !== null && value !== undefined
            ? this.setAttribute('likes', value)
            : this.removeAttribute('likes');
    }

    get likeAction() {
        return this.hasAttribute('like-action')
            ? this.getAttribute('like-action')
            : undefined;
    }

    set likeAction(value) {
        value !== null && value !== undefined
            ? this.setAttribute('like-action', value)
            : this.removeAttribute('like-action');
    }

    get replies() {
        return this.hasAttribute('replies')
            ? this.getAttribute('replies')
            : undefined;
    }

    set replies(value) {
        value !== null && value !== undefined
            ? this.setAttribute('replies', value)
            : this.removeAttribute('replies');
    }

    get history() {
        return this.hasAttribute('history')
            ? this.getAttribute('history')
            : undefined;
    }

    set history(value) {
        value !== null && value !== undefined
            ? this.setAttribute('history', value)
            : this.removeAttribute('history');
    }

    get restricted() {
        return this.hasAttribute('restricted');
    }

    set restricted(value) {
        Boolean(value)
            ? this.setAttribute('restricted', '')
            : this.removeAttribute('restricted');
    }

    addReply = (event) => {
        event.preventDefault();
        const FORM_CONTENT = this._shadow.querySelector('.form-content');
        const REQUEST = new Request(
            new URL('api/post/reply', window.location.origin),
            {
                body: JSON.stringify({
                    postId: this.postId,
                    reply: FORM_CONTENT.value,
                }),
                method: 'POST',
            }
        );
        const SUCCESS = {
            alert: 'Reply was successfully posted.',
            callback: (data) => {
                this.hidePostForm();
                this.replies = data.replyCount;
                if (this.parentElement.id === 'replying-to-post') {
                    fetchThread({ page: 1 }, 'pushState');
                } else if (this.parentElement.dataset.filter === 'thread') {
                    fetchThread({ 'post-id': this.postId }, 'pushState');
                } else {
                    fetchPosts({ 'post-id': this.postId }, 'pushState');
                }
            },
        };
        const FAILED = {
            alert: 'Reply was unsuccessfully posted',
            callback: (error) => {
                manageFormErrorMessage(
                    error.errors,
                    this._shadow.querySelector('.error-message'),
                    FORM_CONTENT,
                    this._shadow.querySelector('.btn.post')
                );
            },
            modal: {
                body: 'You have to be logged in to reply to a post',
                callback: () => {
                    window.sessionStorage.setItem('postId', this.postId);
                    window.sessionStorage.setItem('reply', FORM_CONTENT.value);
                    redirectToLogin();
                },
            },
        };
        generateFetch(REQUEST, SUCCESS, FAILED);
    };

    deletePost = () => {
        const REQUEST = new Request(
            new URL('api/post/delete', window.location.origin),
            {
                body: JSON.stringify({ postId: this.postId }),
                method: 'DELETE',
            }
        );
        const SUCCESS = {
            alert: 'Successfully deleted post.',
            callback: (data) => {
                this._shadow.querySelector('.edited-on').style.display = 'none';
                const DELETED_ON =
                    this._shadow.querySelector('.deleted-on > span');
                try {
                    this.deletedOn = stringifyDate(data.deletedOn);
                    DELETED_ON.classList.remove('date-error');
                } catch (error) {
                    renderError(error);
                    DELETED_ON.classList.add('date-error');
                    this.deletedOn = 'Error!';
                }
                DELETED_ON.style.display = 'block';
                this.content = data.content;
                this.history = data.historyCount;
                this.restricted = true;
            },
        };
        const FAILED = {
            alert: 'Unsuccessfully deleted post',
            modal: {
                body: 'You have to be logged in to delete a post',
                callback: () => {
                    window.sessionStorage.setItem('postId', this.postId);
                    redirectToLogin();
                },
            },
        };
        generateFetch(REQUEST, SUCCESS, FAILED);
    };

    hidePostForm = () => {
        const FORM_CONTENT = this._shadow.querySelector('.form-content');
        FORM_CONTENT.removeAttribute('placeholder');
        FORM_CONTENT.value = '';
        this._shadow.querySelector('.error-message').removeAttribute('style');
        const POST_FORM = this._shadow.querySelector('.post-form');
        POST_FORM.onsubmit = null;
        POST_FORM.removeAttribute('style');
        this._shadow.querySelector('.post-content').removeAttribute('style');
        for (const BUTTON of this._shadow.querySelectorAll(
            '.post-btns > .btn[disabled]'
        )) {
            BUTTON.removeAttribute('disabled');
        }
        this.blur();
    };

    showPostForm = (action) => {
        const POST_FORM = this._shadow.querySelector('.post-form');
        if (POST_FORM.style.display === 'flex') {
            return this.hidePostForm();
        }
        const FORM_CONTENT = POST_FORM.firstElementChild;
        let clickedButton;
        if (action === 'reply') {
            getValueFromSession(FORM_CONTENT, action, 'Reply', true);
            POST_FORM.onsubmit = this.addReply;
            clickedButton = 'Add Reply';
        } else if (action === 'edit') {
            getValueFromSession(FORM_CONTENT, 'newContent', this.content);
            POST_FORM.onsubmit = this.updatePostContent;
            this._shadow.querySelector('.post-content').style.display = 'none';
            clickedButton = 'Edit Post';
        }
        POST_FORM.style.display = 'flex';
        for (const BUTTON of this._shadow.querySelectorAll(
            '.post-btns > .btn'
        )) {
            if (BUTTON.textContent === clickedButton) {
                continue;
            }
            BUTTON.toggleAttribute('disabled');
        }
        FORM_CONTENT.focus();
    };

    updateLikes = () => {
        const POST_ID = this.postId;
        const ACTION =
            this._shadow.querySelector('.like > .action').textContent;
        const REQUEST = new Request(
            new URL(`api/post/${ACTION}`, window.location.origin),
            {
                body: JSON.stringify({
                    like: ACTION === 'like' ? true : false,
                    postId: POST_ID,
                }),
                method: 'PUT',
            }
        );
        const SUCCESS = {
            alert: `Successfully ${ACTION}d post.`,
            callback: (data) => {
                this.likeAction = data.nextAction;
                this.likes = data.likeCount;
                this.blur();
            },
        };
        const FAILED = {
            alert: `Unsuccessfully ${ACTION}d post`,
            callback: () => {
                this.blur();
            },
            modal: {
                body: 'You have to be logged in to like or unlike a post',
                callback: () => {
                    window.sessionStorage.setItem('postId', POST_ID);
                    redirectToLogin();
                },
            },
        };
        generateFetch(REQUEST, SUCCESS, FAILED);
    };

    updatePostContent = (event) => {
        console.log(event);
        event.preventDefault();
        const FORM_CONTENT = this._shadow.querySelector('.form-content');
        if (this.content === FORM_CONTENT.value) {
            let modal = generateConfirmModal(
                'OK',
                "The post's content has not changed. If you want to exit edit mode press ok or you can cancel this warning and still make changes to the post's content.",
                'Cancel',
                'Warning'
            );
            modal.actionButton.onclick = () => {
                // Hide bootstrap modal requires the use of JQuery
                $('#modal').modal('hide');
                this.hidePostForm();
            };
            return;
        }
        const REQUEST = new Request(
            new URL('api/post/edit', window.location.origin),
            {
                body: JSON.stringify({
                    content: FORM_CONTENT.value,
                    postId: this.postId,
                }),
                method: 'PUT',
            }
        );
        const SUCCESS = {
            alert: 'Post was successfully edited.',
            callback: (data) => {
                const EDITED_ON = this._shadow.querySelector('.edited-on');
                try {
                    this.editedOn = stringifyDate(data.editedOn);
                    EDITED_ON.classList.remove('date-error');
                } catch (error) {
                    renderError(error);
                    EDITED_ON.classList.add('date-error');
                    this.editedOn = 'Error!';
                }
                EDITED_ON.style.display = 'block';
                this.content = data.content;
                this.hidePostForm();
                this.history = data.historyCount;
            },
        };
        const FAILED = {
            alert: 'Post was unsuccessfully edited',
            callback: (error) => {
                manageFormErrorMessage(
                    error.errors,
                    this._shadow.querySelector('.error-message'),
                    FORM_CONTENT,
                    this._shadow.querySelector('.btn.post')
                );
            },
            modal: {
                body: 'You have to be logged in to edit a post',
                callback: () => {
                    window.sessionStorage.setItem('postId', this.postId);
                    window.sessionStorage.setItem(
                        'newContent',
                        FORM_CONTENT.value
                    );
                    redirectToLogin();
                },
            },
        };
        generateFetch(REQUEST, SUCCESS, FAILED);
    };
}

function getValueFromSession(element, key, initialValue, placeholder = false) {
    if (!(key in window.sessionStorage)) {
        placeholder === true
            ? (element.placeholder = initialValue)
            : (element.value = initialValue);
    }

    element.value = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return;
}

export { Post };
