import { SlateDetailScreen } from "@/features/history/components/SlateDetailScreen";

interface SlatePageProps {
  params: Promise<{ date: string }>;
}

export default async function SlateArchivePage({ params }: SlatePageProps) {
  const { date } = await params;
  return <SlateDetailScreen date={date} />;
}
