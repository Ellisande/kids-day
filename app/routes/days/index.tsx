import { Day } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { addDays, startOfDay, startOfToday } from "date-fns";
import { Navigate } from "react-router";
import { makeDomainFunction } from "remix-domains";
import { Form as RemixForm, performMutation } from "remix-forms";
import invariant from "tiny-invariant";
import { z } from "zod";
import DayDisplay from "~/components/DayDisplay";
import {
  changeMilestoneStatus,
  completeActivity,
  createDay,
  getDayByDate,
  uncompleteActivity,
} from "~/models/day.server";
import type { DayWithMilestones } from "~/models/types";
import { dayTypesEnum } from "~/models/types";

type LoaderData = {
  today?: DayWithMilestones;
  tomorrow?: Day;
  dayId?: string;
};

const schema = z.object({
  dayType: dayTypesEnum,
  dayDate: z.date(),
  dayAction: z.enum(["create"]),
});

const mutation = makeDomainFunction(schema)(async (values) => {
  return await createDay(values.dayType, { activeFor: values.dayDate });
});

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest: Request = request.clone();
  const formData = await clonedRequest.formData();
  const dayAction = formData.get("dayAction");
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
  if (dayAction == "create") {
    const result = await performMutation({
      request,
      schema,
      mutation,
    });

    if (!result.success) return json(result, 400);
  }

  return redirect(request.url);
};

export const loader: LoaderFunction = async ({ params }) => {
  const today = await getDayByDate(startOfDay(new Date()));
  const tomorrow = await getDayByDate(addDays(startOfDay(new Date()), 1));
  const dayId = params.dayId;
  return json<LoaderData>({ today, dayId, tomorrow });
};

export default function DayPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { today, tomorrow } = loaderData;
  if (!today) {
    return <Navigate to="/days/new" />;
  } else {
    return (
      <div className="flex h-full flex-row">
        <div className="w-3/4">
          <DayDisplay day={today} />
        </div>
        {tomorrow && (
          <div className="w-1/4">
            <div>Tomorrow is a: </div>
            <div>{tomorrow.name}</div>
          </div>
        )}
        {!tomorrow && (
          <RemixForm schema={schema} className="w-1/4">
            {({ Field, Errors, Button }) => (
              <div className="m-2 flex flex-col gap-2">
                <Field name="dayType">
                  {({ Label, SmartInput, Errors }) => (
                    <div className="flex w-full flex-col gap-2">
                      <Label className="">What kind of day is tomorrow?</Label>
                      <SmartInput className="rounded border-2 border-slate-500" />
                      <Errors />
                    </div>
                  )}
                </Field>
                <Field
                  name="dayDate"
                  type="hidden"
                  value={addDays(startOfToday(), 1)}
                  label=""
                />
                <Field
                  className="hidden"
                  name="dayAction"
                  type="hidden"
                  value="create"
                  label=""
                />
                <Errors />
                <Button className="rounded border-2 border-emerald-500 bg-emerald-400 p-1">
                  Create Tomorrow
                </Button>
              </div>
            )}
          </RemixForm>
        )}
      </div>
    );
  }
}
