-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "startBy" DATETIME NOT NULL,
    "finishBy" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Milestone_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("dayId", "finishBy", "id", "name", "startBy", "status", "type") SELECT "dayId", "finishBy", "id", "name", "startBy", "status", "type" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Activity_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("id", "milestoneId", "name", "status", "type") SELECT "id", "milestoneId", "name", "status", "type" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
