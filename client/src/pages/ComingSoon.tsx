import { ForensicLayout } from "@/components/ForensicLayout";
import { Clock } from "lucide-react";
import { useLocation } from "wouter";

const featureNames: Record<string, { title: string; subtitle: string }> = {
  "/image": {
    title: "Image Verification",
    subtitle: "Visual signal inspection",
  },
  "/text": {
    title: "Text Verification",
    subtitle: "Linguistic pattern analysis",
  },
  "/anime": {
    title: "Anime Verification",
    subtitle: "Animation signal inspection",
  },
};

export default function ComingSoon() {
  const [location] = useLocation();
  const feature = featureNames[location] || {
    title: "Feature",
    subtitle: "Coming soon",
  };

  return (
    <ForensicLayout title={feature.title} subtitle={feature.subtitle}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Clock className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Coming Soon
        </h2>
        <p className="text-muted-foreground max-w-md">
          {feature.title} is currently under development. We're working hard to
          bring you advanced forensic verification capabilities for this content
          type.
        </p>
        <div className="mt-8 p-4 bg-muted/30 rounded-md max-w-md">
          <p className="text-xs text-muted-foreground">
            DetectX is expanding its forensic analysis capabilities to cover
            multiple content types. Stay tuned for updates.
          </p>
        </div>
      </div>
    </ForensicLayout>
  );
}
