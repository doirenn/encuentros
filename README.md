# Encuentros

Plataforma de workshops en vivo y archivo de replays. Lo que ya ocurrió no desaparece: pasa a Replays.

## Cómo arrancar

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Cuentas de ejemplo:

- Admin: `admin@encuentros.local` / `encuentros2026`
- Miembro con un replay: `ana@example.com` / `taller123`

Copia `.env.example` a `.env` si hace falta. `ADMIN_EMAILS` marca quién entra al panel.

## Qué hay en v1

- Próximos, calendario, replays
- Ficha de workshop (landing corta)
- Opt-in gratis o pago por link / embed de Mercado Pago
- Login, cuenta y replay con acceso
- Mini tour (Ver guía)
- Admin para crear talleres, presentadores y accesos

La paleta vive en `src/app/globals.css` (`--accent`, `--cta`, etc.).
