# Music Streaming API Commands

## Development

```bash
npm install
```

```bash
npm run start:dev
```

```bash
npm run lint
```

---

## Prisma

```bash
npm run prisma:generate
```

```bash
npm run prisma:migrate
```

```bash
npm run studio:prisma
```

```bash
npx prisma db push
```

---

## Docker

```bash
docker compose up
```

```bash
docker compose up --build
```

```bash
docker compose down
```

```bash
docker compose logs -f api
```

---

## PostgreSQL

```bash
docker exec -it music-streaming-postgres psql -U postgres
```