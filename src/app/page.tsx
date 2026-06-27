import { TodayScreen } from "@/features/tasks/components/TodayScreen";
import { InstallPrompt } from "@/components/InstallPrompt";
import { auth } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/dates";
import { getTasksForToday } from "@/server/tasks";

export default async function HomePage() {
  const session = await auth();
  const displayDate = formatDisplayDate();
  const initialTasks = session?.user?.id
    ? await getTasksForToday(session.user.id)
    : undefined;

  return (
    <>
      <TodayScreen displayDate={displayDate} initialTasks={initialTasks} />
      <InstallPrompt />
    </>
  );
}
