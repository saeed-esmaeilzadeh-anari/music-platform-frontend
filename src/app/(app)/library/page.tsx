import type { Metadata } from "next";
import { LibraryClient } from "./library-client";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return <LibraryClient />;
}
