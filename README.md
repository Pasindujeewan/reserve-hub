# ReserveHub

ReserveHub is a resource booking app for organizations. Users can browse shared resources, check existing reservation times, and reserve available units for a time period. Signed-in users can also manage resources and categories.

## Features

- Register and sign in with a user account. Protected pages and API routes require an authenticated session.
- Select an organization role during registration: Member, Manager, Coordinator, Staff, or Viewer.
- Browse, search, and filter resources from the Resources page.
- Add and edit resources in popup forms, and view resource details and upcoming reservations.
- Set a resource's total capacity and request a number of units when reserving it.
- See the units available for a selected time period. The server checks overlapping reservations before creating a booking.
- View and cancel your reservations.
- Create and manage resource categories.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS
- PostgreSQL and Prisma ORM
- Zod validation
- Argon2 password hashing and signed session cookies
- pnpm

## Requirements

- Node.js
- pnpm 11.5.2 (the version specified by `package.json`)
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a PostgreSQL database. The examples below use the database name `reservehub`.

3. Create a `.env` file in the repository root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reservehub?schema=public"
   AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
   ```

   Replace the database username and password with your local PostgreSQL credentials. `AUTH_SECRET` must contain at least 32 characters. Keep `.env` private; it is excluded from Git.

4. Apply the Prisma migrations and generate the Prisma client:

   ```bash
   pnpm exec prisma migrate deploy
   pnpm exec prisma generate
   ```

   The migrations create the tables and add the reservation `quantity` field used to track reserved units.

5. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Register an account to start using the app; registration creates a session and opens the Resources page.

## Common commands

```bash
pnpm dev                  # Start the development server
pnpm lint                 # Run ESLint
pnpm exec prisma generate # Regenerate the Prisma client
pnpm exec prisma migrate deploy # Apply pending database migrations
pnpm build                # Build the production app
pnpm start                # Start the production app
```

## How unit capacity works

- `Resource.capacity` is the total number of units available for that resource.
- `Reservation.quantity` is the number of units requested by one reservation.
- The app calculates remaining units for the selected dates from overlapping pending and confirmed reservations.
- The server repeats the capacity check when the reservation is submitted. If there are not enough units, it returns an error and does not create the reservation.

## Project layout

```text
app/                 Pages, shared UI, and API route handlers
  api/               Authentication, resource, category, and reservation APIs
  resources/         Resource browsing, management, details, and booking
  reservations/      Current user's reservations
lib/                 Validation schemas, services, Prisma client, and sessions
prisma/              Database schema and migrations
docs/                Requirements and data model documentation
public/              Static assets
```

## API overview

| Area | Routes |
| --- | --- |
| Authentication | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` |
| Resources | `/api/resources`, `/api/resources/[id]`, `/api/resources/[id]/availability` |
| Categories | `/api/categories` |
| Reservations | `/api/reservations`, `/api/reservations/[id]` |

## Project documentation

- [Requirements](docs/ReserveHub_Requirements.md)
- [ER diagram notes](docs/ER_diagram.md)

## License

No license has been added to this repository.
