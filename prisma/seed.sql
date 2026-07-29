-- Handmatige seed voor de basissjablonen (werkdag/zaterdag/zondag).
-- Te gebruiken als alternatief voor `npm run db:seed`, bv. via de Neon SQL Editor
-- (console.neon.tech -> project -> SQL Editor), wanneer er geen directe
-- databaseverbinding vanaf de ontwikkelmachine beschikbaar is.
-- Vereist dat de tabellen al bestaan (d.w.z. na een geslaagde deploy/migratie).

BEGIN;

DELETE FROM "DayOverride";
DELETE FROM "ScheduleBlock";

INSERT INTO "ScheduleBlock"
  (id, "dayType", "order", label, "startOffsetMinutes", "endOffsetMinutes", category, "fixedClockTime", "fixedStart", "fixedEnd", "createdAt", "updatedAt")
VALUES
  ('weekday-0',  'weekday', 0,  'Opstarten',                        0,   30,  'prep',             false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-1',  'weekday', 1,  'Leesblok',                         30,  90,  'reading',          false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-2',  'weekday', 2,  'Heenreis',                         90,  120, 'transit',          false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-3',  'weekday', 3,  'Schrijfblok',                      120, 165, 'writing',          false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-4',  'weekday', 4,  'Korte pauze',                      165, 170, 'microbreak',       false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-5',  'weekday', 5,  'Schrijfblok',                      170, 210, 'writing',          false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-6',  'weekday', 6,  'Pauze',                            210, 225, 'break',            false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-7',  'weekday', 7,  'Revisieblok',                      225, 270, 'revision',         false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-8',  'weekday', 8,  'Korte pauze',                      270, 275, 'microbreak',       false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-9',  'weekday', 9,  'Revisieblok',                      275, 315, 'revision',         false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-10', 'weekday', 10, 'Middagpauze',                      315, 360, 'lunch',            false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-11', 'weekday', 11, 'Projectblok',                      360, 405, 'seminar_ongoing',  false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-12', 'weekday', 12, 'Korte pauze',                      405, 410, 'microbreak',       false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-13', 'weekday', 13, 'Projectblok',                      410, 450, 'seminar_ongoing',  false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-14', 'weekday', 14, 'Pauze',                            450, 465, 'break',            false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-15', 'weekday', 15, 'Administratieblok',                465, 510, 'admin',            false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-16', 'weekday', 16, 'Pauze',                            510, 525, 'break',            false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-17', 'weekday', 17, 'Reserveblok',                      525, 570, 'block5',           false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-18', 'weekday', 18, 'Terugreis',                        570, 600, 'transit',          false, NULL,    NULL,    NOW(), NOW()),
  ('weekday-19', 'weekday', 19, 'Avondblok',                        0,   0,   'evening',          true,  '18:00', '20:00', NOW(), NOW()),

  ('saturday-0', 'saturday', 0, 'Opstarten',                                            0,   45,  'prep',    false, NULL, NULL, NOW(), NOW()),
  ('saturday-1', 'saturday', 1, 'Leesblok',                                             45,  135, 'reading', false, NULL, NULL, NOW(), NOW()),
  ('saturday-2', 'saturday', 2, 'Boodschappen',                                        390, 450, 'errand',  false, NULL, NULL, NOW(), NOW()),

  ('sunday-0',   'sunday',   0, 'Opstarten', 0,  30, 'prep',    false, NULL,    NULL,    NOW(), NOW()),
  ('sunday-1',   'sunday',   1, 'Leesblok',  30, 90, 'reading', false, NULL,    NULL,    NOW(), NOW()),
  ('sunday-2',   'sunday',   2, 'Kerkdienst', 0,  0, 'church',  true,  '10:00', '11:30', NOW(), NOW());

COMMIT;
