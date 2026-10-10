# Static audit (before migration)

This document records the source before migration. Legacy files were removed at the user's request after parity verification; the inventory below is historical.

Seven HTML entry points: index/login (same login), dashboard, history, setting, about, error. No backend, tests, build scripts, analytics, external integrations, sitemap, canonical, Open Graph or theme switch. Yarn lockfile exists. Node 24.18.0 / Yarn 4.17.1 available.

## Routes

index.html → /; login.html → /login; dashboard.html → /dashboard; history.html → /history; setting.html → /setting; about.html → /about; error.html → /error. Add redirects for old URLs, preserving queries/hashes.

## Assets and identity

img/logo.png, logo16.png, logo.psd and 12 reference screenshots. Embedded login logo (641×153 PNG) and favicon must be extracted losslessly. CSS embeds edit/tick icons. No font files or Google Fonts: preserve Roboto, RobotoDraft, Helvetica, Arial, sans-serif stack.

style.css (34KB), media.css (4.6KB): dark-only page #36393e; panel/nav #2f3136; footer #2b2b31; heading #bfbfbb; body #888a8e; link #5281bb; heading accent #4974a9. Gauge colors #d9534f/#337ab7/#5cb85c/#f0ad4e; chart #f56954/#00c0ef/#00a65a. 4px radii, 1140px wrapper; layout breakpoints 428/601/678/916px. Dashboard options before gauges on mobile, right on desktop. History summaries left, table right. Settings two columns at 678px.

## JavaScript inventory and contracts

- functions.js: debug=true; cookie guard only in live mode; XHR GET, exact 200, default 8s timeout; notifications/vibration; keypress permits letters/digits/space/underscore/period, not a paste filter. DOM helpers/prototype extensions become React. Title scrolling, context-menu blocking, disabled zoom/text selection are accessibility candidates.
- login.js: any cookie redirects to dashboard; submit sets EMARTSESSIONID=username. Required password is not authenticated. dateTimeStamp.json function is never called. Embedded logo is active.
- navigator.js: Dashboard, History, Setting, Logout; current route/uppercase heading; logout expires EMARTSESSIONID. Debug navigation always available.
- dashboard.js: live dataDashboard.json and ws://hostname:81/pathname; capacity [260,100,26000,99999]; partial chart/consumption/electricityCost/estimatedCost/switches messages. Gauge uses first strict upper bucket [1,5,10,20,30,40,50,60,70,80,90,100] percent; 4/3/2/1/0 decimals at 10/100/1000/10000. Rolling chart of 100 clamped samples. Calculator power=V×A or Watts; periods 1/hour, hours/day, ×7/week, ×30/month, ×365/year; energy=Wh/1000; cost=energy×rate. Rate is electricityCost[0].
- Dashboard edit reads electricityCost.json, estimatedCost.json, switches.json. Saves via GET electricityCostSave.json?electricityCost=; estimatedCostSave.json?estimatedCost=; switchesNameSave.json?switchName1=…&switchName4=…; switchesToggleSave.json?switchN=true|false. Only literal true succeeds, then empty socket message. Names max 9. Cut-off checkbox has no persistence contract; do not invent one.
- debugging.mode.dashboard.js: 1s random voltage=220+3 random values; current=random; power=V×A; energy=power (not accumulated). Other cards stay zero. Duplicate gauges are a DOM bug.
- history.js: dataHistory.json with electricityCost[0..1], energyCost[1..3], consumption[1..3], totalConsumed[cost,energy], history[date,energy,cost]. 20 rows/page, reversed within slice. Retain original kW labels despite dimensional inconsistency. Retry failed reads after 1s.
- debugging.mode.history.js: 100 future daily rows from tomorrow, energy=random, cost=energy×5.68. Summary accumulates each time a selected page is processed; month resets at day 1. Preserve this surprising demo behavior, document it.
- setting.js: config.json even in debug. configSave.json GET includes ssidName,ssidPassword,ssidHidden,channel; macAp+randMacAp=false OR randMacAp=true+macInterval; serverUsername,serverPassword; wifiStatus and wifiName/wifiPassword only when enabled. Literal true → restartEMART.json → config.json. Reset configReset.json → restart. Preserve all HTML length/range limits. Fix loaded checkbox disabled states without changing payloads.
- Bundled jQuery, Flot and resize: rendering only; React plus SVG can replace them. No other vendor scripts.

## Boundaries and verification

User confirmed debugging mode remains default. Do not fabricate successful saves or a backend. Preserve dormant live request contracts; hardware integration remains unverified without a device. Demo cookie is not production authentication. Pages/layout/static text use Server Components; interactive regions use small client boundaries. Establish foundation → typecheck/build → migrate → functional/visual regression → accessibility/colors/UI → final verification. Keep original sources until parity is verified.

Installed review skills: better-accessibility, better-colors, better-ui. Searched repository and user/plugin skill directories; Superpowers, Ponytail, Caveman, web-design-guidelines, vercel-react-best-practices, next-dev-loop, next-bundle-optimizer and vercel-optimize were not found. Cannot claim their execution; follow supplied investigation/plan/implement/verify/review/simplicity workflow directly.
