"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function TippKachel() {
  const tipps = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg>,
      label: "Zeitersparnis", titel: "60 Sekunden",
      text: "Von der Anfrage zum fertigen PDF — mit KI.",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: "Marktpreis 2026", titel: "Stundensätze",
      text: "Sanitär Ø 95 € · Maler Ø 65 € · Elektriker Ø 90 €",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>,
      label: "Kalkulation", titel: "Materialaufschlag",
      text: "15–25% Aufschlag einrechnen — sonst bleibt Geld liegen.",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
      label: "Profi-Tipp", titel: "Anfahrt berechnen",
      text: "Fahrzeit × Stundensatz ÷ 2 — nie wieder verschenken.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [sichtbar, setSichtbar] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setSichtbar(false);
      setTimeout(() => { setIndex((i) => (i + 1) % tipps.length); setSichtbar(true); }, 250);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const tipp = tipps[index];

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div style={{ opacity: sichtbar ? 1 : 0, transition: "opacity 0.25s ease" }}>
        <div className="mb-2 flex items-center gap-2">
          {tipp.icon}
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">{tipp.label}</span>
        </div>
        <p className="text-base font-black text-white">{tipp.titel}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/50">{tipp.text}</p>
      </div>
      <div className="mt-3 flex gap-1">
        {tipps.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)}
            className={`h-0.5 rounded-full transition-all ${i === index ? "w-4 bg-emerald-400" : "w-1.5 bg-white/15"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [uhrzeit, setUhrzeit] = useState("");

  useEffect(() => {
    function update() {
      setUhrzeit(new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#080c12] text-white flex flex-col">

      {/* Topbar */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <img src="/icon-only.svg" alt="BauAssistent Pro" className="h-7 w-7" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-white/35">System aktiv</span>
            </div>
            <span className="font-mono text-xs text-white/20">{uhrzeit}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="shrink-0 px-4 md:px-8 pt-4 pb-3">
        <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
          Angebote die{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Kunden überzeugen.
          </span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-white/55">
          KI-gestützte Angebotssoftware für Handwerker — von der Baustelle bis zum fertigen PDF.
        </p>

        {/* Pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {["KI-Analyse", "Foto → Angebot", "Sprache → Text", "Live PDF", "MwSt. auto"].map((f) => (
            <span
              key={f}
              className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs md:text-sm font-semibold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Kacheln */}
      <div className="flex-1 px-4 md:px-8 pb-6">
        <div className="flex flex-col gap-4">

          {/* Angebot erstellen */}
          <div
            onClick={() => router.push("/angebot")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-emerald-500/30 hover:bg-white/[0.06]"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-emerald-400/70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-emerald-400/70">Kern-Feature</span>
              <h2 className="mt-1 text-lg font-black">Angebot erstellen</h2>
              <p className="mt-1 text-sm text-white/55">
                Tabs, Live-Vorschau, automatische Kalkulation. Firma einmal eintragen — immer dabei.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {["Live PDF-Vorschau", "Auto-Nummerierung", "MwSt. & Kleinunternehmer"].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-sm text-white/45">
                    <span className="text-emerald-400">✓</span> {f}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-base font-bold text-emerald-400">
                Jetzt starten <span className="transition-transform group-hover:translate-x-1.5">→</span>
              </div>
            </div>
          </div>

          {/* Sprachaufnahme */}
          <div
            onClick={() => router.push("/sprache")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-emerald-500/20 hover:bg-white/[0.06]"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/8 blur-2xl" />
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-emerald-400/70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              <h2 className="mt-2 text-lg font-black">Sprachaufnahme</h2>
              <p className="mt-1 text-sm text-white/55">
                Einfach reinreden — die KI erkennt alle Leistungspositionen und trägt sie automatisch ein.
              </p>
              <div className="mt-4 flex items-end gap-0.5 h-10 w-full">
                {[3,6,9,5,11,7,13,8,10,6,12,5,9,7,11,4,8,6,10,5,12,7,9,4,11,6,8,5,10,7].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full bg-emerald-500/25"
                    style={{ height: `${h * 3}px`, animation: `pulse 1.${i % 5}s ease-in-out infinite alternate`, animationDelay: `${i * 0.06}s` }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-base font-bold text-emerald-400">
                Jetzt sprechen <span className="transition-transform group-hover:translate-x-1.5">→</span>
              </div>
            </div>
          </div>

          {/* Foto analysieren */}
          <div
            onClick={() => router.push("/foto")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-emerald-500/20 hover:bg-white/[0.06]"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/8 blur-2xl" />
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-emerald-400/70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <h2 className="mt-2 text-lg font-black">Foto analysieren</h2>
              <p className="mt-1 text-sm text-white/55">
                Baustellen-Foto hochladen — KI erkennt alle notwendigen Arbeiten und schätzt den Aufwand.
              </p>
              <div className="mt-3 space-y-2">
                {[["Wandschäden", 92], ["Malerarbeiten", 87], ["Untergrund", 74]].map(([l, p]) => (
                  <div key={l} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-white/45">{l}</span>
                    <div className="h-0.5 flex-1 rounded-full bg-white/10">
                      <div className="h-0.5 rounded-full bg-emerald-500/50" style={{ width: `${p}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-white/45">{p}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-base font-bold text-emerald-400">
                Foto hochladen <span className="transition-transform group-hover:translate-x-1.5">→</span>
              </div>
            </div>
          </div>

          {/* PDF-Angebote */}
          <div
            onClick={() => router.push("/angebote")}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-all hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-white/35">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                <div>
                  <h3 className="text-base font-black">PDF-Angebote & Rechnungen</h3>
                  <p className="text-sm text-white/45">Alle gespeicherten Dokumente auf einen Blick.</p>
                </div>
              </div>
              <span className="text-sm font-bold text-white/25 transition group-hover:text-white/55">Ansehen →</span>
            </div>
          </div>

          {/* Tipp Kachel */}
          <div className="h-36">
            <TippKachel />
          </div>

        </div>
      </div>
    </main>
  );
}
