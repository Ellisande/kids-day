/*
  Warnings:

  - A unique constraint covering the columns `[activeFor]` on the table `Day` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Day_activeFor_key" ON "Day"("activeFor");
