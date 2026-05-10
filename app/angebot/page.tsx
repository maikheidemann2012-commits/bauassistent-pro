"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "firma" | "kunde" | "leistung" | "kosten";

export default function AngebotPage() {
  const router = useRouter();
  const [aktuellerTab, setAktuellerTab] = useState<Tab>("firma");

  const [firmaName, setFirmaName] = useState("AC KIAMSE");
  const [firmaInhaber, setFirmaInhaber] = useState("Maik Heidemann");
  const [firmaAdresse, setFirmaAdresse] = useState("");
  const [firmaTelefon, setFirmaTelefon] = useState("");
  const [firmaEmail, setFirmaEmail] = useState("");
  const [steuernummer, setSteuernummer] = useState("");
  const [dokumentTyp, setDokumentTyp] = useState<"Angebot" | "Rechnung">("Angebot");
  const [kundeName, setKundeName] = useState("");
  const [kundeAdresse, setKundeAdresse] = useState("");
  const [kundeTelefon, setKundeTelefon] = useState("");
  const [kundeEmail, setKundeEmail] = useState("");

  const [leistungTitel, setLeistungTitel] = useState("");
  const [leistungBeschreibung, setLeistungBeschreibung] = useState("");

  const [material, setMaterial] = useState<number | "">("");
  const [stundenlohn, setStundenlohn] = useState<number | "">(85);
  const [stunden, setStunden] = useState<number | "">("");
  const [anfahrt, setAnfahrt] = useState<number | "">("");
  const [rabatt, setRabatt] = useState<number | "">("");
  const [mwstAktiv, setMwstAktiv] = useState(true);

  const [nummer, setNummer] = useState("");
  const [meldung, setMeldung] = useState("");
  const [vonFoto, setVonFoto] = useState(false);

  function firmaFeldSpeichern(feld: string, wert: string | number) {
    const aktuell = JSON.parse(localStorage.getItem("firmaDaten") || "{}");
    localStorage.setItem("firmaDaten", JSON.stringify({ ...aktuell, [feld]: wert }));
  }

  useEffect(() => {
    const gespeichert = localStorage.getItem("firmaDaten");
    if (gespeichert) {
      const f = JSON.parse(gespeichert);
      if (f.name) setFirmaName(f.name);
      if (f.inhaber) setFirmaInhaber(f.inhaber);
      if (f.adresse) setFirmaAdresse(f.adresse);
      if (f.telefon) setFirmaTelefon(f.telefon);
      if (f.email) setFirmaEmail(f.email);
      if (f.steuernummer) setSteuernummer(f.steuernummer);
      if (f.stundenlohn) setStundenlohn(f.stundenlohn);
    }

    const jahr = new Date().getFullYear();
    const letzteNummer = localStorage.getItem("letzteAngebotsnummer");
    if (letzteNummer) {
      const teile = letzteNummer.split("-");
      const naechste = Number(teile[2]) + 1;
      setNummer(`ANG-${jahr}-${naechste}`);
    } else {
      setNummer(`ANG-${jahr}-1000`);
    }

    const fotoLeistungen = localStorage.getItem("fotoLeistungen");
    if (fotoLeistungen) {
      setLeistungBeschreibung(fotoLeistungen);
      localStorage.removeItem("fotoLeistungen");
      setAktuellerTab("leistung");
      setVonFoto(true);
    }

    const fotoKosten = localStorage.getItem("fotoKosten");
    if (fotoKosten) {
      const k = JSON.parse(fotoKosten);
      if (k.material) setMaterial(Math.round(k.material));
      localStorage.removeItem("fotoKosten");
    }

    const sprachText = localStorage.getItem("acKiamseSprachText");
    if (sprachText) {
      setLeistungBeschreibung(sprachText);
      setAktuellerTab("leistung");
      localStorage.removeItem("acKiamseSprachText");
    }
  }, []);

  const arbeitskosten = Number(stundenlohn) * Number(stunden);
  const netto = Number(material) + arbeitskosten + Number(anfahrt) - Number(rabatt);
  const mwst = mwstAktiv ? netto * 0.19 : 0;
  const brutto = netto + mwst;

  function eur(wert: number) {
    return wert.toFixed(2).replace(".", ",") + " €";
  }

  function pdfErstellen() {
    localStorage.setItem("letzteAngebotsnummer", nummer);

    const neuesAngebot = {
      id: Date.now().toString(),
      nummer,
      datum: new Date().toLocaleDateString("de-DE"),
      kunde: kundeName || "Kein Kunde",
      leistung: leistungTitel || leistungBeschreibung.substring(0, 50) || "Keine Leistung",
      brutto,
      daten: { firmaName, firmaInhaber, kundeName, kundeAdresse, leistungTitel, leistungBeschreibung, material, stundenlohn, stunden, anfahrt, rabatt, mwstAktiv },
    };

    const archiv = JSON.parse(localStorage.getItem("angebotArchiv") || "[]");
    archiv.unshift(neuesAngebot);
    localStorage.setItem("angebotArchiv", JSON.stringify(archiv));

    setTimeout(() => {
      window.print();
      setMeldung("");
      setMaterial(0);
      setStunden(0);
      setAnfahrt(0);
      setRabatt(0);
      setKundeName("");
      setKundeAdresse("");
      setLeistungTitel("");
      setLeistungBeschreibung("");
    }, 300);
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "firma", label: "Firma", emoji: "🏢" },
    { id: "kunde", label: "Kunde", emoji: "👤" },
    { id: "leistung", label: "Leistung", emoji: "🔧" },
    { id: "kosten", label: "Kosten", emoji: "💶" },
  ];

  const inputKlasse =
    "w-full rounded-2xl bg-slate-800 p-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition";

  const numInput = (value: number | "", setter: (v: number | "") => void, placeholder = "0") => (
    <input
      type="number"
      className={inputKlasse}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setter(e.target.value === "" ? "" : Number(e.target.value))}
    />
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white print:bg-white print:text-black">

      <div className="print:hidden">
        <div className="border-b border-slate-800 bg-slate-950 px-8 py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700 transition"
              >
                ← Zurück
              </button>
            </div>
            <div>
              <img src="/logo-main-dark.svg" alt="BauAssistent Pro" className="h-12 w-auto" />
            </div>
            <div className="flex items-center gap-3">
              {vonFoto && (
                <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                  📸 Aus Foto-Analyse übernommen
                </span>
              )}
              <input
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-mono text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 transition text-center"
                value={nummer}
                onChange={(e) => setNummer(e.target.value)}
                style={{ width: "180px" }}
              />
              <button
                onClick={pdfErstellen}
                className="rounded-xl bg-emerald-500 px-6 py-2 font-black text-slate-950 hover:bg-emerald-400 transition hover:scale-105"
              >
                PDF erstellen
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-8">
          <div className="mx-auto flex max-w-7xl gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAktuellerTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition ${
                  aktuellerTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl print:max-w-none">
        <div className="flex gap-0 print:block">
          <div className="w-full flex-shrink-0 p-8 lg:w-1/2 print:hidden">

            {aktuellerTab === "firma" && (
              <div className="space-y-4">
                <h2 className="mb-6 text-3xl font-black">🏢 Firmendaten</h2>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs text-emerald-400">💾 Deine Daten werden automatisch gespeichert</p>
                </div>
                <input className={inputKlasse} placeholder="Firmenname" value={firmaName}
                  onChange={(e) => { setFirmaName(e.target.value); firmaFeldSpeichern("name", e.target.value); }} />
                <input className={inputKlasse} placeholder="Inhaber" value={firmaInhaber}
                  onChange={(e) => { setFirmaInhaber(e.target.value); firmaFeldSpeichern("inhaber", e.target.value); }} />
                <input className={inputKlasse} placeholder="Adresse" value={firmaAdresse}
                  onChange={(e) => { setFirmaAdresse(e.target.value); firmaFeldSpeichern("adresse", e.target.value); }} />
                <input className={inputKlasse} placeholder="Telefon" value={firmaTelefon}
                  onChange={(e) => { setFirmaTelefon(e.target.value); firmaFeldSpeichern("telefon", e.target.value); }} />
                <input className={inputKlasse} placeholder="E-Mail" value={firmaEmail}
                  onChange={(e) => { setFirmaEmail(e.target.value); firmaFeldSpeichern("email", e.target.value); }} />
                <input className={inputKlasse} placeholder="Steuernummer" value={steuernummer}
                  onChange={(e) => { setSteuernummer(e.target.value); firmaFeldSpeichern("steuernummer", e.target.value); }} />
                <button onClick={() => setAktuellerTab("kunde")} className="mt-4 w-full rounded-2xl bg-emerald-500 p-4 font-black text-slate-950 hover:bg-emerald-400 transition">
                  Weiter → Kunde
                </button>
              </div>
            )}

            {aktuellerTab === "kunde" && (
              <div className="space-y-4">
                <h2 className="mb-6 text-3xl font-black">👤 Kundendaten</h2>
                <input className={inputKlasse} placeholder="Name des Kunden" value={kundeName} onChange={(e) => setKundeName(e.target.value)} />
                <input className={inputKlasse} placeholder="Adresse" value={kundeAdresse} onChange={(e) => setKundeAdresse(e.target.value)} />
                {kundeAdresse && (
                  
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(kundeAdresse)}`}
                    target="_blank"
                    className="flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 text-sm font-bold text-emerald-400 hover:bg-slate-600 transition"
                  >
                    🗺️ Route zu Google Maps anzeigen
                  </a>
                )}
                <input className={inputKlasse} placeholder="Telefon" value={kundeTelefon} onChange={(e) => setKundeTelefon(e.target.value)} />
                <input className={inputKlasse} placeholder="E-Mail" value={kundeEmail} onChange={(e) => setKundeEmail(e.target.value)} />
                <div className="flex gap-3">
                  <button onClick={() => setAktuellerTab("firma")} className="flex-1 rounded-2xl bg-slate-800 p-4 font-bold hover:bg-slate-700 transition">← Zurück</button>
                  <button onClick={() => setAktuellerTab("leistung")} className="flex-1 rounded-2xl bg-emerald-500 p-4 font-black text-slate-950 hover:bg-emerald-400 transition">Weiter → Leistung</button>
                </div>
              </div>
            )}

            {aktuellerTab === "leistung" && (
              <div className="space-y-4">
                <h2 className="mb-6 text-3xl font-black">🔧 Leistung</h2>
                {vonFoto && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-bold text-emerald-400 mb-1">📸 Aus Foto-Analyse importiert</p>
                    <p className="text-xs text-slate-400">Alle erkannten Leistungen wurden automatisch übernommen.</p>
                  </div>
                )}
                <input className={inputKlasse} placeholder="Leistungstitel z. B. Komplettsanierung Innenraum" value={leistungTitel} onChange={(e) => setLeistungTitel(e.target.value)} />
                <textarea
                  className={`${inputKlasse} h-72 resize-none`}
                  placeholder="Leistungsbeschreibung..."
                  value={leistungBeschreibung}
                  onChange={(e) => setLeistungBeschreibung(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => setAktuellerTab("kunde")} className="flex-1 rounded-2xl bg-slate-800 p-4 font-bold hover:bg-slate-700 transition">← Zurück</button>
                  <button onClick={() => setAktuellerTab("kosten")} className="flex-1 rounded-2xl bg-emerald-500 p-4 font-black text-slate-950 hover:bg-emerald-400 transition">Weiter → Kosten</button>
                </div>
              </div>
            )}

            {aktuellerTab === "kosten" && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4 print:hidden">
                  <button
                    onClick={() => setDokumentTyp("Angebot")}
                    className={`px-4 py-1 rounded-full text-sm ${dokumentTyp === "Angebot" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"}`}
                  >
                    Angebot
                  </button>
                  <button
                    onClick={() => setDokumentTyp("Rechnung")}
                    className={`px-4 py-1 rounded-full text-sm ${dokumentTyp === "Rechnung" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"}`}
                  >
                    Rechnung
                  </button>
                </div>
                <h2 className="mb-6 text-3xl font-black">💶 Kosten</h2>

                {vonFoto && Number(material) > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-bold text-emerald-400 mb-1">📸 Kosten aus Foto-Kalkulation</p>
                    <p className="text-xs text-slate-400">Materialkosten wurden automatisch übernommen. Bitte prüfen.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <p className="text-sm text-slate-400">Materialkosten (€)</p>
                    {numInput(material, setMaterial)}
                  </label>
                  <label className="space-y-2">
                    <p className="text-sm text-slate-400">Stundenlohn (€)</p>
                    <input
                      type="number"
                      className={inputKlasse}
                      value={stundenlohn}
                      placeholder="85"
                      onChange={(e) => {
                        const wert = e.target.value === "" ? "" : Number(e.target.value);
                        setStundenlohn(wert);
                        firmaFeldSpeichern("stundenlohn", wert);
                      }}
                    />
                  </label>
                  <label className="space-y-2">
                    <p className="text-sm text-slate-400">Arbeitsstunden</p>
                    {numInput(stunden, setStunden)}
                  </label>
                  <label className="space-y-2">
                    <p className="text-sm text-slate-400">Anfahrt (€)</p>
                    {numInput(anfahrt, setAnfahrt)}
                  </label>
                  <label className="space-y-2">
                    <p className="text-sm text-slate-400">Rabatt (€)</p>
                    {numInput(rabatt, setRabatt)}
                  </label>
                </div>

                <button
                  onClick={() => setMwstAktiv(!mwstAktiv)}
                  className={`w-full rounded-2xl p-4 font-bold transition ${mwstAktiv ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
                >
                  {mwstAktiv ? "✓ Mit MwSt. 19%" : "Kleinunternehmer (ohne MwSt.)"}
                </button>

                <div className="rounded-2xl bg-slate-800 p-6 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-400">Netto</span>
                    <span className="font-bold">{eur(netto)}</span>
                  </div>
                  {mwstAktiv && (
                    <div className="flex justify-between text-lg">
                      <span className="text-slate-400">MwSt. 19%</span>
                      <span className="font-bold">{eur(mwst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-600 pt-3 text-3xl font-black">
                    <span>Brutto</span>
                    <span className="text-emerald-400">{eur(brutto)}</span>
                  </div>
                </div>

                <button
                  onClick={pdfErstellen}
                  className="w-full rounded-2xl bg-emerald-500 p-5 text-2xl font-black text-slate-950 hover:bg-emerald-400 transition hover:scale-105"
                >
                  🖨️ PDF erstellen & drucken
                </button>

                {meldung && <p className="text-center text-emerald-400">{meldung}</p>}
              </div>
            )}
          </div>

          {/* Live-Vorschau */}
          <div className="hidden border-l border-slate-800 lg:block lg:w-1/2 print:block print:w-full print:border-0">
            <div className="sticky top-0 h-screen overflow-auto bg-white p-10 text-black print:h-auto print:p-12">

              <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-6">
                <div>
                  <img src="/logo-light.svg" alt="Logo" className="mb-3 h-16 w-auto object-contain" />
                  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 opacity-20 print:flex hidden">
                    <img src="/logo-watermark.svg" alt="" className="w-96 rotate-[-35deg]" />
                  </div>
                  <h1 className="text-4xl font-black">{dokumentTyp}</h1>
                  <p className="mt-1 font-mono text-sm text-gray-400">{nummer}</p>
                  <div className="mt-3 space-y-0.5 text-sm text-gray-600">
                    {firmaName && <p className="font-bold text-gray-900">{firmaName}</p>}
                    {firmaInhaber && <p>{firmaInhaber}</p>}
                    {firmaAdresse && <p>{firmaAdresse}</p>}
                    {firmaTelefon && <p>{firmaTelefon}</p>}
                    {firmaEmail && <p>{firmaEmail}</p>}
                    {steuernummer && <p className="text-xs text-gray-400">St.-Nr.: {steuernummer}</p>}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p className="font-bold text-gray-900">Datum</p>
                  <p>{new Date().toLocaleDateString("de-DE")}</p>
                  <p className="mt-3 font-bold text-gray-900">Gültig bis</p>
                  <p>{new Date(Date.now() + 14 * 86400000).toLocaleDateString("de-DE")}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">{dokumentTyp === "Rechnung" ? "Rechnung für" : "Angebot für"}</p>
                <p className="text-xl font-bold">{kundeName || "—"}</p>
                <p className="text-gray-600">{kundeAdresse}</p>
                <p className="text-gray-600">{kundeTelefon}</p>
                <p className="text-gray-600">{kundeEmail}</p>
              </div>

              <div className="mb-8">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Leistung</p>
                <p className="text-xl font-bold">{leistungTitel || "—"}</p>
                {leistungBeschreibung && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {leistungBeschreibung}
                  </p>
                )}
              </div>

              <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Kostenübersicht</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material</span>
                    <span>{eur(Number(material))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arbeitskosten ({Number(stunden)} Std. × {eur(Number(stundenlohn))})</span>
                    <span>{eur(arbeitskosten)}</span>
                  </div>
                  {Number(anfahrt) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anfahrt</span>
                      <span>{eur(Number(anfahrt))}</span>
                    </div>
                  )}
                  {Number(rabatt) > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Rabatt</span>
                      <span>− {eur(Number(rabatt))}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Netto</span>
                    <span>{eur(netto)}</span>
                  </div>
                  {mwstAktiv ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">MwSt. 19%</span>
                      <span>{eur(mwst)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Gem. § 19 UStG keine MwSt.</p>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-3 text-2xl font-black">
                    <span>Gesamt</span>
                    <span>{eur(brutto)}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Dieses Angebot ist gültig bis zum {new Date(Date.now() + 14 * 86400000).toLocaleDateString("de-DE")}.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}