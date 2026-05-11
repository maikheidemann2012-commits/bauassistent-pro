"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fehler, setFehler] = useState("");
  const [laden, setLaden] = useState(false);

  async function einloggen() {
    setLaden(true);
    setFehler("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setFehler("❌ Email oder Passwort falsch!");
    }
    setLaden(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080c12] p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="text-center">
          <img src="/logo-main-dark.svg" alt="BauAssistent Pro" className="h-16 mx-auto" />
          <p className="mt-3 text-white/50 text-sm">Bitte einloggen um fortzufahren</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-4 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && einloggen()}
            className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-4 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {fehler && <p className="text-red-400 text-sm">{fehler}</p>}

          <button
            onClick={einloggen}
            disabled={laden}
            className="w-full rounded-xl bg-emerald-500 p-4 font-black text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {laden ? "Wird eingeloggt..." : "Einloggen →"}
          </button>
        </div>

      </div>
    </main>
  );
}