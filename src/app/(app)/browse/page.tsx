import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse" };

export default function BrowsePage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Browse</h1>
      <p className="mt-2 text-muted-foreground">Discover new music.</p>
    </div>
  );
}
