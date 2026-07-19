-- El ICFES no clasifica las preguntas por dificultad de antemano; la deduce
-- después con estadística (TRI). Guardar un nivel fijo sería subjetivo, así que
-- se elimina el campo a pedido del cliente.
ALTER TABLE "Question" DROP COLUMN "difficulty";
DROP TYPE "Difficulty";
