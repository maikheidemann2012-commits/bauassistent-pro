"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Angebot = {
  id: string;
  nummer: string;
  datum: string;
  kunde: string;
  leistung: string;
  brutto: number;
  daten: Record<string, unknown>;
};

export default function AngeboteSeite() {
  const router = useRouter();
  const [angebote, setAngebote] = useState<Angebot[]>([]);

  useEffect(() => {
    const gespeichert = localStorage.getItem("angebotArchiv");
    if (gespeichert) setAngebote(JSON.parse(gespeichert));
  }, []);

  function angebotLoeschen(id: string) {
    const neu = angebote.filter((a) => a.id !== id);
    setAngebote(neu);
    localStorage.setItem("angebotArchiv", JSON.stringify(neu));
  }

  function exportieren() {
    const blob = new Blob([JSON.stringify(angebote, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `angebote-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importieren(event: React.ChangeEvent<HTMLInputElement>) {
    const datei = event.target.files?.[0];
    if (!datei) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importiert = JSON.parse(e.target?.result as string);
        const zusammen = [...angebote, ...importiert].filter(
          (a, i, arr) => arr.findIndex((b) => b.id === a.id) === i
        );
        setAngebote(zusammen);
        localStorage.setItem("angebotArchiv", JSON.stringify(zusammen));
        alert(`✅ ${importiert.length} Angebote importiert!`);
      } catch {
        alert("❌ Datei konnte nicht gelesen werden.");
      }
    };
    reader.readAsText(datei);
  }

  function eur(wert: number) {
    return wert.toFixed(2).replace(".", ",") + " €";
  }

  return (
    <main className="min-h-screen bg-[#080c12] text-white flex flex-col">

      <div className="shrink-0 border-b border-white/[0.06] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/25 hover:bg-white/[0.10] hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Zurück
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div>
              <p className="text-xs text-white/30">AngebotsProfi Handwerk</p>
              <h1 className="text-xl font-black">Angebots-Archiv</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/60 transition hover:border-white/25 hover:text-white/90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importieren
              <input type="file" accept=".json" onChange={importieren} className="hidden" />
            </label>

            <button
              onClick={exportieren}
              disabled={angebote.length === 0}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportieren
            </button>

            <button
              onClick={() => router.push("/angebot")}
              className="relative overflow-hidden rounded-xl px-5 py-2 text-sm font-black text-slate-950 transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
            >
              <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
              <span className="relative">+ Neues Angebot</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-5xl">

          {angebote.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto h-16 w-16 text-white/10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                <p className="mt-6 text-xl font-black text-white/30">Noch keine Angebote gespeichert</p>
                <p className="mt-2 text-sm text-white/20">Erstelle dein erstes Angebot — es erscheint automatisch hier.</p>
                <button
                  onClick={() => router.push("/angebot")}
                  className="relative mt-6 overflow-hidden rounded-xl px-8 py-3 text-sm font-black text-slate-950"
                  style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                >
                  <span className="relative">+ Jetzt Angebot erstellen</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-white/40">{angebote.length} Angebot{angebote.length !== 1 ? "e" : ""} gespeichert</p>
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">
                    Gesamt: {eur(angebote.reduce((s, a) => s + a.brutto, 0))}
                  </span>
                </div>
              </div>

              {angebote.map((angebot) => (
                <div key={angebot.id} className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-emerald-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-white">{angebot.nummer}</p>
                          <span className="text-xs text-white/30">{angebot.datum}</span>
                        </div>
                        <p className="text-sm font-semibold text-white/60 truncate">{angebot.kunde || "Kein Kunde"}</p>
                        <p className="text-xs text-white/30 truncate">{angebot.leistung || "Keine Leistung"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">{eur(angebot.brutto)}</p>
                        <p className="text-xs text-white/30">Brutto</p>
                      </div>
                      <button
                        onClick={() => angebotLoeschen(angebot.id)}
                        className="rounded-xl border border-white/10 p-2 text-white/25 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}