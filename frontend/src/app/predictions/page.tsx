import { PredictionDashboard } from "@/components/predictions/PredictionDashboard";

export default function PredictionsPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">AI Predictions</h1>
        <p className="text-muted-foreground mt-2">
          Neural network forecasts for hotspots, escalations, and citizen risk.
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <PredictionDashboard />
      </div>
    </div>
  );
}
