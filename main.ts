// "Make the AI Judge Laugh: the Office Joke Open"
// Writes one single-line office joke to $MAKEFUN_OUTPUT_DIR/entry.txt.
//
// The gate (per kit RULES.txt): entry.txt must be UTF-8 text of 1-200
// characters, not only whitespace. A single line is required by the
// competition brief ("a single line of at most 200 characters").
// This program validates every one of those conditions before writing
// anything, and fails loudly (non-zero exit, message on stderr) if the
// entry would not pass — an invalid entry scores 0 and takes no prize,
// so a bad write must never be mistaken for a good one.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry text. Chosen for the judge brief: office life, earned laugh
// with the payoff ("to discuss burnout") in the last few words, three
// concrete office details (HR, wellness day, scheduled meeting), fresh
// wellness-day irony, tight at 101 chars.
const JOKE =
  "HR gave us a wellness day to recover from burnout, then scheduled a meeting on it to discuss burnout.";

// Gate limits, mirroring the competition rules exactly.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`gate check failed: ${message}`);
  process.exit(1);
}

// 1. Length check — count characters (code points), not bytes.
const charCount = [...JOKE].length;
if (charCount < MIN_CHARS || charCount > MAX_CHARS) {
  fail(`entry is ${charCount} characters, outside the ${MIN_CHARS}-${MAX_CHARS} range`);
}

// 2. Single-line check — no line breaks of any kind.
if (/[\r\n\u2028\u2029]/.test(JOKE)) {
  fail("entry contains a line break; the entry must be a single line");
}

// 3. Not-whitespace-only check — the gate rejects whitespace-only text.
if (JOKE.trim().length === 0) {
  fail("entry is only whitespace");
}

// 4. UTF-8 round-trip check — encode to UTF-8 bytes and decode back;
// the text must survive unchanged, and no replacement character (U+FFFD)
// may appear (that would mean invalid UTF-8 input).
const encoded = new TextEncoder().encode(JOKE);
const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
if (decoded !== JOKE || decoded.includes("\uFFFD")) {
  fail("entry does not survive a UTF-8 round-trip unchanged");
}

// All gate checks passed — write the entry.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), JOKE, "utf8");
