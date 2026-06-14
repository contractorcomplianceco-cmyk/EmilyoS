import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const OUT = resolve(
  process.cwd(),
  "../artifacts/command-center/public/walkthrough/EmilyOS-User-Guide.pdf",
);
mkdirSync(dirname(OUT), { recursive: true });

const NAVY = "#0c1230";
const INK = "#1e293b";
const MUTED = "#64748b";
const TEAL = "#0d9488";
const CYAN = "#06b6d4";
const LINE = "#e2e8f0";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 64, bottom: 64, left: 64, right: 64 },
  bufferPages: true,
  info: {
    Title: "CCA EmilyOS — User Guide",
    Author: "Contractor Compliance Authority",
    Subject: "Regulatory Communications Command Center — Detailed User Guide",
  },
});

doc.pipe(createWriteStream(OUT));

const PAGE_W = doc.page.width;
const ML = doc.page.margins.left;
const MR = doc.page.margins.right;
const CONTENT_W = PAGE_W - ML - MR;

function h1(text: string) {
  if (doc.y > doc.page.height - 160) doc.addPage();
  doc.moveDown(0.6);
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text(text, ML, doc.y);
  const y = doc.y + 4;
  doc
    .moveTo(ML, y)
    .lineTo(ML + 46, y)
    .lineWidth(3)
    .strokeColor(TEAL)
    .stroke();
  doc.moveDown(0.8);
}

function h2(text: string) {
  if (doc.y > doc.page.height - 140) doc.addPage();
  doc.moveDown(0.4);
  doc
    .fillColor(TEAL)
    .font("Helvetica-Bold")
    .fontSize(11.5)
    .text(text.toUpperCase(), ML, doc.y, { characterSpacing: 0.6 });
  doc.moveDown(0.3);
}

function body(text: string) {
  doc
    .fillColor(INK)
    .font("Helvetica")
    .fontSize(10.5)
    .text(text, ML, doc.y, { width: CONTENT_W, align: "left", lineGap: 2.5 });
  doc.moveDown(0.5);
}

function bullets(items: string[]) {
  doc.font("Helvetica").fontSize(10.5).fillColor(INK);
  for (const it of items) {
    if (doc.y > doc.page.height - 90) doc.addPage();
    const startY = doc.y;
    doc.fillColor(TEAL).text("•", ML + 4, startY, { width: 12 });
    doc
      .fillColor(INK)
      .text(it, ML + 20, startY, { width: CONTENT_W - 20, lineGap: 2 });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.3);
}

function callout(title: string, text: string) {
  if (doc.y > doc.page.height - 150) doc.addPage();
  const padX = 14;
  const padY = 12;
  const innerW = CONTENT_W - padX * 2;
  doc.font("Helvetica-Bold").fontSize(10.5);
  const tH = doc.heightOfString(title, { width: innerW });
  doc.font("Helvetica").fontSize(10);
  const bH = doc.heightOfString(text, { width: innerW, lineGap: 2 });
  const boxH = tH + bH + padY * 2 + 6;
  const top = doc.y;
  doc
    .roundedRect(ML, top, CONTENT_W, boxH, 8)
    .fillColor("#ecfeff")
    .fill();
  doc
    .roundedRect(ML, top, 4, boxH, 2)
    .fillColor(CYAN)
    .fill();
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .text(title, ML + padX, top + padY, { width: innerW });
  doc
    .fillColor(INK)
    .font("Helvetica")
    .fontSize(10)
    .text(text, ML + padX, doc.y + 2, { width: innerW, lineGap: 2 });
  doc.y = top + boxH;
  doc.moveDown(0.8);
}

/* ----------------------------- Cover page ----------------------------- */
doc.rect(0, 0, PAGE_W, doc.page.height).fill(NAVY);
doc.rect(0, 0, PAGE_W, 6).fill(TEAL);

doc
  .fillColor("#ffffff")
  .font("Helvetica-Bold")
  .fontSize(13)
  .text("CONTRACTOR COMPLIANCE AUTHORITY", ML, 150, {
    characterSpacing: 1.5,
  });

doc
  .fillColor(CYAN)
  .font("Helvetica-Bold")
  .fontSize(46)
  .text("CCA EmilyOS", ML, 250);

