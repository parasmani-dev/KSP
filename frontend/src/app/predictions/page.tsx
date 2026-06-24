import { PredictionDashboard } from "@/components/predictions/PredictionDashboard";

export default function PredictionsPage() {
  return (
    <div className="h-full bg-[#050A15] min-h-screen">
      <div className="h-full overflow-y-auto px-6 py-6 md:px-8">
        <PredictionDashboard />
      </div>
    </div>
  );
}
