/** Call signature shared by global fetch and test doubles. Omits Bun's fetch.preconnect. */
export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;
