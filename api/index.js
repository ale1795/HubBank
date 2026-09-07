// Vercel serverless entry point — re-exports the same Express app used for
// local dev (server/index.js), so every /api/* route runs identically in
// both places. See vercel.json for the rewrite that sends /api/* here.
export { default } from '../server/index.js';
