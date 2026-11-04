/** Browser-facing Neon Better Auth transport. Public URL only; roles remain backend-owned. */
import {createHsiAuthClient} from "./hsiAuthClient";
export type {HsiAuthSession} from "./hsiAuthClient";
const client=createHsiAuthClient(import.meta.env.VITE_HSI_AUTH_BASE_URL);
export const authBaseUrl=client.baseUrl;
export const hsiAuth=client;
