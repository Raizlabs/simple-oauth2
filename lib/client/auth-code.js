'use strict';

const url = require('url');
const qs = require('querystring');
const coreModule = require('./../core');

/**
 * Authorization Code flow implementation
 */
module.exports = (config) => {
  const core = coreModule(config);
  const authorizeUrl = url.resolve(config.auth.authorizeHost, config.auth.authorizePath);

  /**
   * Redirect the user to the autorization page
   * @param  {String} params.redirectURI A string that represents the registered application URI
   *                                     where the user is redirected after authentication
   * @param {String|Array<String>} params.scope A String or array of strings
   *                                     that represents the application privileges
   * @param {String} params.state A String that represents an option opaque value used by the client
   *                              to main the state between the request and the callback
   * @return {String} the absolute authorization url
   */
  function authorizeURL(params = {}) {
    const baseParams = {
      response_type: 'code',
      [config.client.idParamName]: config.client.id,
    };

    if (Array.isArray(params.scope)) {
      params.scope = params.scope.join(',');
    }

    const options = Object.assign({}, baseParams, params);

    return `${authorizeUrl}?${qs.stringify(options)}`;
  }

  /**
   * Returns the Strava Access Token Object
   *
   * Update your Strava OAuth flow by October 15, 2018
   * Requests to POST /token with grant_type header will receive a short-lived access token and
   * refresh token starting October 15, 2018.
   *
   * On October 15, 2018 the Strava API team will release a refresh token OAuth 2.0 implementation.
   * This date marks the beginning of a migration period during which any requests with a
   * grant_type header will be routed to new authorization logic for refresh tokens, while requests
   * without a grant_type will use the older, existing logic. Both paths will be open for the
   * duration of the migration period, after which the old logic will be deprecated and removed.
   * Rest assured, we will keep both systems working in parallel for a lengthy period. Look out for
   * another email with comprehensive details about refresh tokens and the migration period on
   * October 15, 2018.
   *
   * Our logs indicate that your application is already including a grant_type header in requests
   * to the `POST /token` endpoint. In order to ensure that authentication continues to work as
   * expected once the migration period begins, you will need to stop sending a grant_type header.
   * Once the migration period has begun and you're ready to integrate against the refresh token
   * protocol, you can start sending grant_type again.
   *
   * We'd like all applications to migrate to refresh tokens as soon as possible. Please email
   * developers@strava.com if you're unable to stop sending the grant_type header by October 15,
   * and certainly let us know if you have any questions. We'll release full documentation and
   * enable the migration period on October 15, so look out for another email from us then.
   *
   * @param  {String} params.code Authorization code (from previous step)
   * @param  {String} params.redirecURI A string that represents the callback uri
   * @return {Promise}
   */
  async function getStravaToken(params) {
    const options = Object.assign({}, params);

    return core.request(config.auth.tokenPath, options);
  }

  /**
   * Returns the Access Token Object
   * @param  {String} params.code Authorization code (from previous step)
   * @param  {String} params.redirecURI A string that represents the callback uri
   * @return {Promise}
   */
  async function getToken(params) {
    const options = Object.assign({}, params, {
      grant_type: 'authorization_code',
    });

    return core.request(config.auth.tokenPath, options);
  }

  return {
    authorizeURL,
    getStravaToken,
    getToken,
  };
};
