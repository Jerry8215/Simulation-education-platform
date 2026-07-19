-- El estudiante elige personaje la primera vez que entra (diseño, página 7).
ALTER TABLE "User" ADD COLUMN "avatarChosen" BOOLEAN NOT NULL DEFAULT false;

-- Los usuarios que ya existen no deben ver la pantalla de elección.
UPDATE "User" SET "avatarChosen" = true;
