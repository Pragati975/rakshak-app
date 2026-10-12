// Build-time switches (set in .env.production / .env.demo, see PLAYSTORE.md)
//   VITE_ENABLE_DEMO=true  -> shows "Continue in demo mode" (sample data, fake simulation)
//   VITE_ENABLE_PUSH=true  -> registers for Firebase push (only after the Cloud Functions are deployed)
export const DEMO_ENABLED = !!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true'
export const PUSH_ENABLED = import.meta.env.VITE_ENABLE_PUSH === 'true'
// Public web page with your privacy policy (host privacy-policy.html, for example on GitHub Pages)
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL || 'https://pragati975.github.io/rakshak/privacy-policy.html'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
