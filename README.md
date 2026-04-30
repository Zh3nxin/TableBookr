# TableBookr

## Local Development

Prerequisites:

- Docker with Docker Compose support
- Node.js and npm

Install dependencies:

```bash
npm install
npm install --prefix apps/api
npm install --prefix apps/web
```

Start the database:

```bash
npm run db:start
```

Run migrations and seed data:

```bash
npm run db:setup
```

Start the backend and frontend:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- Booking page: `http://localhost:3001/book/test-restaurant`

Stop the database when finished:

```bash
npm run db:stop
```

Local environment defaults:

- API database URL: `postgresql://admin:admin@127.0.0.1:5433/tablebookr?schema=public`
- Web API base URL: `http://localhost:3000`
