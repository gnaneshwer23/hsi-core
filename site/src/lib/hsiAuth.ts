/** Browser-facing Neon Better Auth transport. Public URL only; roles remain backend-owned. */
import {createHsiAuthClient,parseAuthBaseUrl} from "./hsiAuthClient";
export type {HsiAuthSession} from "./hsiAuthClient";
// Enable the same-origin gateway only after its server configuration is ready.
// This preserves existing sign-in during rollout. Neither mode grants research authority.
const configured=parseAuthBaseUrl(import.meta.env.VITE_HSI_AUTH_BASE_URL);
const mode=import.meta.env.VITE_HSI_USE_AUTH_GATEWAY==="true"?"same-origin":"provider";
const client=createHsiAuthClient(configured,fetch,8000,mode);
export const authBaseUrl=client.baseUrl;
export const hsiAuth=client;
