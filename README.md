# PhD Planner

Persoonlijke dagplanner voor een PhD-traject, gebaseerd op een schema in
uren-na-ontwaken (i.p.v. vaste kloktijden) met automatische zomer/wintertijd-shift.

## Ontwikkelen

```bash
npm install
cp .env.example .env.local   # vul een eigen APP_PASSWORD in
npm run db:migrate           # database + schema aanmaken
npm run db:seed              # basissjablonen (werkdag/zaterdag/zondag) inladen
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite (lokaal; bij hosting te vervangen door Postgres/Neon)
- dnd-kit voor de sleep-interactie
- Eenvoudige wachtwoord-gate (`APP_PASSWORD`) i.p.v. volwaardig auth-systeem

## Scope van deze versie

- Werkdag- en weekendschema (winter/zomer automatisch via EU-DST-regel)
- Dag- en weekweergave (week start op zondag)
- Blokken slepen (herordenen + tijd-snap) of tikken om te bewerken (tijd, taak-notitie, verwijderen)
- Wektijd per dag aanpasbaar; blokken herberekenen automatisch
- Losse, eenmalige afspraken toevoegen naast de vaste blokken

Nog niet gebouwd (latere iteratie): terugkerende afspraak-sjablonen (seminars),
feestdagen/vakantieperiodes, en de chatfunctie op de Anthropic API voor
complexere herplanningen.
