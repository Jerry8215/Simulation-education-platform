-- Grupos/cohortes para controlar qué simulacros ve cada estudiante.

CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

ALTER TABLE "User" ADD COLUMN "groupId" TEXT;
CREATE INDEX "User_groupId_idx" ON "User"("groupId");
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AssessmentGroup" (
    "assessmentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "AssessmentGroup_pkey" PRIMARY KEY ("assessmentId","groupId")
);
CREATE INDEX "AssessmentGroup_groupId_idx" ON "AssessmentGroup"("groupId");
ALTER TABLE "AssessmentGroup" ADD CONSTRAINT "AssessmentGroup_assessmentId_fkey"
    FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentGroup" ADD CONSTRAINT "AssessmentGroup_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
