-- El importador arma los assessments por su título (upsert), así que
-- (title, type) debe ser único.
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_title_type_key" UNIQUE ("title", "type");