doc
  .fillColor("#cbd5e1")
  .font("Helvetica")
  .fontSize(15)
  .text("Regulatory Communications Command Center", ML, 312);

doc
  .fillColor("#94a3b8")
  .font("Helvetica")
  .fontSize(13)
  .text("Detailed User Guide", ML, 340);

doc
  .moveTo(ML, 380)
  .lineTo(ML + 120, 380)
  .lineWidth(2)
  .strokeColor(TEAL)
  .stroke();

doc
  .fillColor("#cbd5e1")
  .font("Helvetica")
  .fontSize(11)
  .text(
    "Prepared for Emily Jones, Director of Compliance & Regulatory Communications. This guide explains how to use every area of EmilyOS to track agencies, communications, regulatory matters, deficiencies, escalations, tasks, and institutional knowledge.",
    ML,
    410,
    { width: CONTENT_W - 80, lineGap: 3 },
  );

doc
  .fillColor("#64748b")
  .font("Helvetica")
  .fontSize(9.5)
  .text(
    "Role boundary: EmilyOS supports communication, follow-up, documentation, and routing. It does not provide legal, compliance, or tax advice, and does not make final decisions.",
    ML,
    doc.page.height - 110,
    { width: CONTENT_W - 80, lineGap: 2.5 },
  );

/* ----------------------------- Content ----------------------------- */
doc.addPage();

h1("1. Welcome & Overview");
body(
  "CCA EmilyOS is your internal command center for regulatory communications and compliance operations. It brings agencies, communications, regulatory matters, deficiencies, escalations, tasks, change monitoring, and institutional knowledge into a single workspace so nothing falls through the cracks.",
);
body(
  "Everything you enter is saved automatically in your browser, so your data persists between sessions on the same device. There is no separate login or server to manage for your working data.",
);
callout(
  "Your role in EmilyOS",
  "EmilyOS is built around tracking, documenting, and routing. Use it to log what was communicated, what is outstanding, and who needs to act next. It is not a system of legal record and does not replace professional legal, compliance, or tax advice.",
);

h1("2. Getting Started");
h2("The three ways to learn EmilyOS");
bullets([
  "Narrated Video — an animated, voiced tour of the whole product. Best for a quick first overview.",
  "Guided Tour — the same animated tour with no audio. Step through each section at your own pace using Back and Next.",
  "This User Guide — the complete written reference you are reading now. Best for looking up a specific feature.",
]);
h2("Finding your way around");
bullets([
  "The left sidebar is your main navigation, grouped into Overview, Operations, and Knowledge & Insights.",
  "The top bar shows the current date and quick search for agencies and matters.",
  "Most pages follow the same pattern: a header with an Add button, a searchable table or card list, and a detail panel that opens when you select a record.",
]);

h1("3. Dashboard");
body(
  "The Dashboard is your daily starting point. Every panel is calculated live from your data, so the numbers always reflect your most recent edits.",
);
bullets([
  "KPI cards summarize active agencies, active projects/matters, and open compliance items at a glance.",
  "The compliance ring shows your overall compliance health as a single percentage.",
  "Priorities highlights the items that need attention first.",
  "The Upcoming Calendar surfaces approaching deadlines and follow-ups.",
  "The Alerts & Risk panel flags items that may escalate if not addressed.",
]);

h1("4. Agency Directory");
body(
  "The Agency Directory is the single place for every regulator you work with. Keep contact details, jurisdiction, and notes current so the rest of the system can link communications and matters to the right agency.",
);
h2("Common actions");
bullets([
  "Add an agency using the button in the page header, then complete the form fields.",
  "Open any agency to view its full detail panel.",
  "Edit or delete an agency from its detail panel.",
  "Use search to quickly find an agency by name.",
]);

h1("5. Communications Hub");
body(
  "The Communications Hub is your log of every exchange with an agency — letters, calls, emails, and submissions. A complete communication history is the backbone of good regulatory follow-up.",
);
bullets([
  "Record each communication with its type, date, related agency, and a short summary.",
  "Link communications to the relevant regulatory matter so the full story stays connected.",
  "Review past exchanges before responding so nothing is missed or duplicated.",
]);

