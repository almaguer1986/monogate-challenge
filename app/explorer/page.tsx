"use client";
import dynamic from "next/dynamic";

const ExplorerApp = dynamic(
  () => import("../../lib/explorer/ExplorerApp"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: "100vh",
        background: "#07080f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e8a020",
        fontFamily: "monospace",
        fontSize: 13,
      }}>
        loading explorer…
      </div>
    ),
  }
);

export default function ExplorerPage() {
  return <ExplorerApp />;
}
