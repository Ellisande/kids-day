import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { createDay } from "~/models/day.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const day = await createDay({ activeFor: new Date() });

  return redirect(`/days/${day.id}`);
};

export default function NewDay() {
  return (
    <form method="post">
      <button type="submit">Create Day</button>
    </form>
  );
}
