import { fetchPosts, fetchThread } from './posts.mjs';

function resizePagination() {
    const WIDTH = window.innerWidth - 34;
    let limits;
    if (WIDTH > 990) {
        limits = {
            firstLast: 16,
            pagination: Infinity,
            posts: 24,
            previousNext: 20,
            size: 'x-large',
        };
    } else if (WIDTH <= 990 && WIDTH > 734) {
        limits = {
            firstLast: 10,
            pagination: Infinity,
            posts: 18,
            previousNext: 14,
            size: 'large',
        };
    } else if (WIDTH <= 734 && WIDTH > 391) {
        limits = {
            firstLast: 0,
            pagination: 5,
            posts: 13,
            previousNext: 8,
            size: 'medium',
        };
    } else if (WIDTH <= 391) {
        limits = {
            firstLast: 0,
            pagination: 1,
            posts: 8,
            previousNext: 2,
            size: 'small',
        };
    }

    const PAGINATION = document.querySelector('.pagination');
    const PAGES = Number(PAGINATION.dataset.numPages);
    const POSTS = document.querySelector('#posts');
    if (PAGES <= limits.posts && PAGINATION.dataset.size !== undefined) {
        delete PAGINATION.dataset.size;
        POSTS.dataset.filter === 'thread'
            ? fetchThread({ page: POSTS.dataset.pageNum })
            : fetchPosts({ page: POSTS.dataset.pageNum });
        return;
    } else if (
        PAGES > limits.posts &&
        PAGINATION.dataset.size !== limits.size
    ) {
        PAGINATION.dataset.size = limits.size;
        POSTS.dataset.filter === 'thread'
            ? fetchThread({ page: POSTS.dataset.pageNum })
            : fetchPosts({ page: POSTS.dataset.pageNum });
        return;
    }

    PAGINATION.classList.toggle('pagination-sm', PAGES > limits.pagination);
    const FIRST = PAGINATION.querySelector('#first-page');
    FIRST.classList.toggle('hide', PAGES > limits.firstLast || PAGES <= 2);
    FIRST.nextElementSibling.classList.toggle(
        'start',
        (PAGES > limits.firstLast && PAGES <= limits.previousNext) || PAGES <= 2
    );
    const LAST = PAGINATION.querySelector('#last-page');
    LAST.classList.toggle('hide', PAGES > limits.firstLast || PAGES <= 2);
    LAST.previousElementSibling.classList.toggle(
        'end',
        (PAGES > limits.firstLast && PAGES <= limits.previousNext) || PAGES <= 2
    );
    const PREVIOUS = PAGINATION.querySelector('#previous-page');
    PREVIOUS.classList.toggle(
        'hide',
        PAGES > limits.previousNext || PAGES === 1
    );
    PREVIOUS.nextElementSibling.firstElementChild.classList.toggle(
        'start',
        PAGES > limits.previousNext || PAGES === 1
    );
    const NEXT = PAGINATION.querySelector('#next-page');
    NEXT.classList.toggle('hide', PAGES > limits.previousNext || PAGES === 1);
    NEXT.previousElementSibling.lastElementChild.classList.toggle(
        'end',
        PAGES > limits.previousNext || PAGES === 1
    );
}

export { resizePagination };
