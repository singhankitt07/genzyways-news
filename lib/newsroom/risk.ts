export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

// Topics where a wrong or unfair story can hurt people or carry legal exposure. These always need a human editor.
const HIGH = [
  "killed", "dead", "death", "dies", "died", "murder", "rape", "suicide", "arrested", "accused", "allegation", "alleged", "lynching",
  "terror", "terrorist", "attack", "blast", "riot", "communal", "hostage", "shooting",
  "court", "verdict", "convicted", "sentenced", "defamation", "fraud", "scam", "money laundering",
  "election result", "exit poll", "vaccine", "cure", "outbreak", "stock tip", "crypto",
  "resigns", "resignation", "sacked", "minor", "child abuse"
];
const MEDIUM = ["minister", "government", "police", "protest", "strike", "accident", "crash", "fire", "health", "hospital", "market", "sensex", "nifty", "policy", "bill", "parliament", "tax", "war", "sanction"];

const compile = (words: string[]) => new RegExp(`\\b(${words.join("|")})\\b`, "i");
const HIGH_RE = compile(HIGH);
const MEDIUM_RE = compile(MEDIUM);

export function assessRisk(text: string): RiskLevel {
  if (HIGH_RE.test(text)) return "HIGH";
  if (MEDIUM_RE.test(text)) return "MEDIUM";
  return "LOW";
}

const RANK: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
export const maxRisk = (a: RiskLevel, b: RiskLevel): RiskLevel => (RANK[a] >= RANK[b] ? a : b);
