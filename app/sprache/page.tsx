"use client";

import { useState, useRef } from "react";

export default function SprachePage() {
  const [text, setText] = useState("");
  const [aufnahme, setAufnahme] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [aufnahmeZeit, setAufnahmeZeit] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function aufnahmeStarten() {
    setFehler("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transkribieren(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setAufnahme(true);
      setAufnahmeZeit(0);
      timerRef.current = setInterval(() => {
        setAufnahmeZeit((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setFehler("❌ Mikrofon konnte nicht gestartet werden! Bitte Zugriff erlauben.");
    }
  }

  function aufnahmeStoppen() {
    if (mediaRecorderRef.current && aufnahme) {
      mediaRecorderRef.current.stop();
      setAufnahme(false);
      setLaden(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  async function transkribieren(blob: Blob) {
    try {
      // Audio zu Base64 konvertieren
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      uint8Array.forEach((b) => (binary += String.fromCharCode(b)));
      const base64 = btoa(binary);

      // Zur Anthropic API schicken
      const response = await fetch("/api/transkribieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64 }),
      });

      const data = await response.json();
      if (data.text) {
        setText((prev) => prev ? prev + " " + data.text : data.text);
      } else {
        setFehler("⚠️ KI konnte nichts erkennen — bitte nochmal versuchen!");
      }
    } catch (err) {
      setFehler("⚠️ Fehler bei der KI-Verarbeitung — bitte nochmal versuchen!");
    } finally {
      setLaden(false);
    }
  }

  function textLoeschen() {
    setText("");
    setFehler("");
    setAufnahmeZeit(0);
  }

  function angebotUebernehmen() {
    if (!text.trim()) {
      setFehler("⚠️ Bitte erst etwas sprechen oder eingeben!");
      return;
    }
    const encoded = encodeURIComponent(text.trim());
    window.location.href = `/angebot?sprachtext=${encoded}`;
  }

  function formatZeit(sek: number) {
    const m = Math.floor(sek / 60).toString().padStart(2, "0");
    const s = (sek % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="mx-auto flex max-w-2xl flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-4xl shadow-lg shadow-emerald-500/30">
            🎤
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400 tracking-widest uppercase">BauAssistent Pro</p>
            <h1 className="text-4xl font-black">Sprachaufnahme</h1>
            <p className="text-slate-400 text-sm mt-1">Einfach sprechen — KI schreibt mit</p>
          </div>
        </div>

        {/* Anleitung */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-black text-white">💡 So funktioniert es</h2>
          {[
            "Tätigkeit nennen (z.B. Wohnzimmer streichen)",
            "Quadratmeter oder Menge nennen",
            "Material grob erwähnen",
            "Arbeitszeit grob schätzen",
            "Besonderheiten erwähnen",
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-slate-950">{i + 1}</span>
              <span className="text-slate-300 text-sm">{tip}</span>
            </div>
          ))}
          <div className="mt-3 rounded-2xl bg-slate-800 p-4">
            <p className="text-xs text-emerald-400 font-bold mb-1">Beispiel:</p>
            <p className="text-slate-300 text-sm italic">„Wohnzimmer streichen, 35 Quadratmeter, zwei Anstriche, Material etwa 120 Euro, Arbeitszeit ungefähr 5 Stunden."</p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 flex flex-col items-center gap-6">

          {/* Status */}
          <div className="text-center">
            {laden ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"/>
                  <span className="font-black text-emerald-400">KI verarbeitet...</span>
                </div>
                <p className="text-slate-400 text-sm">Bitte warten</p>
              </div>
            ) : aufnahme ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"/>
                  <span className="font-black text-red-400">AUFNAHME LÄUFT</span>
                </div>
                <p className="text-slate-400 text-sm font-mono">{formatZeit(aufnahmeZeit)}</p>
              </div>
            ) : text ? (
              <p className="text-emerald-400 font-bold">✅ Aufnahme bereit</p>
            ) : (
              <p className="text-slate-500">Drücke den Button und sprich</p>
            )}
          </div>

          {/* Aufnahme Button */}
          <button
            onClick={aufnahme ? aufnahmeStoppen : aufnahmeStarten}
            disabled={laden}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl font-black shadow-2xl transition-all duration-200 active:scale-95 ${
              laden
                ? "bg-slate-700 cursor-wait"
                : aufnahme
                ? "bg-red-500 shadow-red-500/40 animate-pulse scale-110"
                : "bg-emerald-500 shadow-emerald-500/40 hover:scale-105"
            }`}
          >
            {laden ? "⏳" : aufnahme ? "⏹" : "🎤"}
          </button>

          <p className="text-xs text-slate-500">
            {laden ? "KI analysiert deine Sprache..." : aufnahme ? "Tippe zum Stoppen" : "Tippe zum Starten"}
          </p>
        </div>

        {/* Fehler */}
        {fehler && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{fehler}</p>
          </div>
        )}

        {/* Textfeld */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">📝 Erkannter Text</h2>
            {text && (
              <button onClick={textLoeschen} className="text-xs text-red-400 hover:text-red-300 transition">
                🗑 Löschen
              </button>
            )}
          </div>
          <textarea
            className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none h-48"
            placeholder="Hier erscheint dein gesprochener Text... oder tippe direkt rein!"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (
            <p className="text-xs text-slate-500 text-right">{text.split(" ").filter(Boolean).length} Wörter</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={angebotUebernehmen}
            className="flex-1 rounded-3xl bg-emerald-500 p-5 text-xl font-black text-slate-950 hover:bg-emerald-400 transition hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            ✅ In Angebot übernehmen
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="rounded-3xl bg-slate-800 px-8 p-5 font-bold hover:bg-slate-700 transition"
          >
            ← Zurück
          </button>
        </div>

      </section>
    </main>
  );
}
