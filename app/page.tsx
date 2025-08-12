
"use client";

export default function Home() {
  // Redireciona para /tevora_digital
  if (typeof window !== "undefined") {
    window.location.replace("/tevora_digital");
    return null;
  }
  return null;
}
