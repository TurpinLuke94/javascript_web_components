import * as ALERT from './alerts.mjs';
import * as MODAL from './modals.mjs';
import {
    ApiForbiddenError,
    ApiMethodError,
    ApiNotFoundError,
    ApiRequestError,
    ApiUnauthorizedError,
    ApiValidationError,
    renderError,
} from './errors.mjs';

function generateFetch(request, success, failed) {
    fetch(request)
        // Handle the server's http response
        .then((response) => response.json())

        // Handle the JSON body content from the server's response
        .then((response) => {
            console.log(response);
            if (response === undefined) {
                return;
            }

            // Alert the user of an error
            switch (response.http.status) {
                case 400:
                    throw 'validationErrors' in response
                        ? new ApiValidationError(
                              response.message,
                              response.validationErrors
                          )
                        : new ApiRequestError(response.message);
                case 401:
                    throw new ApiUnauthorizedError(response.message);
                case 403:
                    throw new ApiForbiddenError(response.message);
                case 404:
                    throw new ApiNotFoundError(response.message);
                case 405:
                    throw new ApiMethodError(response.message);
            }

            // Execute the success callback
            if ('callback' in success) {
                success.callback(response);
            }

            if (!('alert' in success)) {
                return;
            }

            // Alert the user of a success
            try {
                try {
                    ALERT.generateAlert('success', 'Success', success.alert);
                } catch (error) {
                    renderError(error);
                    MODAL.generateAlertModal(success.alert, 'OK', 'Success');
                }
            } catch (error) {
                renderError(error);
                alert(`Success\n${success.alert}`);
            }
        })

        // Handle any errors that are generated from the request and response
        .catch((error) => {
            renderError(error);
            try {
                try {
                    ALERT.generateAlert(
                        'danger',
                        'Failed',
                        `${failed.alert}. An error (${error.name}) occurred.`
                    );
                } catch (err) {
                    renderError(err);
                    MODAL.generateAlertModal(
                        `${failed.alert}. An error (${error.name}) occurred.`,
                        'OK',
                        'Failed'
                    );
                }
            } catch (err) {
                renderError(err);
                alert(
                    `Failed\n${failed.alert}. An error (${error.name}) occurred.`
                );
            }

            if ('callback' in failed) {
                failed.callback(error);
            }

            if (error.name !== 'ApiUnauthorizedError') {
                return;
            }
            let modal = undefined;
            try {
                modal = MODAL.generateConfirmModal(
                    'OK',
                    `${failed.modal.body}. You will now be redirected to the log in page, if you press ok or you can cancel this request.`,
                    'Cancel',
                    'Unauthorized!'
                );
            } catch (err) {
                renderError(err);
                return;
            }
            modal.actionButton.onclick = failed.modal.callback;
        });
}

export { generateFetch };
