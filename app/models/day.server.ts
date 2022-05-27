import type { Milestone, Activity, Day } from "@prisma/client";
import { prisma } from "~/db.server";
import { addHours, addMinutes, startOfDay } from "date-fns";

type ActivityStatus = "not_started" | "in_progress" | "complete";
type MilestoneStatus = ActivityStatus;
type DayStatus = MilestoneStatus;

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

const activityTemplates: Record<string, { name: string }> = {
  brush_teeth: {
    name: "Brush your teeth",
  },
  shower: {
    name: "Take a shower",
  },
  change_clothes: {
    name: "Change your clothes",
  },
  breakfast: {
    name: "Eat breakfast",
  },
  check_assignments: {
    name: "Check your assignments",
  },
  complete_assignments: {
    name: "Complete your assignments",
  },
  dessert: {
    name: "Eat dessert",
  },
  take_medicine: {
    name: "Take your medicine",
  },
  mouth_check: {
    name: "Get your mouth checked",
  },
};

export function createActivity(type: string): ActivityTemplate {
  return {
    ...activityTemplates[type],
    type: type,
    status: "not_started",
  };
}

export function createActivities(...types: string[]): ActivityTemplate[] {
  return types.map(createActivity);
}

export function completeActivity(id: string) {
  return prisma.activity.update({
    where: { id },
    data: {
      status: "complete",
    },
  });
}

export function uncompleteActivity(id: string) {
  return prisma.activity.update({
    where: { id },
    data: {
      status: "not_started",
    },
  });
}

type MilestoneTemplate = {
  name: string;
  type: string;
  activities: any[];
  startBy: Date;
  finishBy: Date;
  status: MilestoneStatus;
};

type MilestoneFactory = (date: Date) => any;

function atTimeOfDay(date: Date, hours: number, minutes: number) {
  return addMinutes(addHours(startOfDay(date), hours), minutes);
}

const milestoneTemplates: Record<string, MilestoneFactory> = {
  wake_up: (date: Date) => {
    return {
      name: "Wake up",
      type: "wake_up",
      activities: {
        create: createActivities(
          "breakfast",
          "brush_teeth",
          "shower",
          "change_clothes"
        ),
      },
      startBy: atTimeOfDay(date, 7, 30),
      finishBy: atTimeOfDay(date, 8, 15),
    };
  },
  after_school: (date: Date) => {
    return {
      name: "After School",
      type: "after_school",
      activities: {
        create: createActivities("check_assignments", "complete_assignments"),
      },
      startBy: atTimeOfDay(date, 15, 30),
      finishBy: atTimeOfDay(date, 16, 30),
    };
  },
  bedtime: (date: Date) => {
    return {
      name: "Bedtime",
      type: "bedtime",
      activities: {
        create: createActivities(
          "dessert",
          "brush_teeth",
          "take_medicine",
          "mouth_check"
        ),
      },
      startBy: atTimeOfDay(date, 19, 45),
      finishBy: atTimeOfDay(date, 20, 0),
    };
  },
};

export function createMilestone(type: string, date: Date): MilestoneTemplate {
  return {
    ...milestoneTemplates[type](date),
    status: "not_started",
  };
}

export function createMilestones(date: Date, ...types: string[]) {
  return types.map((type) => createMilestone(type, date));
}

export async function changeMilestoneStatus(id: string) {
  const milestone = await getMilestone(id);
  const allComplete = milestone?.activities.every(
    (a) => a.status == "complete"
  );
  if (allComplete) {
    return prisma.milestone.update({
      where: { id },
      data: {
        status: "complete",
      },
    });
  } else {
    return prisma.milestone.update({
      where: { id },
      data: {
        status: "not_started",
      },
    });
  }
}

export function getMilestone(
  id: string,
  options?: {
    includeActivities: boolean;
  }
) {
  return prisma.milestone.findUnique({
    where: { id },
    include: { activities: true },
  });
}

export function createDay(dayOptions: { activeFor: Date }) {
  const { activeFor } = dayOptions;
  return prisma.day.create({
    data: {
      name: "School Day",
      type: "school",
      activeFor,
      status: "not_started",
      milestones: {
        create: createMilestones(
          activeFor,
          "wake_up",
          "after_school",
          "bedtime"
        ),
      },
    },
  });
}

export function getDay(
  id: string,
  options?: {
    includeMilestones: boolean;
    includeActivities: boolean;
  }
): DayWithMilestones {
  return prisma.day.findUnique({
    where: { id },
    include: {
      milestones: {
        include: {
          activities: true,
        },
      },
    },
  }) as unknown as DayWithMilestones;
}
