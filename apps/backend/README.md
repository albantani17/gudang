To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## Required environment variables

The backend validates these variables on startup and exits if any are missing:

- `JWT_SECRET`: Secret key used to sign and verify JWT tokens.
- `ADMIN_EMAIL`: Seed admin email address.
- `ADMIN_PASSWORD`: Seed admin password (will be hashed before storing).
- `ADMIN_USERNAME`: Seed admin username.

Create an `.env` file next to `package.json`:

```env
JWT_SECRET=change-me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password
ADMIN_USERNAME=admin
```

## Tests

Run the full Bun test suite:

```sh
bun test
```
