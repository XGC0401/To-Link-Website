# To-Link

To-Link is a modular community lifestyle web app built with Next.js, TypeScript, and a maintainable feature-based structure. The current implementation covers the requested UI surface for authentication, home, posts, nearby discovery, connections, activities, building tools, and settings, while keeping real-service integration isolated behind configuration.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Firebase client setup hooks for auth and database
- Cloudinary-ready signed upload flow for images and videos
- n8n webhook proxy for AI chat requests
- Leaflet with OpenStreetMap tiles for free map rendering
- Open-Meteo plus browser geolocation for live weather and location data

## Current State

- Root auth flows exist for login, register, forgot password, and reset password.
- The dashboard shell includes the sidebar, top bar, language toggle, font scaling, theme switching, notification tray, and info overlays.
- All requested main route groups are present in the UI:
	- Home
	- Posts: All, Sharing, 2nd Hand, Lost & Find, Quests
	- Nearby: Shops, Communities
	- Connections: Messages, Friends
	- Activities: Events, Calendar, Booking Status
	- Building: Facilities, AI Chat, Documents
	- Settings: Website Settings, Profile Settings
- Weather and location use live browser-based APIs with free services.
- Firebase setup is prepared but requires your real project credentials before live auth and Firestore persistence can be enabled.
- Cloudinary media upload support is prepared and needs your Cloudinary cloud name, API key, and API secret before uploads can go live.
- AI Chat can call an n8n workflow when `AI_ASSISTANT_WEBHOOK_URL` is set in your local environment.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Add your Firebase, Cloudinary, and `AI_ASSISTANT_WEBHOOK_URL` values to `.env.local` when ready.

4. Start development:

```bash
npm run dev
```

5. Validate production build:

```bash
npm run build
```

## Notes

- Theme, language, and font-size preferences use cookies instead of browser local storage.
- The current app uses seeded data for feature content until Firebase-backed persistence is connected.
- Media uploads are designed for Cloudinary instead of Firebase Storage because Firebase Storage now requires Blaze billing to create or use buckets.
- AI Chat now forwards `message`, `conversationId`, and `history` to the configured n8n webhook and accepts common reply fields such as `reply`, `response`, `message`, `output`, `text`, `answer`, or `content`.
- If you want Mapbox later, the nearby feature is isolated enough to swap map providers without restructuring the rest of the app.