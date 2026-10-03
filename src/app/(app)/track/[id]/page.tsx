import type { Metadata } from "next";
import { TrackClient } from "./track-client";

export const metadata: Metadata = { title: "Track" };

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("========== TrackPage ==========");
  console.log("URL ID:", id);

  return <TrackClient id={id} />;
}