h1("6. Regulatory Tracker");
body(
  "The Regulatory Tracker follows each regulatory matter through its lifecycle, from intake to resolution. It is where you keep the status, owner, and key dates for every active matter.",
);
bullets([
  "Create a matter and assign its status, agency, and deadlines.",
  "Update the status as the matter progresses so the Dashboard stays accurate.",
  "Watch for approaching deadlines surfaced on the Dashboard calendar.",
]);

h1("7. Deficiencies & Escalations");
h2("Deficiencies");
body(
  "Deficiencies capture specific issues raised by an agency that require a response. Track each one so you can demonstrate timely, documented follow-up.",
);
h2("Escalations");
body(
  "When a matter needs a decision or attention beyond routine follow-up, route it as an escalation. Escalations make it clear what is waiting on whom, while keeping the final decision with the appropriate decision-maker.",
);

h1("8. Tasks & Approvals");
body(
  "Tasks & Approvals is your personal follow-up queue. Use it to route the next action and to confirm that required approvals have been obtained.",
);
bullets([
  "Add a task with a clear description, owner, and due date.",
  "Mark tasks complete as you finish them.",
  "Use approvals to record sign-off where it is required before proceeding.",
]);

h1("9. Change Monitor");
body(
  "The Change Monitor flags new and updated regulations so you are never caught off guard by a change in the rules. When something new appears, review it and create the appropriate matter or task.",
);
callout(
  "Turn alerts into action",
  "A flagged change is only useful if it leads to follow-up. When the Change Monitor surfaces an update, decide whether it needs a new matter, a communication, or a task, and route it immediately.",
);

h1("10. Knowledge Base & SOPs");
body(
  "The Knowledge Base preserves institutional memory — the answers, precedents, and context that would otherwise live only in your head. SOPs and policies document how recurring processes should be handled.",
);
bullets([
  "Capture lessons learned and reusable guidance as knowledge entries.",
  "Document standard operating procedures so processes stay consistent.",
  "Search the knowledge base before reinventing an answer.",
]);

h1("11. Reports & Analytics");
body(
  "Reports & Analytics turns your day-to-day activity into a clear picture of performance and risk — response times, recurring themes, and workload across agencies. Use it to brief leadership and to spot patterns early.",
);

h1("12. Intelligence");
body(
  "The Intelligence area highlights actionable insights derived from your data, helping you focus on what matters most and anticipate where attention will be needed next.",
);

h1("13. Team Directory");
body(
  "The Team Directory keeps contact information and roles for the people you coordinate with, so routing and follow-up stay clear across the team.",
);

h1("14. Settings & Data");
body(
  "Settings is where you manage application preferences and your working data. Because EmilyOS stores data in your browser, the reset option lets you restore the original demo data when you want a clean starting point.",
);
callout(
  "Before you reset",
  "Resetting demo data replaces your current records with the original sample set. Only use it when you intentionally want to start over, as your existing entries on this device will be cleared.",
);

h1("15. Tips for Daily Use");
bullets([
  "Start each day on the Dashboard to triage priorities, deadlines, and alerts.",
  "Log communications as they happen — a contemporaneous record is far more reliable than memory.",
  "Keep matter statuses current so the Dashboard and reports stay truthful.",
  "Route follow-ups as tasks so nothing depends on remembering it later.",
  "Capture anything you had to figure out into the Knowledge Base for next time.",
]);

/* ----------------------------- Footers ----------------------------- */
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  if (i === 0) continue;
  const fy = doc.page.height - 44;
  doc
    .moveTo(ML, fy)
    .lineTo(PAGE_W - MR, fy)
    .lineWidth(0.75)
    .strokeColor(LINE)
    .stroke();
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8.5)
    .text("CCA EmilyOS — User Guide", ML, fy + 8, {
      width: CONTENT_W / 2,
      align: "left",
    });
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8.5)
    .text(`Page ${i + 1 - range.start} of ${range.count - 1}`, ML + CONTENT_W / 2, fy + 8, {
      width: CONTENT_W / 2,
      align: "right",
    });
}

doc.end();
console.log("User guide written to", OUT);
