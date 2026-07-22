# PhD Planner

Persoonlijke dagplanner voor een PhD-traject, gebaseerd op een schema in
uren-na-ontwaken (i.p.v. vaste kloktijden) met automatische zomer/wintertijd-shift.

## Ontwikkelen

Vereist een Postgres-database (bv. een gratis Neon-project — zie "Hosting" hieronder).

```bash
npm install
cp .env.example .env.local   # vul DATABASE_URL en APP_PASSWORD in
npm run db:migrate           # schema aanmaken
npm run db:seed              # basissjablonen (werkdag/zaterdag/zondag) inladen
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router) + TypeScript
- Prisma + Postgres (Neon)
- dnd-kit voor de sleep-interactie
- Eenvoudige wachtwoord-gate (`APP_PASSWORD`) i.p.v. volwaardig auth-systeem
- Manifest voor "toevoegen aan beginscherm" op telefoon

## Hosting (Vercel + Neon)

1. Maak op [vercel.com](https://vercel.com) een nieuw project van deze GitHub-repo.
2. Ga in het Vercel-project naar **Storage → Create Database → Neon (Postgres)**
   en koppel die aan het project. Vercel zet dan zelf een `DATABASE_URL`
   environment variable klaar (gebruik de *pooled* connectiestring als er een
   keuze is).
3. Voeg in **Settings → Environment Variables** ook `APP_PASSWORD` toe (een
   zelfgekozen sterk wachtwoord).
4. Deploy. De build (`npm run build`) draait automatisch `prisma migrate
   deploy` vóór `next build`, dus het schema wordt bij elke deploy up-to-date
   gebracht.
5. Eenmalig na de eerste deploy: vul de basissjablonen met
   `DATABASE_URL="<productie-url>" npm run db:seed` (lokaal uitgevoerd met de
   productie-`DATABASE_URL`, of via `vercel env pull` gevolgd door dat
   commando). Geen lokale Postgres-toegang? Draai in plaats daarvan
   `prisma/seed.sql` via de **SQL Editor** in de Neon Console.
6. Open de gedeployde URL op je telefoon en kies "Zet op beginscherm" om de
   planner als app-icoon te gebruiken.

### Troubleshooting

- **"No Next.js version detected" / "No Output Directory named 'public'"**:
  het Vercel-project bouwt de verkeerde branch of Framework Preset staat niet
  op Next.js. Check **Settings → Build and Deployment → Framework Preset**
  (moet **Next.js** zijn) en **Settings → Git → Production Branch** (moet de
  branch zijn waarop de app-code staat, niet per se `main`).
- **"Redeploy" op een oude, mislukte deploy blijft dezelfde fout geven**:
  logisch — die knop bouwt exact dezelfde oude commit/branch opnieuw, ook na
  het aanpassen van instellingen. Gebruik **Deployments → Create Deployment**
  om een verse deploy op de juiste branch te starten, of push een nieuw
  commit.
- **"APP_PASSWORD ontbreekt"**: de environment variable is toegevoegd/gewijzigd
  ná de laatste deploy, of staat niet aangevinkt voor de omgeving
  (Production/Preview) die je bezoekt. Los op en deploy opnieuw — env vars
  worden pas meegenomen bij de eerstvolgende build.

## Scope van deze versie

- Werkdag- en weekendschema (winter/zomer automatisch via EU-DST-regel)
- Dag- en weekweergave (week start op zondag)
- Blokken slepen (herordenen + tijd-snap) of tikken om te bewerken (tijd, taak-notitie, verwijderen)
- Wektijd per dag aanpasbaar; blokken herberekenen automatisch
- Losse, eenmalige afspraken toevoegen naast de vaste blokken

Nog niet gebouwd (latere iteratie): terugkerende afspraak-sjablonen (seminars),
feestdagen/vakantieperiodes, en de chatfunctie op de Anthropic API voor
complexere herplanningen.
