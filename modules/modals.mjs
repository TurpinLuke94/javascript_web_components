function generateAlertModal(body, dismissButtonText, heading) {
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 3) {
        throw new TypeError(
            `generateAlert() takes exactly 3 arguments (${NUM_ARGS} given)`
        );
    }

    for (const [KEY, VALUE] of [
        ['body', body],
        ['dismissButtonText', dismissButtonText],
        ['heading', heading],
    ]) {
        if (typeof VALUE === 'string') {
            continue;
        }
        throw new TypeError(
            `generateAlert()'s '${KEY}' argument is not a 'String' type`
        );
    }

    const MODAL = document.querySelector('#modal');
    MODAL.querySelector('.modal-title').textContent = heading;
    MODAL.querySelector('.modal-body').textContent = body;
    const ACTION_BTN = MODAL.querySelector('.action-btn');
    ACTION_BTN.style.display = 'none';
    ACTION_BTN.onclick = null;
    const DISMISS_BTN = MODAL.querySelector('.dismiss-btn');
    DISMISS_BTN.classList.replace('btn-secondary', 'btn-primary');
    DISMISS_BTN.textContent = dismissButtonText;

    // Show bootstrap modal requires the use of JQuery
    $('#modal').modal('show');
}

function generateConfirmModal(
    actionButtonText,
    body,
    dismissButtonText,
    heading
) {
    const NUM_ARGS = arguments.length;
    if (NUM_ARGS !== 4) {
        throw new TypeError(
            `generateConfirm() takes exactly 4 arguments (${NUM_ARGS} given)`
        );
    }

    for (const [KEY, VALUE] of [
        ['actionButtonText', actionButtonText],
        ['body', body],
        ['dismissButtonText', dismissButtonText],
        ['heading', heading],
    ]) {
        if (typeof VALUE === 'string') {
            continue;
        }
        throw new TypeError(
            `generateConfirm()'s '${KEY}' argument is not a 'String' type`
        );
    }

    const MODAL = document.querySelector('#modal');
    MODAL.querySelector('.modal-title').textContent = heading;
    MODAL.querySelector('.modal-body').textContent = body;
    const ACTION_BTN = MODAL.querySelector('.action-btn');
    ACTION_BTN.removeAttribute('style');
    ACTION_BTN.textContent = actionButtonText;
    ACTION_BTN.onclick = null;
    const DISMISS_BTN = MODAL.querySelector('.dismiss-btn');
    DISMISS_BTN.classList.replace('btn-primary', 'btn-secondary');
    DISMISS_BTN.textContent = dismissButtonText;

    // Show bootstrap modal requires the use of JQuery
    $('#modal').modal('show');

    return { actionButton: ACTION_BTN };
}

export { generateAlertModal, generateConfirmModal };
