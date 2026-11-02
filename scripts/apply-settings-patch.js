const fs = require("fs");
const path = require("path");

const homePath = path.join(
  __dirname,
  "../public/larp-viewers/stripe/home.html",
);
const snippetPath = path.join(
  __dirname,
  "../public/larp-viewers/stripe/lc-settings-snippet.js",
);

let html = fs.readFileSync(homePath, "utf8");
const snippet = fs.readFileSync(snippetPath, "utf8");

const startMarkerA = "  function settings() {";
const startMarkerB = "function settings() {";
const endMarkerA = "  function simplePage(title, icon, h, p, cta) {";
const endMarkerB = "function simplePage(title, icon, h, p, cta) {";
let start = html.indexOf(startMarkerA);
let startMarker = startMarkerA;
if (start < 0) {
  start = html.indexOf(startMarkerB);
  startMarker = startMarkerB;
}
let end = html.indexOf(endMarkerA);
let endMarker = endMarkerA;
if (end < 0) {
  end = html.indexOf(endMarkerB);
  endMarker = endMarkerB;
}
if (start < 0 || end < 0 || end <= start) {
  console.error("Could not locate settings()/simplePage markers", {
    start,
    end,
    startMarker,
    endMarker,
  });
  process.exit(1);
}

const replacement =
  snippet
    .split("\n")
    .filter((l) => !l.startsWith("/*") && !l.includes("Placeholders:"))
    .join("\n")
    .trimEnd() + "\n\n  ";

html = html.slice(0, start) + "  " + replacement + html.slice(end);

const oldCase = 'case "settingsitem": return fail();';
const newCase = `case "settingsitem": return openSettingsItem(b.getAttribute("data-t"));
      case "settingsback": return settings();
      case "settingssave": {
        var patch = collectSettingsFields(view);
        if (window.__LC_SAVE_SETTINGS) window.__LC_SAVE_SETTINGS(patch);
        var saved = $("#sf_saved"); if (saved) { saved.hidden = false; setTimeout(function(){ saved.hidden = true; }, 1600); }
        return;
      }
      case "settingsdismissbanner": {
        if (window.__LC_SAVE_SETTINGS) window.__LC_SAVE_SETTINGS({ _banner: false });
        return settings();
      }`;

if (!html.includes(oldCase)) {
  console.error("settingsitem case not found");
  process.exit(1);
}
html = html.replace(oldCase, newCase);

const cssHook = ".rg.three{grid-template-columns:repeat(3,minmax(0,1fr))}";
const extraCss = `${cssHook}
.sgrid.rich{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media(max-width:1100px){.sgrid.rich{grid-template-columns:1fr}}
.scard.rich{display:flex;align-items:flex-start;gap:12px;text-align:left;padding:16px;min-height:88px}
.scard.rich .ic{margin-top:2px;color:var(--ac)}
.scard-txt{display:flex;flex-direction:column;gap:4px;min-width:0}
.scard-txt b{color:var(--ac);font-weight:600}
.scard-d{color:var(--tx2);font-size:13px;line-height:18px;font-weight:400}
.set-banner{background:var(--info-bg);border:1px solid var(--info-bd);color:var(--info-tx);border-radius:8px;padding:12px 14px;margin:8px 0 18px;font-size:13px}
.set-crumb{margin-bottom:4px}
.linkish{border:0;background:none;color:var(--ac);cursor:pointer;font:inherit;padding:0}
.pill{display:inline-flex;align-items:center;border-radius:999px;background:var(--sub2);color:var(--tx2);font-size:12px;padding:2px 8px;margin:0 0 12px 8px}
.set-card{border:1px solid var(--line2);border-radius:8px;padding:16px;margin:14px 0}
.set-card h3,.set-card-h h3{margin:0 0 12px;font-size:16px}
.set-card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.sf{display:flex;flex-direction:column;gap:6px;margin:0 0 14px;font-size:13px;color:var(--tx2)}
.sf input,.sf select{height:36px;border:1px solid var(--line2);border-radius:6px;padding:0 10px;background:var(--bg);color:var(--tx);font:inherit}
.sf-ro{display:flex;gap:8px;align-items:center}
.sf-ro input{flex:1}
.sf-actions{display:flex;align-items:center;gap:10px;margin:18px 0 40px}
.sf-saved{color:var(--ok-tx);font-size:13px}
.set-table{width:100%;border-collapse:collapse;font-size:13px}
.set-table th,.set-table td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}
.set-table th{color:var(--tx2);font-weight:500}
.tabs-row{display:flex;gap:14px;overflow:auto;border-bottom:1px solid var(--line);margin:8px 0 18px}
.tabs-row .tab{border:0;background:none;padding:10px 2px;color:var(--tx2);cursor:pointer;font:inherit;border-bottom:2px solid transparent}
.tabs-row .tab.on{color:var(--tx);border-bottom-color:var(--ac)}
.comms-head,.comms-row{display:grid;grid-template-columns:minmax(0,1fr) 64px 64px 64px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}
.comms-head{color:var(--tx2);border-bottom:0;padding-bottom:4px}
.chk{display:flex;justify-content:center}
.chk.dis{opacity:.45}
.chk input{width:16px;height:16px;accent-color:var(--ac)}
.err{color:var(--bad-tx);font-size:12px;margin:-6px 0 12px}
.ok-pill{display:inline-flex;background:var(--ok-bg);color:var(--ok-tx);border:1px solid var(--ok-bd);border-radius:999px;padding:2px 8px;font-size:12px;margin:0 0 12px}
.note{font-size:13px;color:var(--tx);margin:0 0 14px}
.h3{font-size:14px;margin:18px 0 6px}
.muted{color:var(--tx2);font-size:13px}
`;

if (!html.includes(cssHook)) {
  console.error("CSS hook missing");
  process.exit(1);
}
html = html.replace(cssHook, extraCss);

fs.writeFileSync(homePath, html);
console.log("Patched", homePath, "size", html.length);
