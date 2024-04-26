import { Post } from '../web_components/js/custom_post.mjs';
import { stringifyDate } from './date.mjs';
import { generateFetch } from './fetch.mjs';
import { resizePagination } from './pagination.mjs';

customElements.define('custom-post', Post);

function fetchPosts(urlSearchParams, history) {
    const SIZE = document.querySelector('.pagination').dataset.size;
    const SEARCH_PARAMS = new URLSearchParams(urlSearchParams);
    if (SIZE !== undefined) {
        SEARCH_PARAMS.append('paginator-size', SIZE);
    }
    const REQUEST = new Request(
        new URL(
            `api/posts/${
                document.querySelector('#posts').dataset.filter
            }?${SEARCH_PARAMS}`,
            window.location.origin
        )
    );
    const SUCCESS = {
        callback: (data) => {
            renderPosts(data, fetchPosts, SEARCH_PARAMS, history);
            resizePagination();
        },
    };
    const FAILED = {
        alert: 'Unsuccessfully fetched posts',
        modal: {
            body: 'You have to be logged in to fetch posts from the users you are following',
            callback: redirectToLogin,
        },
    };
    generateFetch(REQUEST, SUCCESS, FAILED);
}

function fetchThread(urlSearchParams, history) {
    const SIZE = document.querySelector('.pagination').dataset.size;
    const SEARCH_PARAMS = new URLSearchParams(urlSearchParams);
    if (SIZE !== undefined) {
        SEARCH_PARAMS.append('paginator-size', SIZE);
    }
    const REQUEST = new Request(
        new URL(
            `api/posts/thread/${
                document.querySelector('#posts').dataset.threadStart
            }?${SEARCH_PARAMS}`,
            window.location.origin
        )
    );
    const SUCCESS = {
        callback: (data) => {
            const REPLYING_TO_POST =
                document.querySelector('#replying-to-post');
            if (REPLYING_TO_POST.querySelectorAll('custom-post').length === 0) {
                const POST_ELEMENT = REPLYING_TO_POST.appendChild(
                    document.createElement('custom-post')
                );
                const POST = data.post;
                POST_ELEMENT.content = POST.content;
                POST_ELEMENT.deletedOn = stringifyDate(POST.deletedOn);
                POST_ELEMENT.editedOn = stringifyDate(POST.editedOn);
                POST_ELEMENT.history = POST.historyCount;
                POST_ELEMENT.likeAction = POST.likeAction;
                POST_ELEMENT.likes = POST.likeCount;
                POST_ELEMENT.postedBy = POST.postedBy;
                POST_ELEMENT.postedOn = stringifyDate(POST.postedOn);
                POST_ELEMENT.postId = POST.id;
                POST_ELEMENT.replies = POST.replyCount;
                POST_ELEMENT.replyToBy = POST.replyingTo.postedBy;
                POST_ELEMENT.replyToId = POST.replyingTo.id;
                POST_ELEMENT.restricted = POST.restricted;
                REPLYING_TO_POST.removeAttribute('style');
            }
            renderPosts(data, fetchThread, SEARCH_PARAMS, history);
            resizePagination();
        },
    };
    const FAILED = { alert: 'Unsuccessfully fetched thread' };
    generateFetch(REQUEST, SUCCESS, FAILED);
}

function manageFormErrorMessage(
    errors,
    messageElement,
    contentElement,
    button
) {
    if (errors !== undefined && errors.has('content')) {
        messageElement.textContent = errors.get('content');
        messageElement.style.display = 'block';
        contentElement.focus();
    } else {
        messageElement.removeAttribute('style');
        button.blur();
    }
}

function redirectToLogin() {
    const REDIRECT = new URL(`login`, window.location.origin);
    if (window.location.pathname !== '/') {
        REDIRECT.searchParams.set('redirect-to', window.location.pathname);
        REDIRECT.search = decodeURIComponent(REDIRECT.search);
    }
    window.location.assign(REDIRECT);
}

