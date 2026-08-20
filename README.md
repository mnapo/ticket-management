## Ticket Management
(NextJS + Supabase)-based system to track your projects activities, issues and features development.

## Install
- clone repo
- run ```npm install```

## Run
- create .env and configure these keys:
```
ADMIN_EMAIL=
ADMIN_PASSWORD=
AUTH_JWT_SECRET=
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL="
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- generate superuser:
```
create extension if not exists pgcrypto;

insert into app_users (
  id,
  email,
  password_hash,
  name,
  role
)
values (
  gen_random_uuid(),
  'superuser@email.com',
  crypt('your_supersecret_password', gen_salt('bf')),
  'Administrador',
  'admin'
);
```

- run ```npm run dev```

## API

- (POST) /api/auth/login
- (GET) /api/tickets
- (POST) /api/tickets
- (GET) /api/tickets/:id
- (PATCH) /api/tickets/:id
- (DELETE) /api/tickets/:id
- (GET) /api/metrics

## Screenshots

### Basic metrics
![Basic metrics screenshot](assets/screenshots/metrics-summary.png)

### Tickets section
![Tickets section screenshot](assets/screenshots/tickets.png)

### Distribution by status
![Distribution by status screenshot](assets/screenshots/metrics-distribution-status.png)

### New ticket
![New ticket screenshot](assets/screenshots/new-ticket.png)

### Ticket history
![Ticket history screenshot](assets/screenshots/history.png)
