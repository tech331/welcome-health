# Welcome Health

Quote request tracking web app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Airtable setup

1. Copy `.env.example` to `.env.local`
2. Create a [personal access token](https://airtable.com/create/tokens) with `data.records:read` scope
3. Add your token as `AIRTABLE_API_KEY` in `.env.local`
4. Restart the dev server

The Requests page reads from the **Requests** table in your base (`apphNCGqCCoSO0XEJ`).

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Airtable](https://airtable.com/) (backend)
