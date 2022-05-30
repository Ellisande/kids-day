import { Activity, Milestone } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import cx from "classnames";
import { format, isAfter } from "date-fns";
import invariant from "tiny-invariant";
import DayDisplay from "~/components/DayDisplay";
import { Checkmark } from "~/icons/checkmark";
import { Minus } from "~/icons/minus";
import {
  changeMilestoneStatus,
  completeActivity,
  getDayById,
  uncompleteActivity,
} from "~/models/day.server";
import { DayWithMilestones, MilestoneWithActivities } from "~/models/types";

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.dayId, "dayId not found");

  const day = await getDayById(params.dayId);
  if (!day) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ day });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const activityAction = formData.get("activityAction") as string;
  const activityId = formData.get("activityId") as string;
  const milestoneId = formData.get("milestoneId") as string;
  if (activityAction == "complete") {
    invariant(activityId, "Must have an activity id to complete an activity");
    invariant(milestoneId, "An activity must have an milestone");
    await completeActivity(activityId);
    await changeMilestoneStatus(milestoneId);
  }
  if (activityAction == "uncomplete") {
    invariant(activityId, "Must have an activity id to complete an activity");
    invariant(milestoneId, "An activity must have an milestone");
    await uncompleteActivity(activityId);
    await changeMilestoneStatus(milestoneId);
  }

  return redirect(request.url);
};

export default function DayDisplayPage() {
  const loaderData = useLoaderData();
  const day: DayWithMilestones = loaderData.day;
  return <DayDisplay day={day} />;
}
