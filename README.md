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
   commando).
6. Open de gedeployde URL op je telefoon en kies "Zet op beginscherm" om de
   planner als app-icoon te gebruiken.

## Scope van deze versie

- Werkdag- en weekendschema (winter/zomer automatisch via EU-DST-regel)
- Dag- en weekweergave (week start op zondag)
- Blokken slepen (herordenen + tijd-snap) of tikken om te bewerken (tijd, taak-notitie, verwijderen)
- Wektijd per dag aanpasbaar; blokken herberekenen automatisch
- Losse, eenmalige afspraken toevoegen naast de vaste blokken

Nog niet gebouwd (latere iteratie): terugkerende afspraak-sjablonen (seminars),
feestdagen/vakantieperiodes, en de chatfunctie op de Anthropic API voor
complexere herplanningen.
