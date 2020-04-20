import axios from 'axios'
import { camelCase } from 'camel-case'
import config from 'config'

export class AccessToken {
  constructor({
    grantType = 'client_credentials',
    scope,
    wskey = config.get('wskey.key'),
    wskeySecret = config.get('wskey.secret'),
    tokenHost = 'https://oauth.oclc.org',
    tokenPath = '/token',
    expiresAt = null,
    authenticatingInstitutionId = null,
    contextInstitutionId = null,

  } = {}) {
    this.grantType = grantType;
    this.tokenConfig = {
      scope
    };
    this.tokenHost = tokenHost;
    this.tokenPath = tokenPath;
    this.scope = scope;
    this.wskey = wskey;
    this.wskeySecret = wskeySecret;

    // Token data
    this.expiresAt = expiresAt;
    this.authenticatingInstitutionId = authenticatingInstitutionId;
    this.contextInstitutionId = contextInstitutionId;
    this.tokenType = null;
  }

  async requestAccessToken({ grantType = this.grantType } = {}) {
    return new Promise((resolve, reject) => {
      axios.post(this.tokenHost + this.tokenPath, {}, {
        params: {
          grant_type: grantType,
          scope: normalizeScope(this.tokenConfig.scope)
        },
        auth: {
          username: this.wskey,
          password: this.wskeySecret
        }
      })
        .then(response => {
          console.log('response')
          if (response.status === 200) {
            // Success
            Object.keys(response.data).forEach(key => this[camelCase(key)] = response.data[key])
            return resolve(this);
          }

          const data = {}

          Object.keys(response.data).forEach(key => data[camelCase(key)] = response.data[key])
          reject(data);
        })
        .catch((e) => {
          reject(e)
        })
    })

  }

  async create() {
    return this.requestAccessToken();
  }

  // async refresh() {
  //   return this.requestAccessToken({ grantType: 'refresh_token' });
  // }

  /**
    * Determines if the current access token has already expired or if it is about to expire
    *
    * @param {Number} expirationWindowSeconds Window of time before the actual expiration to refresh the token
    * @returns {Boolean}
    */

  isExpired(expirationWindowSeconds = 0) {
    if (this.expiresAt) {
      expirationWindowSeconds = expirationWindowSeconds * 1000;
      console.log(new Date(this.expiresAt) - Date.now())
      return new Date(this.expiresAt) - Date.now() <= expirationWindowSeconds;
    }
    return true;
  }
}

function normalizeScope(scope) {
  // Build a space separated scope list from an array of scopes.
  let normalizedScope = "";
  if (scope && Array.isArray(scope)) {
    for (let i = 0; i < scope.length; i++) {
      normalizedScope += scope[i];
      if (i !== scope.length - 1) {
        normalizedScope += " ";
      }
    }
  }
  return normalizedScope;
}