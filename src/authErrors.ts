/** Browser-safe, fixed authentication error vocabulary. No credentials or provider messages. */
export const AUTH_ERROR_MESSAGES:Record<string,string>={
 INVALID_EMAIL_OR_PASSWORD:"Email address or password is incorrect.",
 EMAIL_NOT_VERIFIED:"Verify your email address before signing in.",
 TOO_MANY_REQUESTS:"Too many authentication attempts. Please try again later.",
 USER_ALREADY_EXISTS:"An account already exists for this email. Try signing in.",
 USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:"An account already exists for this email. Try signing in.",
 EMAIL_ALREADY_EXISTS:"An account already exists for this email. Try signing in.",
 INVALID_EMAIL:"The authentication service did not accept this email address.",
 PASSWORD_TOO_SHORT:"The authentication service requires a longer password.",
 PASSWORD_TOO_LONG:"The authentication service requires a shorter password.",
 SIGN_UP_DISABLED:"The authentication service has registration disabled. The HSI administrator must enable account creation.",
 SIGNUP_DISABLED:"The authentication service has registration disabled. The HSI administrator must enable account creation.",
 INVALID_ORIGIN:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
 ORIGIN_NOT_ALLOWED:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
 UNTRUSTED_ORIGIN:"The authentication service has not approved this website’s origin. The HSI administrator must update its trusted origins.",
 FAILED_TO_CREATE_USER:"The authentication service could not create the account. Please try again or contact the HSI administrator.",
 AUTH_UNAVAILABLE:"Authentication service unavailable. Please retry or contact the HSI administrator.",
 AUTH_INVALID_RESPONSE:"Authentication service returned an unexpected response. Contact the HSI administrator.",
 AUTH_GATEWAY_NOT_CONFIGURED:"Authentication gateway configuration is incomplete. The HSI administrator must check the deployment settings.",
 DEPLOYMENT_ORIGIN_MISMATCH:"This website address does not match HSI_PUBLIC_ORIGIN in Vercel. Use the configured website address or ask the HSI administrator to correct it and redeploy.",
 INVALID_CALLBACK_URL:"The authentication service has not approved the verification callback address. The HSI administrator must check the site's trusted origins.",
 INVALID_REDIRECT_URL:"The authentication service has not approved the sign-in redirect address. The HSI administrator must check the site's trusted origins.",
 MISSING_OR_NULL_ORIGIN:"The authentication service could not verify the website origin. The HSI administrator must check its trusted origins and gateway configuration.",

 AUTH_PROVIDER_REJECTED:"The authentication provider rejected the request.",
 INVALID_PASSWORD:"Email address or password is incorrect.",
 CREDENTIAL_ACCOUNT_NOT_FOUND:"Email/password sign-in is not available for this account. Use its original sign-in method or contact the HSI administrator.",
 FAILED_TO_CREATE_SESSION:"The authentication provider could not create a session. Contact the HSI administrator.",
 FAILED_TO_SEND_VERIFICATION_EMAIL:"The authentication provider could not send verification email. The HSI administrator must check email delivery.",
 INVALID_CREDENTIAL_FIELDS:"Check the email address and password fields.",
 INVALID_NAME:"Enter a valid name before creating the account.",
 JSON_REQUIRED:"The authentication request format was rejected. Refresh the page and try again.",
 INVALID_JSON:"The authentication request could not be read. Refresh the page and try again.",
 PAYLOAD_TOO_LARGE:"The authentication request was too large. Refresh the page and try again.",
 VERIFICATION_SESSION_REQUIRED:"Sign in again before requesting email verification.",
};

function object(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==="object"&&!Array.isArray(value)}
/** Accept only fixed, known codes from common provider envelopes; never echo arbitrary error text. */
export function knownAuthErrorCode(value:unknown):string|null{
 if(!object(value))return null;
 const error=object(value.error)?value.error:null;
 for(const candidate of [value.code,value.error_code,error?.code,error?.error_code,typeof value.error==="string"?value.error:null]){
  if(typeof candidate!=="string")continue;
  const code=candidate.toUpperCase();
  if(Object.prototype.hasOwnProperty.call(AUTH_ERROR_MESSAGES,code))return code;
 }
 return null;
}
