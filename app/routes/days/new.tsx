import { ActionFunction, json, redirect } from "@remix-run/server-runtime";
import { makeDomainFunction } from "remix-domains";
import { Form, performMutation } from "remix-forms";
import { z } from "zod";
import { createDay } from "~/models/day.server";
import { dayTypesEnum } from "~/models/types";

export const action: ActionFunction = async ({ request }) => {
  const result = await performMutation({ request, schema, mutation });

  if (!result.success) return json(result, 400);

  return redirect(`/days/`);
};

const schema = z.object({
  dayType: dayTypesEnum,
});

const mutation = makeDomainFunction(schema)(async (values) => {
  return await createDay(values.dayType, { activeFor: new Date() });
});

export default function NewDay() {
  return (
    <Form schema={schema}>
      {({ Field, Errors, Button }) => (
        <div className="m-2 flex w-3/4 flex-col gap-2">
          <Field name="dayType">
            {({ Label, SmartInput, Errors }) => (
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="">What kind of day is today?</Label>
                <SmartInput className="rounded border-2 border-slate-500" />
                <Errors />
              </div>
            )}
          </Field>
          <Errors />
          <Button className="rounded border-2 border-emerald-500 bg-emerald-400 p-1">
            Create Today
          </Button>
        </div>
      )}
    </Form>
  );
}