function renderPosts(data, pageLinkCallback, search_params, history) {
    const POSTS = document.querySelector('#posts');
    if (data.numPosts === 0) {
        const MESSAGE = document.createElement('p');
        MESSAGE.id = 'empty-message';
        MESSAGE.textContent = 'No posts found!';
        POSTS.replaceChildren(MESSAGE);
        return;
    }

    const PAGE = data.page;
    document.title = document.title.replace(
        /\(Page \d+\)/,
        `(Page ${PAGE.number})`
    );
    document.querySelector(
        '#posts-range'
    ).textContent = `(${PAGE.startIndex} - ${PAGE.endIndex})`;

    if (POSTS.dataset.postIds !== PAGE.postIds) {
        const POSTS_DOC_FRAG = document.createDocumentFragment();
        for (const POST of PAGE.posts) {
            const POST_ELEMENT = POSTS_DOC_FRAG.appendChild(
                document.createElement('custom-post')
            );
            POST_ELEMENT.content = POST.content;
            POST_ELEMENT.deletedOn = stringifyDate(POST.deletedOn);
            POST_ELEMENT.editedOn = stringifyDate(POST.editedOn);
            POST_ELEMENT.history = POST.historyCount;
            POST_ELEMENT.likeAction = POST.likeAction;
            POST_ELEMENT.likes = POST.likeCount;
            POST_ELEMENT.postedBy = POST.postedBy;
            POST_ELEMENT.postedOn = stringifyDate(POST.postedOn);
            POST_ELEMENT.postId = POST.id;
            POST_ELEMENT.replies = POST.replyCount;
            POST_ELEMENT.replyToBy = POST.replyingTo.postedBy;
            POST_ELEMENT.replyToId = POST.replyingTo.id;
            POST_ELEMENT.restricted = POST.restricted;
        }
        POSTS.replaceChildren(POSTS_DOC_FRAG);
        POSTS.dataset.pageNum = PAGE.number;
        POSTS.dataset.postIds = PAGE.postIds;
    }

    let postId;
    if ('postId' in window.sessionStorage) {
        postId = window.sessionStorage.getItem('postId');
        window.sessionStorage.removeItem('postId');
    } else if (search_params.has('post-id')) {
        postId = search_params.get('post-id');
    }

    if (postId !== undefined) {
        const POST = POSTS.querySelector(`custom-post[post-id="${postId}"]`);
        if (POST !== null) {
            POST.scrollIntoView(true);
            if ('reply' in window.sessionStorage) {
                POST.showPostForm('reply');
            } else if ('newContent' in window.sessionStorage) {
                POST.showPostForm('edit');
            }
        }
        window.sessionStorage.removeItem('reply');
        window.sessionStorage.removeItem('newContent');
    } else {
        POSTS.parentElement.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    }

    if (history === 'pushState' && window.history.state.page !== PAGE.number) {
        window.history.pushState({ page: PAGE.number }, '');
    } else if (history === 'replaceState') {
        window.history.replaceState({ page: PAGE.number }, '');
    }

    const PAGINATION = document.querySelector('.pagination');
    PAGINATION.dataset.numPages = data.paginator.numPages;

    document
        .querySelector('#first-page')
        .classList.toggle('disabled', !PAGE.hasPrevious);

    const PREVIOUS = document.querySelector('#previous-page');
    PAGE.hasPrevious
        ? (PREVIOUS.firstElementChild.dataset.pageNum = PAGE.previousPageNumber)
        : PREVIOUS.firstElementChild.removeAttribute('data-page-num');
    PREVIOUS.classList.toggle('disabled', !PAGE.hasPrevious);

    const PAGINATOR_DOC_FRAG = document.createDocumentFragment();
    for (const PAGE_NUMBER of data.paginator.pageRange) {
        let pageItem;
        let pageLink;
        switch (PAGE_NUMBER) {
            case PAGE.number:
                pageItem = document.createElement('li');
                pageItem.ariaCurrent = 'page';
                pageItem.className = 'page-item active';
                pageLink = pageItem.appendChild(document.createElement('span'));
                pageLink.className = 'current page-link';
                const SPAN = pageLink.appendChild(
                    document.createElement('span')
                );
                SPAN.className = 'sr-only';
                SPAN.textContent = '(current)';
                pageLink.append(document.createTextNode(PAGE_NUMBER));
                0;
                break;
            case data.paginator.ellipsis:
                pageItem = document.createElement('li');
                pageItem.className = 'page-item disabled';
                pageLink = pageItem.appendChild(document.createElement('span'));
                pageLink.className = 'page-link';
                pageLink.textContent = PAGE_NUMBER;
                break;
            default:
                pageItem = document.createElement('li');
                pageItem.className = 'page-item';
                pageLink = pageItem.appendChild(document.createElement('a'));
                pageLink.className = 'page-link';
                pageLink.dataset.pageNum = PAGE_NUMBER;
                pageLink.textContent = PAGE_NUMBER;
        }
        PAGINATOR_DOC_FRAG.append(pageItem);
    }

    document
        .querySelector('#numbered-page-items')
        .replaceChildren(PAGINATOR_DOC_FRAG);

    const NEXT = document.querySelector('#next-page');
    PAGE.hasNext
        ? (NEXT.firstElementChild.dataset.pageNum = PAGE.nextPageNumber)
        : NEXT.firstElementChild.removeAttribute('data-page-num');
    NEXT.classList.toggle('disabled', !PAGE.hasNext);

    const LAST = document.querySelector('#last-page');
    LAST.firstElementChild.dataset.pageNum = PAGE.numPages;
    LAST.classList.toggle('disabled', !PAGE.hasNext);

    for (const LINK of PAGINATION.querySelectorAll('a.page-link')) {
        LINK.addEventListener('click', () =>
            pageLinkCallback({ page: LINK.dataset.pageNum }, 'pushState')
        );
    }

    PAGINATION.parentElement.removeAttribute('style');
}

export { fetchPosts, fetchThread, manageFormErrorMessage, redirectToLogin };
