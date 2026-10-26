import Experience from "@/components/Experience";
import { getMediaManifest } from "@/lib/media";

export default function Home() {
  return <Experience media={getMediaManifest()} />;
}
