import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { audio } = await req.json();

    if (!audio) {
      return NextResponse.json({ text: null });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Du bist ein Assistent für einen Handwerkerbetrieb. 
Der Nutzer hat folgendes gesprochen (bereits als Text übermittelt): "${audio}"

Formatiere diesen Text als saubere Leistungsbeschreibung auf Deutsch.
Schreibe nur die formatierte Beschreibung, ohne Erklärungen.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || null;

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Transkription Fehler:", error);
    return NextResponse.json({ error: "Fehler bei der Verarbeitung" }, { status: 500 });
  }
}