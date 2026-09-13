# Salary Defense

## 1. Goal

Build and operate a production-quality web defense game as a PHP portfolio project.

Core goals:
- Laravel REST API
- Phaser web game
- MySQL data modeling and performance optimization
- Redis ranking/cache/queue
- Docker local environment
- AWS deployment and operations
- GitHub Actions CI/CD

Prioritize completeness, readability, and clear technical reasons over using many technologies.

---

## 2. Stack

| Area | Technology |
|---|---|
| Game | Phaser 3.90 |
| Frontend | TypeScript 5.x, Vite |
| Backend | Laravel 13.x, PHP 8.4.x |
| Database | MySQL 8.4 LTS |
| Cache / Queue | Redis 7.4.x |
| Web Server | Nginx |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS |

AWS: EC2, RDS, ElastiCache, S3, CloudFront, Route53, CloudWatch.

Do not introduce React, Vue, Kubernetes, Kafka, MSA, or Elasticsearch without a real requirement.

---

## 3. Structure

```text
salary-defense/
├─ backend/                 # Laravel API
├─ game/                    # Phaser + TypeScript + Vite
├─ docker/
│  ├─ nginx/default.conf
│  └─ php/Dockerfile
├─ compose.yaml
├─ .env
├─ .env.example
├─ .gitignore
└─ .dockerignore
```

This is the current top-level structure, not a restriction on adding necessary files or subdirectories.

Local development uses WSL2 Ubuntu + Docker Desktop.

PHP, MySQL, Redis, and Node must run through Docker rather than host installations.

---

## 4. Local Environment

Services: `nginx`, `php`, `mysql`, `redis`, `node`

Connections:
- Laravel: `localhost:8081`
- Vite: `localhost:5173`
- Host -> MySQL: `localhost:3307`
- Laravel -> MySQL: `mysql:3306`
- Laravel -> Redis: `redis:6379`

Do not change container internal service ports to resolve host port conflicts.

Laravel connection settings:

```env
APP_URL=http://localhost:8081

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=salary_defense
DB_USERNAME=salary_defense

REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379

SESSION_DRIVER=file
QUEUE_CONNECTION=sync
CACHE_STORE=file
```

Use Redis only when it solves a real requirement. Likely use cases include ranking, API cache, Queue, session, and rate limiting.

Do not switch cache, queue, or session to Redis without a concrete reason.

Never use `docker compose down -v` unless data reset is intentional.

---

## 5. Architecture

### Game Client

Keep frame-sensitive and real-time gameplay logic on the Phaser client.

Typical client responsibilities include movement, waves, combat, placement, collisions, animation, and game UI.

Do not continuously send frame-level gameplay state to the server.

Send only data needed for persistence, validation, account features, rankings, statistics, administration, or other server-side requirements.

### Backend

Laravel provides REST APIs for server-side responsibilities required by the product.

Typical areas include authentication, game results, game data, rankings, progression, administration, statistics, and logs.

These examples are not an exhaustive feature list. Add new APIs, services, jobs, commands, events, or modules when requirements justify them.

Keep controllers thin.

Move meaningful business logic to services or domain-oriented classes when complexity justifies it.

Do not add repositories, DTOs, interfaces, layers, or patterns only to make the architecture look advanced.

---

## 6. Database

Design tables from current domain requirements. Existing or previously discussed table names are examples, not a fixed schema.

Create, split, merge, or remove tables when the data model requires it.

Use indexes, composite indexes, pagination, and cursor pagination only for actual query requirements.

Performance optimization must follow:

```text
measure -> EXPLAIN -> change -> measure again -> document result
```

Also:
- avoid N+1 queries
- consider query count before adding abstractions
- use transactions when related writes must succeed atomically

Do not preserve an existing schema when a requirement clearly needs a better model.

---

## 7. Admin

Use a separate `/admin` area.

Implement only the management functions and metrics required by the current product.

Likely areas include content/game-data management, users, balance, notices, logs, and operational metrics, but this list is not restrictive.

Add or remove admin features as service requirements evolve.

---

## 8. Coding Rules

Write code for humans first.

Prefer:
- simple and explicit implementations
- clear names
- small, focused functions and classes
- shallow nesting and useful early returns
- framework conventions over custom mechanisms
- existing project structure and naming
- the smallest change required for the task
- comments only when intent is not obvious

Avoid:
- clever one-liners
- compressed expressions that reduce readability
- unnecessary fluent chains or helpers
- premature abstraction or optimization
- speculative extensibility
- excessive design patterns or inheritance
- meaningless wrappers
- single-implementation interfaces without a reason
- generic utilities that hide domain meaning
- comments that repeat the code
- unnecessary dependencies
- unrelated refactoring

Do not make code artificially complex for portfolio purposes.

When two solutions are functionally equivalent, choose the simpler and more readable one.

---

## 9. Claude Code Rules

Before editing:
1. inspect relevant existing files
2. follow existing conventions where they still make sense
3. identify the smallest necessary change

While editing:
- change only what the task requires
- add new files, tables, endpoints, services, jobs, or directories when the requirement genuinely needs them
- do not treat examples in this document as exhaustive implementation boundaries
- do not rename or reorganize without a reason
- prefer built-in or existing project functionality before adding packages
- preserve compatibility unless a breaking change is explicitly required or clearly necessary
- never expose secrets or commit `.env`

For APIs:
- validate input
- use consistent JSON responses
- use appropriate HTTP status codes
- avoid unnecessary response data
- keep business logic out of large controllers

For game code:
- keep frame-sensitive logic on the client
- avoid unnecessary server requests
- keep scene and object responsibilities clear
- prefer straightforward TypeScript over abstraction-heavy designs

---

## 10. Security and Operations

Never commit:
`.env`, `backend/.env`, secrets, credentials, `backend/vendor/`, `game/node_modules/`, or generated build artifacts.

Production should include the security and operational controls required for reliable service, such as HTTPS, environment variable management, access control, logging, monitoring, backups, and failure detection.

Use GitHub Actions for initial CI/CD.

Add Jenkins only after the project is stable and there is a clear learning or operational reason.

---

## 11. Documentation

Document only decisions that materially affect architecture, technology, performance, deployment, or operations.

Keep documentation:
- brief
- non-duplicative
- focused on why the decision was made
- updated in the existing relevant section instead of creating overlapping explanations

For performance changes, record before/after measurements.

Document meaningful differences between local and production environments.

---

## 12. Decision Priority

For implementation decisions, prefer:

1. correctness
2. readability
3. maintainability
4. measured performance
5. extensibility

Treat current examples and structures as defaults, not hard limits.

Do not sacrifice the first three for code that merely looks sophisticated.
