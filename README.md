# Email Engine

Email Engine is a full-stack email dashboard for signing in with an email provider and browsing Inbox, Sent, and Deleted mail folders. The React frontend connects to an Express API through REST and Socket.IO, while the backend uses OAuth and IMAP to retrieve and monitor mail.

## Features

- Microsoft and Gmail OAuth sign-in
- IMAP mailbox access
- Inbox, Sent, and Deleted folder views
- Paginated mail results
- Real-time mail updates through Socket.IO
- PostgreSQL-backed user and mailbox data
- Docker Compose setup for local development

## Technology

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Socket.IO Client
- Backend: Node.js, Express, Sequelize, PostgreSQL, IMAP, Socket.IO
- Infrastructure: Docker and Docker Compose

## Project Structure

```text
frontend/   React and Vite web application
server/     Express API and Socket.IO backend
postgres_data/  Local PostgreSQL data volume
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm for running services without Docker
- OAuth application credentials for Microsoft Outlook and/or Gmail

## Configuration

Create or update the root `.env` file with the application and provider settings. The required provider variables are:

```dotenv
NODE_PORT=8000
FRONTEND_URL=http://localhost:3000

POSTGRES_USER=<database-user>
POSTGRES_PASSWORD=<database-password>
POSTGRES_DB=<database-name>
POSTGRES_HOST=my_postgres

OUTLOOK_CLIENTID=<outlook-client-id>
OUTLOOK_CLIENTSECRET=<outlook-client-secret>
OUTLOOK_TENANT_ID=<outlook-tenant-id>
OUTLOOK_REDIRECTURI=http://localhost:8000/auth/callback/outlook
OUTLOOK_AUTHURL=https://login.microsoftonline.com/common/oauth2/v2.0/authorize
OUTLOOK_TOKENURL=https://login.microsoftonline.com/common/oauth2/v2.0/token
OUTLOOK_SCOPE=openid email profile offline_access https://outlook.office.com/IMAP.AccessAsUser.All
OUTLOOK_IMAPHOST=outlook.office365.com

GMAIL_CLIENTID=<gmail-client-id>
GMAIL_CLIENTSECRET=<gmail-client-secret>
GMAIL_REDIRECTURI=http://localhost:8000/auth/callback/gmail
GMAIL_AUTHURL=https://accounts.google.com/o/oauth2/auth
GMAIL_TOKENURL=https://oauth2.googleapis.com/token
GMAIL_SCOPE=https://mail.google.com/
GMAIL_IMAPHOST=imap.gmail.com
```

Keep real credentials out of source control. Configure OAuth redirect URIs in the provider console to match the callback URLs in this project.

## Run with Docker

From the repository root:

```powershell
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

Stop the services:

```powershell
docker compose down
```

## Run Locally

Start PostgreSQL separately or with Docker:

```powershell
docker compose up postgres
```

Start the backend:

```powershell
cd server
npm install
npm run dev:api
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## API Overview

- `GET /auth/login/:provider` - Starts OAuth sign-in
- `GET /auth/callback/:provider` - Handles the OAuth callback
- `POST /mail/:provider` - Fetches a paginated mail folder

Supported provider route values are `outlook` and `gmail`.
