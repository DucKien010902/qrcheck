const axios = require('axios');
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let tenantTokenCache = null;
let tenantExpire = 0;

/**
 * Đổi code lấy user access token (khi user login)
 */
async function exchangeCodeForUserToken(code) {
  const res = await axios.post(
    'https://open.larksuite.com/open-apis/authen/v1/access_token',
    {
      grant_type: 'authorization_code',
      code,
      app_id: APP_ID,
      app_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI,
    }
  );

  if (res.data.code !== 0) {
    throw new Error(
      'Lấy user access_token thất bại: ' + JSON.stringify(res.data)
    );
  }

  return res.data.data; // { access_token, refresh_token, ... user info }
}

/**
 * Lấy tenant token (cache để tránh gọi nhiều lần)
 */
async function getTenantToken() {
  const now = Date.now();
  if (tenantTokenCache && now < tenantExpire) {
    return tenantTokenCache;
  }

  const res = await axios.post(
    'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
    {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    }
  );

  if (res.data.code !== 0) {
    throw new Error(
      'Lấy tenant_access_token thất bại: ' + JSON.stringify(res.data)
    );
  }

  tenantTokenCache = res.data.tenant_access_token;
  tenantExpire = now + res.data.expire * 1000;
  return tenantTokenCache;
}

module.exports = { exchangeCodeForUserToken, getTenantToken };
