import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const css = readFileSync("app/globals.css", "utf8");
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]+)`, "i"))[1];
function luminance(hex) {
  const values = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function ratio(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const pairs = [
  ["Body text", "#888a8e", token("foreground"), token("background"), 4.5],
  ["Links", "#5281bb", token("link"), token("background"), 4.5],
  ["Blue values", "#337ab7", token("info"), token("card"), 4.5],
  ["Red action text", "#d9534f", token("destructive"), token("secondary"), 4.5],
  ["Input boundaries", "#37373d", token("input"), token("background"), 3],
  ["Current gauge", "#337ab7", token("gauge-current"), token("card"), 3],
  ["Off switch thumb", "#c0392b", token("switch-off"), token("switch-track"), 3],
  ["On switch thumb", "#2ecc71", token("switch-on"), token("switch-track"), 3],
  ["Green values", "#5cb85c", token("success"), token("card"), 4.5],
  ["Orange values", "#f0ad4e", token("warning"), token("card"), 4.5],
  ["Focus on page", "#95b8e4", token("ring"), token("background"), 3],
  ["Focus on hover", "#95b8e4", token("ring"), token("accent"), 3],
  ["Primary button text", "#ffffff", token("primary-foreground"), token("primary"), 4.5],
  ["Gauge values", "#757575", token("foreground"), token("card"), 4.5],
  ["Footer text", "#9e9e9e", token("muted-foreground"), "#25252a", 4.5],
].map(([role, original, current, background, minimum]) => ({
  role,
  original,
  current,
  background,
  minimum,
  before: ratio(original, background),
  after: ratio(current, background),
  passes: ratio(current, background) >= minimum,
}));
mkdirSync(".verification", { recursive: true });
writeFileSync(".verification/contrast.json", JSON.stringify(pairs, null, 2));
console.table(pairs.map((p) => ({ ...p, before: p.before.toFixed(2), after: p.after.toFixed(2) })));
if (pairs.some((p) => !p.passes)) process.exitCode = 1;
