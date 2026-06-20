import CrimeNetworkGraph from "@/components/graph/CrimeNetworkGraph";

export default function NetworkPage() {
  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Crime Network Discovery</h1>
        <p className="text-muted-foreground mt-2">
          Interactive graph visualization of citizens, crimes, and hidden connections.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <CrimeNetworkGraph />
      </div>
    </div>
  );
}
