This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Setup the env

```bash
cp ./.env.example ./.env
cp ./.env.test.example ./.env.test
```

Make sure the database is running

```bash
docker-compose up -d
```

### Development

Initialize the database

```bash
pnpm db:reset
```

Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Tests

```bash
NODE_ENV=test pnpm db:reset
```

Run the tests

```bash
pnpm test

# just db tests
pnpm test:db

# just browser tests
pnpm test:browser
# or with the browser open
pnpm test:browser:headed
```

### Database Migrations

Generate a migration from the schema

```bash
pnpm db:generate
```

Migrate the database

```bash
# in dev
pnpm db:migrate

# in test
NODE_ENV=test pnpm db:migrate
```

## Issues

You must be using `"@neondatabase/serverless": "^0.9.5",`. Updating to latest breaks the local setup described here https://vercel.com/docs/storage/vercel-postgres/local-development
