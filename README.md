# Swagger Editor App

A web application combining a Swagger/OpenAPI UI with a REST client in a single interface. It allows users to paste, edit, and validate OpenAPI specifications (JSON/YAML), browse API endpoints, and execute requests against them directly in the browser.

**Demo:** swagger-editor-app-fawn.netlify.app

## Features

- **Swagger Editor** — paste and edit OpenAPI/Swagger schemas with automatic format detection (JSON/YAML), format conversion, and validation.
- **Swagger Viewer** — browse the list of endpoints, their parameters, request/response schemas, and status codes.
- **Try it out** — execute API requests directly from the interface and view the response.
- **cURL generation** — automatically generate a cURL command for the current request and copy it to the clipboard.
- **Authentication** — sign up and log in with email/password (Firebase Auth).
- **Schema saving** — authenticated users can save their schemas and have them automatically restored on their next login.
- **History and analytics** — view a history of executed requests with metrics (duration, status, size, etc.).
- **Internationalization (i18n)** — support for at least 2 languages.
- **About page** — information about the RS School course and the team.

## Tech stack

- **Framework:** Next.js (App Router)
- **Auth / Backend-as-a-Service:** Firebase
- **Testing:** Vitest
- **Linting / formatting:** ESLint, Prettier, Husky (git hooks)

## Requirements

- Node.js (LTS version recommended)
- npm
- **VPN** — required for requests to external APIs (some services are unreachable without it due to geo-blocking)

## Local setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/<org>/swagger-editor-app.git
   cd swagger-editor-app
   git checkout develop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   Installation automatically runs `prepare` (Husky), which sets up the git hooks.

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill it in with values from your Firebase project (Firebase Console → Project settings → General):

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

4. **Enable VPN**

   Requests to external APIs only work with an active VPN connection.

5. **Run the app in development mode**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Run in development mode         |
| `npm run build`         | Production build                |
| `npm run start`         | Start the built application     |
| `npm run lint`          | Lint the code (ESLint)          |
| `npm run format:fix`    | Auto-format the code (Prettier) |
| `npm run test`          | Run tests (Vitest)              |
| `npm run test:watch`    | Run tests in watch mode         |
| `npm run test:coverage` | Run tests with coverage report  |

## Development team

| Name    | GitHub                                  |
| ------- | --------------------------------------- |
| Nikolay | [NickKool](https://github.com/NickKool) |
| Artsiom | [Thrapis](https://github.com/Thrapis)   |
| Aleksei | [JesterAV](https://github.com/JesterAV) |
