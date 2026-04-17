import { ProgramGuideView } from "@/components/program/ProgramGuideView";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function ProgramPage() {
  const site = await getSiteSettings();
  return <ProgramGuideView program={site.program} />;
}
