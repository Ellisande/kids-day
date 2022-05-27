import { Activity, Milestone } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import cx from "classnames";
import { format, isAfter } from "date-fns";
import invariant from "tiny-invariant";
import { Checkmark } from "~/icons/checkmark";
import { Minus } from "~/icons/minus";
import {
  changeMilestoneStatus,
  completeActivity,
  DayWithMilestones,
  getDay,
  MilestoneWithActivities,
  uncompleteActivity,
} from "~/models/day.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.dayId, "dayId not found");

  const day = await getDay(params.dayId);
  if (!day) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ day });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
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

function ActivityDisplay(props: { activity: Activity }) {
  const { activity } = props;
  const isComplete = activity.status == "complete";
  const baseStyle =
    "p-3 border-b-2 border-dashed flex hover:text-cyan-500 hover:bg-slate-50 transition-all duration-500";
  const completeStyle = isComplete ? "text-emerald-500" : "";
  const icon = isComplete ? <Checkmark /> : <Minus />;
  return (
    <form method="post" className={cx(baseStyle, completeStyle)}>
      <input
        type="hidden"
        name="activityAction"
        value={isComplete ? "uncomplete" : "complete"}
      />
      <input type="hidden" name="activityId" value={activity.id} />
      <input type="hidden" name="milestoneId" value={activity.milestoneId} />
      <button className="flex w-full">
        {icon}
        <div>{activity.name}</div>
      </button>
    </form>
  );
}

const unfinishedMilestones = (m: Milestone) => m.status != "complete";

function MilestoneDisplay(props: { milestone: MilestoneWithActivities }) {
  const { milestone } = props;
  const startBy = new Date(milestone.startBy);
  const finishBy = new Date(milestone.finishBy);
  const shouldBeStarted = isAfter(new Date(), startBy);
  const shouldBeFinished = isAfter(new Date(), finishBy);
  const isActive = shouldBeStarted && !shouldBeFinished;
  const inProgress =
    milestone.activities.find((a) => a.status == "complete") &&
    !milestone.activities.every((a) => a.status == "complete");
  const startStyle = cx(
    "text-right text-sm",
    shouldBeStarted ? "font-bold" : ""
  );
  const finishStyle = cx(
    "text-left text-sm",
    shouldBeFinished ? "fond-bold" : ""
  );
  const baseSummaryStyle =
    "grid cursor-pointer grid-cols-2 grid-rows-2 gap-x-4 rounded border-2 border-slate-500 text-center";
  const summaryColor = isActive
    ? "bg-emerald-500"
    : shouldBeFinished
    ? "bg-rose-300"
    : "bg-slate-300";
  const summaryStyle = cx(baseSummaryStyle, summaryColor);
  return (
    <details className="m-2 w-1/2" open={isActive || inProgress}>
      <summary className={summaryStyle}>
        <div className="col-span-2">{milestone.name}</div>
        <div className={startStyle}>{format(startBy, "h:mm a")}</div>
        <div className={finishStyle}>{format(finishBy, "h:mm a")}</div>
      </summary>
      <div>
        {milestone.activities.map((a) => (
          <ActivityDisplay activity={a} key={a.id} />
        ))}
      </div>
    </details>
  );
}

export default function DayDisplayPage() {
  const loaderData = useLoaderData();
  const day: DayWithMilestones = loaderData.day;
  const milestonesRemaining = day.milestones.filter(unfinishedMilestones);
  const activitiesRemaining = day.milestones
    .flatMap((m) => m.activities)
    .filter((a) => a.status != "complete");
  return (
    <div>
      <div className="grid grid-cols-3 grid-rows-2 text-center">
        <div className="col-span-3 text-lg font-bold">{day.name}</div>
        <div>{format(new Date(day.activeFor), "MMM do yyyy")}</div>
        {milestonesRemaining.length > 0 && (
          <div>{milestonesRemaining.length} milestones left</div>
        )}
        {milestonesRemaining.length <= 0 && <div>All milestone complete!</div>}
        {activitiesRemaining.length > 0 && (
          <div>{activitiesRemaining.length} activities left</div>
        )}
        {activitiesRemaining.length <= 0 && <div>All activities complete!</div>}
      </div>
      <div>
        {day.milestones.filter(unfinishedMilestones).map((m) => (
          <MilestoneDisplay milestone={m} key={m.id} />
        ))}
      </div>
    </div>
  );
}
