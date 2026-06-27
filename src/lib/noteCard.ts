const BULLET_RE = /^[•\-*]\s+/;
const CHECKBOX_RE = /^\[([ xX])\]\s*/;

export type NoteCardLineType = "bullet" | "checkbox" | "text";

export interface NoteCardLine {
  type: NoteCardLineType;
  content: string;
  checked?: boolean;
}

export interface ParsedNoteCard {
  preview: string;
  lines: NoteCardLine[];
  canExpand: boolean;
}

function parseLine(line: string): NoteCardLine {
  const trimmed = line.trim();
  const check = trimmed.match(CHECKBOX_RE);
  if (check) {
    return {
      type: "checkbox",
      content: trimmed.replace(CHECKBOX_RE, ""),
      checked: check[1].toLowerCase() === "x",
    };
  }
  if (BULLET_RE.test(trimmed)) {
    return {
      type: "bullet",
      content: trimmed.replace(BULLET_RE, ""),
    };
  }
  return { type: "text", content: trimmed };
}

export function parseNoteCard(note: string): ParsedNoteCard | null {
  const nonEmpty = note
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim());

  if (nonEmpty.length === 0) return null;

  const lines = nonEmpty.map(parseLine);
  const bodyLines = lines.slice(1);

  const preview =
    lines.length === 1
      ? lines[0].content
      : `${lines.length} sub-items`;

  return {
    preview,
    lines: bodyLines,
    canExpand: bodyLines.length > 0,
  };
}
