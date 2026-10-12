# ReserveHub

A resource reservation management system built with Next.js, TypeScript, and PostgreSQL. ReserveHub helps an organization manage shared resources, check availability, and create reservations while preventing overlapping bookings.

## Features

- Manage resources and their details.
- View and search resources.
- Create, view, and cancel reservations.
- Check availability for a selected time period.
- Prevent overlapping reservations for the same resource.
- View a dashboard with resource and upcoming reservation summaries.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- pnpm

## Getting Started

### 1. Requirements

Install the following before running the project:

- Node.js (LTS version recommended)
- pnpm
- PostgreSQL

### 2. Install dependencies

Clone the repository and open its directory:

```bash
git clone <your-repository-url>
cd reserve-hub
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reserve_hub"
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials. Make sure the `reserve_hub` database exists.

Do not commit `.env` or any real credentials to GitHub.

### 4. Set up the database

After configuring Prisma and the database schema, run:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
src/
├── app/          # Pages, layouts, and API route handlers
├── components/   # Reusable UI components
├── lib/          # Database client, validation, and business logic
└── types/        # Shared TypeScript types

prisma/           # Database schema and migrations
docs/             # Project documentation
public/           # Static assets
```

## Requirements

See [`docs/requirements-specification.md`](docs/requirements-specification.md) for the project requirements.

## Project Status

Currently in development.

## License

No license has been added yet.
