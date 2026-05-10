"use client";

import { useState, useEffect, useRef } from "react";

export default function SprachePage() {
  const [text, setText] = useState("");
  const [aufnahme, setAufnahme] = useState(false);
  const [fehler, setFehler] = useState("");
  const [lautstaerke, setLautstaerke] = useState(0);
  const [zwischenText, setZwischenText] = useState("");
  const [aufnahmeZeit, setAufnahmeZeit] = useState(0);
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const animationRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopAlles();
    };
  }, []);

  function stopAlles() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop());
    }
  }

  function lautstaerkeAnalyse(stream: MediaStream) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    function tick() {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLautstaerke(Math.min(100, avg * 2));
      animationRef.current = requestAnimationFrame(tick);
    }
    tick();
  }

  async function aufnahmeStarten() {
    setFehler("");
    setZwischenText("");

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setFehler("❌ Dein Browser unterstützt keine Spracherkennung. Bitte Chrome verwenden!");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      lautstaerkeAnalyse(stream);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "de-DE";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onresult = (e: any) => {
        let final = "";
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript + " ";
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        if (final) setText((prev) => prev + final);
        setZwischenText(interim);
      };

      recognition.onerror = (e: any) => {
        if (e.error === "not-allowed") {
          setFehler("❌ Mikrofon-Zugriff verweigert! Bitte in den Browser-Einstellungen erlauben.");
        } else if (e.error === "no-speech") {
          setFehler("🔇 Kein Ton erkannt — bitte lauter sprechen!");
        } else {
          setFehler(`⚠️ Fehler: ${e.error}`);
        }
        setAufnahme(false);
      };

      recognition.onend = () => {
        // nicht neu starten
      };

      recognition.start();
      recognitionRef.current = recognition;
      setAufnahme(true);

      setAufnahmeZeit(0);
      timerRef.current = setInterval(() => {
        setAufnahmeZeit((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setFehler("❌ Mikrofon konnte nicht gestartet werden!");
    }
  }

  function aufnahmeStoppen() {
    stopAlles();
    setAufnahme(false);
    setLautstaerke(0);
    setZwischenText("");
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function textLoeschen() {
    setText("");
    setZwischenText("");
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

  const balken = 20;

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

          {/* Wellenanzeige */}
          <div className="flex items-end gap-1 h-20">
            {Array.from({ length: balken }).map((_, i) => {
              const mitte = balken / 2;
              const distanz = Math.abs(i - mitte) / mitte;
              const hoehe = aufnahme
                ? Math.max(4, lautstaerke * (1 - distanz * 0.5) * (0.5 + Math.random() * 0.5))
                : 4;
              return (
                <div
                  key={i}
                  className="w-2 rounded-full transition-all duration-75"
                  style={{
                    height: `${hoehe}px`,
                    backgroundColor: aufnahme ? "#22c55e" : "#334155",
                    opacity: aufnahme ? 1 : 0.4,
                  }}
                />
              );
            })}
          </div>

          {/* Status */}
          <div className="text-center">
            {aufnahme ? (
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
            className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl font-black shadow-2xl transition-all duration-200 active:scale-95 ${
              aufnahme
                ? "bg-red-500 shadow-red-500/40 animate-pulse scale-110"
                : "bg-emerald-500 shadow-emerald-500/40 hover:scale-105"
            }`}
          >
            {aufnahme ? "⏹" : "🎤"}
          </button>

          <p className="text-xs text-slate-500">
            {aufnahme ? "Tippe zum Stoppen" : "Tippe zum Starten"}
          </p>
        </div>

        {/* Zwischentext (live) */}
        {zwischenText && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-400 font-bold mb-1">🔄 Wird erkannt...</p>
            <p className="text-slate-300 italic">{zwischenText}</p>
          </div>
        )}

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