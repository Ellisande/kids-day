import { addHours, addMinutes, startOfDay } from "date-fns";
import { prisma } from "~/db.server";
import {
  ActivityTemplate,
  ActivityType,
  DayType,
  DayWithMilestones,
  MilestoneStatus,
  MilestoneType,
} from "./types";

const activityTemplates: Record<ActivityType, { name: string }> = {
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
  typing: {
    name: "Typing Class",
  },
  coding: {
    name: "Coding",
  },
  spanish: {
    name: "Spanish",
  },
  math: {
    name: "Prodigy Math",
  },
  english: {
    name: "Prodigy English",
  },
  skating: {
    name: "Skating Practice",
  },
  art: {
    name: "Art",
  },
};

export function createActivity(type: ActivityType): ActivityTemplate {
  return {
    ...activityTemplates[type],
    type: type,
    status: "not_started",
  };
}

export function createActivities(...types: ActivityType[]): ActivityTemplate[] {
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
  type: MilestoneType;
  activities: any[];
  startBy: Date;
  finishBy: Date;
  status: MilestoneStatus;
};

type MilestoneFactory = (date: Date) => any;

function atTimeOfDay(date: Date, hours: number, minutes: number) {
  return addMinutes(addHours(startOfDay(date), hours), minutes);
}

const milestoneTemplates: Record<MilestoneType, MilestoneFactory> = {
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
  summer_classes_enlgish: (date: Date) => {
    return {
      name: "Classes",
      type: "summer_classes_english",
      activities: {
        create: createActivities(
          "typing",
          "coding",
          "spanish",
          "english",
          "art"
        ),
      },
      startBy: atTimeOfDay(date, 8, 30),
      finishBy: atTimeOfDay(date, 12, 45),
    };
  },
  summer_classes_math: (date: Date) => ({
    name: "Classes",
    type: "summer_classes_math",
    activities: {
      create: createActivities(
        "typing",
        "coding",
        "spanish",
        "math",
        "skating"
      ),
    },
    startBy: atTimeOfDay(date, 8, 30),
    finishBy: atTimeOfDay(date, 12, 45),
  }),
  summer_classes_wednesday: (date: Date) => ({
    name: "Classes",
    type: "summer_classes_wednesday",
    activities: {
      create: createActivities("typing", "coding", "spanish"),
    },
    startBy: atTimeOfDay(date, 8, 30),
    finishBy: atTimeOfDay(date, 10, 15),
  }),
};

export function createMilestone(
  type: MilestoneType,
  date: Date
): MilestoneTemplate {
  return {
    ...milestoneTemplates[type](date),
    status: "not_started",
  };
}

export function createMilestones(date: Date, ...types: MilestoneType[]) {
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

type DayTemplate = {
  name: string;
  type: DayType;
  milestones: { create: any[] };
};

const dayTemplates: Record<DayType, (activeFor: Date) => DayTemplate> = {
  summer_english: (date: Date) => ({
    name: "Summer Day - English",
    type: "summer_english",
    milestones: {
      create: createMilestones(
        date,
        "wake_up",
        "summer_classes_enlgish",
        "bedtime"
      ),
    },
  }),
  summer_math: (date: Date) => ({
    name: "Summer Day - Math",
    type: "summer_math",
    milestones: {
      create: createMilestones(
        date,
        "wake_up",
        "summer_classes_math",
        "bedtime"
      ),
    },
  }),
  summer_short: (date: Date) => ({
    name: "Summer Day - Wednesday",
    type: "summer_short",
    milestones: {
      create: createMilestones(
        date,
        "wake_up",
        "summer_classes_wednesday",
        "bedtime"
      ),
    },
  }),
  weekend: (date: Date) => ({
    name: "Weekend",
    type: "weekend",
    milestones: {
      create: createMilestones(date, "wake_up", "bedtime"),
    },
  }),
};

export async function createDay(
  type: DayType,
  dayOptions: { activeFor: Date }
) {
  const { activeFor } = dayOptions;
  const template = dayTemplates[type](activeFor);
  const existingDay = await prisma.day.findUnique({
    where: { activeFor: startOfDay(activeFor) },
  });
  if (existingDay) {
    await prisma.day.delete({
      where: { id: existingDay.id },
    });
  }
  return prisma.day.create({
    data: {
      ...template,
      activeFor: startOfDay(activeFor),
      status: "not_started",
    },
  });
}

export function getDayById(
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

export function getDayByDate(
  date: Date,
  options?: {
    includeMilestones: boolean;
    includeActivities: boolean;
  }
): Promise<DayWithMilestones> {
  return prisma.day.findUnique({
    where: { activeFor: startOfDay(date) },
    include: {
      milestones: {
        include: {
          activities: true,
        },
      },
    },
  }) as unknown as Promise<DayWithMilestones>;
}
