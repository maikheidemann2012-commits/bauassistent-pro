import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

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
          content: `Du bist ein Assistent für Handwerker. Analysiere diesen Auftrag und gib NUR eine JSON-Liste mit den einzelnen Posten zurück. Keine Erklärung, nur JSON.

Format: { "posten": ["Beschreibung Posten 1", "Beschreibung Posten 2", ...] }

Auftrag: ${text}`,
        },
      ],
    }),
  });

  const daten = await response.json();
  const inhalt = daten.content[0].text;

  const sauber = inhalt.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(sauber);

  return NextResponse.json(parsed);
}