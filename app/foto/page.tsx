"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Leistung = {
  bezeichnung: string;
  beschreibung: string;
  prioritaet: "hoch" | "mittel" | "niedrig";
};

type Kalkulation = {
  vorbereitung_stunden: number | "";
  vorbereitung_lohn: number | "";
  hauptleistung_stunden: number | "";
  hauptleistung_lohn: number | "";
  material: number | "";
  sonstiges: number | "";
};

const leerKalkulation = (): Kalkulation => ({
  vorbereitung_stunden: "",
  vorbereitung_lohn: "",
  hauptleistung_stunden: "",
  hauptleistung_lohn: "",
  material: "",
  sonstiges: "",
});

function kalkulationSumme(k: Kalkulation) {
  const vorb = Number(k.vorbereitung_stunden) * Number(k.vorbereitung_lohn);
  const haupt = Number(k.hauptleistung_stunden) * Number(k.hauptleistung_lohn);
  const mat = Number(k.material);
  const sonst = Number(k.sonstiges);
  const netto = vorb + haupt + mat + sonst;
  const mwst = netto * 0.19;
  const brutto = netto + mwst;
  return { netto, mwst, brutto };
}

function eur(wert: number) {
  return wert.toFixed(2).replace(".", ",") + " €";
}

export default function FotoAnalyse() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [bild, setBild] = useState<string | null>(null);
  const [bilddatei, setBilddatei] = useState<File | null>(null);
  const [leistungen, setLeistungen] = useState<Leistung[]>([]);
  const [zusammenfassung, setZusammenfassung] = useState("");
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);
  const [offen, setOffen] = useState<number | null>(null);
  const [kalkulationen, setKalkulationen] = useState<Record<number, Kalkulation>>({});

  function bildAuswaehlen(event: React.ChangeEvent<HTMLInputElement>) {
    const datei = event.target.files?.[0];
    if (!datei) return;
    setBilddatei(datei);
    setBild(URL.createObjectURL(datei));
    setLeistungen([]);
    setZusammenfassung("");
    setFehler("");
    setFertig(false);
    setOffen(null);
    setKalkulationen({});
  }

  async function analyseStarten() {
    if (!bilddatei) return;
    setLaedt(true);
    setFehler("");
    setFertig(false);
    const formData = new FormData();
    formData.append("bild", bilddatei);
    try {
      const response = await fetch("/api/foto-analyse", { method: "POST", body: formData });
      const daten = await response.json();
      if (daten.fehler) {
        setFehler(daten.fehler);
      } else {
        setLeistungen(daten.leistungen || []);
        setZusammenfassung(daten.zusammenfassung || "");
        setFertig(true);
        setOffen(null);
        setKalkulationen({});
      }
    } catch {
      setFehler("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLaedt(false);
    }
  }

  function leistungEntfernen(index: number) {
    setLeistungen((prev) => prev.filter((_, i) => i !== index));
    if (offen === index) setOffen(null);
  }

  function kalkulationAktualisieren(index: number, feld: keyof Kalkulation, wert: string) {
    setKalkulationen((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || leerKalkulation()),
        [feld]: wert === "" ? "" : Number(wert),
      },
    }));
  }

  function gesamtBrutto() {
    return leistungen.reduce((sum, _, i) => {
      const k = kalkulationen[i];
      if (!k) return sum;
      return sum + kalkulationSumme(k).brutto;
    }, 0);
  }

  function alleInsAngebot() {
    const text = leistungen
      .map((l, i) => {
        const k = kalkulationen[i];
        if (!k) return `${i + 1}. ${l.bezeichnung}: ${l.beschreibung}`;
        const { netto, mwst, brutto } = kalkulationSumme(k);
        return `${i + 1}. ${l.bezeichnung}: ${l.beschreibung}\n   Netto: ${eur(netto)} | MwSt: ${eur(mwst)} | Brutto: ${eur(brutto)}`;
      })
      .join("\n\n");

    localStorage.setItem("fotoLeistungen", text);

    const gesamtNetto = leistungen.reduce((sum, _, i) => {
      const k = kalkulationen[i];
      if (!k) return sum;
      return sum + kalkulationSumme(k).netto;
    }, 0);

    localStorage.setItem("fotoKosten", JSON.stringify({ material: Math.round(gesamtNetto) }));

    router.push("/angebot");
  }

  const prioritaetConfig = {
    hoch: { farbe: "border-red-500/30 bg-red-500/10 text-red-400", label: "Hohe Priorität" },
    mittel: { farbe: "border-amber-500/30 bg-amber-500/10 text-amber-400", label: "Mittlere Priorität" },
    niedrig: { farbe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", label: "Niedrige Priorität" },
  };

  const inputStil = "w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition";

  return (
    <main className="h-screen overflow-hidden bg-[#080c12] text-white flex flex-col">

      <div className="shrink-0 border-b border-white/[0.08] px-8 py-3">
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
            <p className="text-sm font-semibold text-white/50">AngebotsProfi Handwerk</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-white/40">KI-Analyse bereit</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">

          <div className="flex w-1/2 flex-col border-r border-white/[0.08] p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <h1 className="text-2xl font-black">Foto analysieren</h1>
              </div>
              <p className="text-sm text-white/55">Baustellenfoto hochladen — KI erkennt automatisch alle notwendigen Arbeiten.</p>
            </div>

            <input ref={inputRef} type="file" accept="image/*" onChange={bildAuswaehlen} className="hidden" />

            <div className="flex flex-1 flex-col">
              {!bild ? (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="group flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.04]"
                >
                  <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 transition group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white/40 transition group-hover:text-emerald-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="mt-4 text-lg font-bold text-white/60 transition group-hover:text-white/90">Foto hier ablegen oder klicken</p>
                  <p className="mt-1 text-sm text-white/30">JPG, PNG, HEIC — max. 20 MB</p>
                </button>
              ) : (
                <div className="flex flex-1 flex-col gap-3">
                  <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/15">
                    <img src={bild} alt="Baustellenfoto" className="h-full w-full object-cover" />
                    {laedt && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
                        <div className="relative">
                          <div className="h-16 w-16 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute inset-0 m-auto h-7 w-7 text-emerald-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                        <p className="mt-4 text-base font-bold text-white/90">KI analysiert Foto...</p>
                        <p className="mt-1 text-sm text-white/50">Einen Moment bitte</p>
                      </div>
                    )}
                    {fertig && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 shadow-lg shadow-emerald-500/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-slate-950">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-xs font-black text-slate-950">Analyse abgeschlossen</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => inputRef.current?.click()} className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] py-3 text-sm font-semibold text-white/60 transition hover:border-white/25 hover:text-white/90">
                      Anderes Foto wählen
                    </button>
                    <button
                      onClick={analyseStarten}
                      disabled={laedt}
                      className="relative flex-1 overflow-hidden rounded-xl py-3 text-sm font-black text-slate-950 transition disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                    >
                      <span className="relative">{laedt ? "⚙️ Analysiere..." : "🧠 KI-Analyse starten"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {fehler && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{fehler}</p>
              </div>
            )}
          </div>

          <div className="flex w-1/2 flex-col p-6" style={{ minHeight: 0 }}>
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Erkannte Leistungen</h2>
                <p className="text-sm text-white/45">
                  {leistungen.length > 0 ? `${leistungen.length} Positionen — klicken zum Kalkulieren` : "Noch keine Analyse durchgeführt"}
                </p>
              </div>
              {leistungen.length > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">{leistungen.length} gefunden</span>
                </div>
              )}
            </div>

            {leistungen.length === 0 && !laedt && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto h-16 w-16 text-white/15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                  <p className="mt-5 text-lg font-bold text-white/35">KI wartet auf dein Foto</p>
                  <p className="mt-2 text-sm text-white/25">Lade ein Baustellenfoto hoch und starte die Analyse</p>
                </div>
              </div>
            )}

            {laedt && (
              <div className="flex flex-1 flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-white/[0.04]" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            )}

            {leistungen.length > 0 && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {zusammenfassung && (
                  <div className="mb-3 shrink-0 rounded-xl border border-white/[0.10] bg-white/[0.04] p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-1">KI-Zusammenfassung</p>
                    <p className="text-sm text-white/65">{zusammenfassung}</p>
                  </div>
                )}

                <div className="overflow-y-auto space-y-2 pr-2 pb-2" style={{ flex: "1 1 0" }}>
                  {leistungen.map((leistung, index) => {
                    const istOffen = offen === index;
                    const kalk = kalkulationen[index] || leerKalkulation();
                    const { netto, mwst, brutto } = kalkulationSumme(kalk);
                    const hatWerte = brutto > 0;

                    return (
                      <div key={index} className={`rounded-xl border transition-all ${istOffen ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/[0.10] bg-white/[0.04] hover:border-white/20"}`}>

                        <div className="flex cursor-pointer items-center justify-between gap-3 p-4" onClick={() => setOffen(istOffen ? null : index)}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-xs font-black text-white/50">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-black text-white">{leistung.bezeichnung}</p>
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${prioritaetConfig[leistung.prioritaet].farbe}`}>
                                  {prioritaetConfig[leistung.prioritaet].label}
                                </span>
                                {hatWerte && (
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                    {eur(brutto)}
                                  </span>
                                )}
                              </div>
                              {!istOffen && (
                                <p className="mt-0.5 text-xs text-white/40 truncate">{leistung.beschreibung}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 text-white/30 transition-transform ${istOffen ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            <button onClick={(e) => { e.stopPropagation(); leistungEntfernen(index); }} className="rounded-lg p-1 text-white/25 transition hover:bg-red-500/10 hover:text-red-400">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {istOffen && (
                          <div className="border-t border-white/[0.08] px-4 pb-4 pt-3">
                            <p className="mb-3 text-xs text-white/40 leading-relaxed">{leistung.beschreibung}</p>
                            <div className="space-y-3">

                              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                                <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-widest">🔨 Vorbereitung / Abriss</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="mb-1 text-xs text-white/30">Stunden</p>
                                    <input type="number" placeholder="0" className={inputStil} value={kalk.vorbereitung_stunden} onChange={(e) => kalkulationAktualisieren(index, "vorbereitung_stunden", e.target.value)} />
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-white/30">Stundenlohn (€)</p>
                                    <input type="number" placeholder="0" className={inputStil} value={kalk.vorbereitung_lohn} onChange={(e) => kalkulationAktualisieren(index, "vorbereitung_lohn", e.target.value)} />
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                                <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-widest">⚡ Hauptleistung</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="mb-1 text-xs text-white/30">Stunden</p>
                                    <input type="number" placeholder="0" className={inputStil} value={kalk.hauptleistung_stunden} onChange={(e) => kalkulationAktualisieren(index, "hauptleistung_stunden", e.target.value)} />
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-white/30">Stundenlohn (€)</p>
                                    <input type="number" placeholder="0" className={inputStil} value={kalk.hauptleistung_lohn} onChange={(e) => kalkulationAktualisieren(index, "hauptleistung_lohn", e.target.value)} />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                                  <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-widest">🧱 Material</p>
                                  <input type="number" placeholder="0 €" className={inputStil} value={kalk.material} onChange={(e) => kalkulationAktualisieren(index, "material", e.target.value)} />
                                </div>
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                                  <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-widest">📦 Sonstiges</p>
                                  <input type="number" placeholder="0 €" className={inputStil} value={kalk.sonstiges} onChange={(e) => kalkulationAktualisieren(index, "sonstiges", e.target.value)} />
                                </div>
                              </div>

                              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/50">Netto</span>
                                  <span className="font-bold">{eur(netto)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span className="text-white/50">MwSt. 19%</span>
                                  <span className="font-bold">{eur(mwst)}</span>
                                </div>
                                <div className="flex justify-between border-t border-emerald-500/20 mt-2 pt-2">
                                  <span className="font-black text-emerald-400">Brutto</span>
                                  <span className="font-black text-emerald-400 text-lg">{eur(brutto)}</span>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 shrink-0 space-y-2">
                  {gesamtBrutto() > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-white/60">Gesamtsumme (Brutto)</span>
                      <span className="text-xl font-black text-emerald-400">{eur(gesamtBrutto())}</span>
                    </div>
                  )}
                  <button
                    onClick={alleInsAngebot}
                    className="relative w-full overflow-hidden rounded-xl py-4 text-base font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                  >
                    <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
                    <span className="relative">✅ Alles ins Angebot übernehmen →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}