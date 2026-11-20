import { PredictionDashboard } from "@/components/predictions/PredictionDashboard";

export default function PredictionsPage() {
  return (
    <div className="h-full bg-background min-h-screen">
      <div className="ksp-page h-full overflow-y-auto">
        <PredictionDashboard />
      </div>
    </div>
  );
}
