# ReserveHub Requirements

## 1. Purpose

ReserveHub is a web application for organizations to manage shared resources and book them for specific time periods. It replaces manual booking records with a central system that shows resource details and capacity availability.

## 2. User and Access Requirements

- A user must register or sign in before accessing resources, categories, reservations, or other system features.
- Registration collects the user's full name, email, password, and organization role.
- Supported roles are Member (`USER`), Manager (`MANAGER`), Coordinator (`COORDINATOR`), Staff (`STAFF`), and Viewer (`VIEWER`).
- The application validates user input and protects API access with an authenticated session.
- Passwords are stored as password hashes, not plain text.

## 3. Functional Requirements

### Resources and categories

- Signed-in users can browse, search, and filter resources.
- Users can view resource details, including its type, location, category, status, and total capacity.
- Users can add and edit resources, including setting their total capacity and status.
- Users can view existing and upcoming reservations for a resource.
- Users can view categories and add categories for organizing resources.

### Reservations and capacity

- A signed-in user can reserve an available resource for a start and end time and specify the number of units required.
- The end time must be later than the start time, and the requested number of units must be a positive whole number.
- `Resource.capacity` is the total number of units owned by the organization. `Reservation.quantity` is the number of units requested for one reservation.
- The system calculates available units for the requested time period using overlapping pending and confirmed reservations. Overlapping reservations are allowed when enough units remain.
- The server checks capacity again when a reservation is submitted. It rejects the request with a clear error if the resource is unavailable or does not have enough units for the requested period.
- A user can view their reservations and cancel their pending or confirmed reservations.
- Cancelled reservations do not consume capacity.

## 4. Non-Functional Requirements

- **Usability:** Pages, forms, availability information, and errors should be clear and usable in modern browsers.
- **Reliability:** Reservation checks must prevent the total reserved units from exceeding resource capacity for any overlapping time period.
- **Security:** Validate data on the server, require an authenticated session for protected features, hash passwords, and keep database credentials and authentication secrets out of source control.
- **Performance:** Common actions, such as browsing resources and checking availability, should respond within a reasonable time.
- **Maintainability:** Keep application pages, API handlers, validation, and business logic organized into reusable modules.

## 5. Technology Stack

- Next.js App Router
- TypeScript and React
- Tailwind CSS
- PostgreSQL and Prisma ORM
- Zod validation
- Argon2 password hashing and signed session cookies
