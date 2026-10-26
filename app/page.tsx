import Site from "@/components/Site";
import { getMediaManifest } from "@/lib/media";

export default function Home() {
  return <Site media={getMediaManifest()} />;
}
