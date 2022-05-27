/*
  Warnings:

  - Added the required column `activeFor` to the `Day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finishBy` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startBy` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "activeFor" DATETIME NOT NULL
);
INSERT INTO "new_Day" ("id", "name", "type") SELECT "id", "name", "type" FROM "Day";
DROP TABLE "Day";
ALTER TABLE "new_Day" RENAME TO "Day";
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "startBy" DATETIME NOT NULL,
    "finishBy" DATETIME NOT NULL,
    CONSTRAINT "Milestone_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("dayId", "id", "name", "type") SELECT "dayId", "id", "name", "type" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
