# Auth Service

NestJS authentication service backed by PostgreSQL and Prisma. JWTs are stored in an HttpOnly cookie; user passwords are stored as bcrypt hashes.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, a strong `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Never commit `.env`.
2. Apply migrations with `npx prisma migrate deploy` (use `npx prisma migrate dev` while developing the schema).
3. Create the initial administrator with `npm run seed:admin`. The seed is safe to rerun: it does not change an existing admin's password and refuses to promote an existing non-admin user.
4. Start the service with `npm run start:dev`. The default port is `3001`; configure another port with `PORT`.

## Endpoints

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Health check. |
| `POST` | `/auth/login` | Public, rate limited | Verifies credentials and sets the HttpOnly `accessToken` cookie. Limited to 5 attempts per minute per IP. |
| `POST` | `/auth/logout` | Public | Clears the `accessToken` cookie, including when it has expired. |
| `GET` | `/users` | Admin cookie | Lists users without password hashes. |
| `POST` | `/users` | Admin cookie | Creates a `USER`. |
| `PATCH` | `/users/:id/role` | Admin cookie | Updates a user's role. |
| `DELETE` | `/users/:id` | Admin cookie | Deletes a user. |

Swagger UI is available at `/api/docs`. Request DTOs are validated globally; unknown fields and invalid values return HTTP 400. Errors use `{ statusCode, message, timestamp, path }`. The login cookie is `Secure` in production and `SameSite=Lax` in all environments.

## Tests

- `npm test` runs unit tests.
- `npm run test:e2e` runs the database-backed seed, login-cookie, and user-list flow. It requires a reachable database configured by `DATABASE_URL`.