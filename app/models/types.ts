import { Activity, Day, Milestone } from "@prisma/client";
import { z } from "zod";

export type ActivityStatus = "not_started" | "in_progress" | "complete";
export type MilestoneStatus = ActivityStatus;
export type DayStatus = MilestoneStatus;

export const dayTypesEnum = z.enum([
  "summer_math",
  "summer_english",
  "summer_short",
  "weekend",
]);

export const milestoneTypesEnum = z.enum([
  "wake_up",
  "after_school",
  "bedtime",
  "summer_classes_enlgish",
  "summer_classes_math",
  "summer_classes_wednesday",
]);

export const activityTypesEnum = z.enum([
  "brush_teeth",
  "shower",
  "change_clothes",
  "breakfast",
  "check_assignments",
  "complete_assignments",
  "take_medicine",
  "mouth_check",
  "typing",
  "coding",
  "spanish",
  "math",
  "english",
  "skating",
  "art",
  "dessert",
]);

export type ActivityType = z.infer<typeof activityTypesEnum>;
export type MilestoneType = z.infer<typeof milestoneTypesEnum>;

export type DayType = z.infer<typeof dayTypesEnum>;

export type MilestoneWithActivities = Milestone & {
  activities: Activity[];
};
export type DayWithMilestones = Day & {
  milestones: MilestoneWithActivities[];
};
export type ActivityTemplate = {
  name: string;
  type: string;
  status: string;
};
