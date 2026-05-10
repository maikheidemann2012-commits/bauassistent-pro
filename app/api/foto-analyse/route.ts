import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const bild = formData.get("bild") as File;

  if (!bild) {
    return NextResponse.json({ fehler: "Kein Bild" }, { status: 400 });
  }

  const bytes = await bild.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = bild.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
            {
              type: "text",
              text: `Du bist ein erfahrener Handwerksmeister.Analysiere dieses Baustellenfoto und erkenne alle notwendigen Arbeiten. Wenn Bodenbelag sichtbar ist, erwähne immer eine Position "Bodenbelag erneuern" mit konkreter Beschreibung. Antworte NUR als JSON:
{
  "leistungen": [
    {"bezeichnung": "Kurze Bezeichnung", "beschreibung": "Was genau gemacht werden muss", "prioritaet": "hoch|mittel|niedrig"}
  ],
  "zusammenfassung": "Kurze Gesamtbeschreibung"
}
Nur JSON, kein weiterer Text.`,
            },
          ],
        },
      ],
    }),
  });

  const daten = await response.json();

  if (!daten.content?.[0]?.text) {
    console.error("KI Antwort:", JSON.stringify(daten));
    return NextResponse.json(
      { fehler: "KI-Analyse fehlgeschlagen: " + JSON.stringify(daten) },
      { status: 500 }
    );
  }

  const sauber = daten.content[0].text.replace(/```json|```/g, "").trim();

  try {
    return NextResponse.json(JSON.parse(sauber));
  } catch {
    return NextResponse.json(
      { fehler: "Antwort konnte nicht verarbeitet werden" },
      { status: 500 }
    );
  }
}