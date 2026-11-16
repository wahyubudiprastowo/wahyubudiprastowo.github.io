# WAHYU — Personal Portfolio (POPOLAB-style)

A single-page personal portfolio for **Wahyu Budi Prastowo** (Cloud Infrastructure Architect — Migration · Security · Automation · AI), faithfully modeled on the layout and interaction design of [popolab-tw.github.io](https://popolab-tw.github.io/) (rebuilt from its public source). Built with **Next.js 16 + TypeScript + Tailwind CSS 4**, deploys as a **static export to GitHub Pages**.

**Live site language:** English. Content comes from the CV highlights and every text is editable in the browser.

## Signature effects

| Effect | What it does |
| --- | --- |
| **Skill swarm cursors** | 10 named skill cursors (Azure, AWS, Google Cloud, Terraform, Kubernetes, Python, PowerShell, Ansible, Docker, Wazuh) fly in on load, orbit the mouse like design-tool collaborators, and when it rests they "work": reading text lines with a colored highlight sweep, clicking buttons (visual selection box + ripple), and inspecting images/titles with live `W × H` measurement boxes. Mobile gets 4 cursors. |
| **POPOLAB hero** | Giant red-gradient "WAHYU" mega word bleeding edge-to-edge, handwritten "Hello, I'm", typewriter name, red uppercase role, count-up stats, and the GTA VI artwork crop rising out of the mega word with a red glow and bottom fade. |
| **Custom cursor** | Red dot + eased trailing ring; grows on links, becomes an "OPEN" bubble over project cards. |
| **Marquee tickers** | Giant tilted red band + ghost outline band, infinite scroll. |
| **Sections** | Work (filter tabs + numbered cards) → Numbers (big stat + ranked impact rows) → Craft (chips + 5-step process + red quote card) → Journey (expandable career timeline + certs) → Contact (circle CTA + list + tilted GTA card). |
| **Micro-motion** | Scroll-spy nav with scramble hover, magnetic buttons, card image zoom, parallax mega title, intro stagger, reveal-on-scroll, scroll progress bar, live Jakarta clock. |

All motion respects the **Motion On/Off** toggle (persisted in the browser) and `prefers-reduced-motion`.

## Editable by design

Toggle **Edit** in the header: every text on the page becomes `contenteditable`,
changes autosave to `localStorage`, the gear icon on each project card opens a
settings panel (title, hook, URL, category, image, delete), and **Export**
downloads `content.json` so you can publish the new content to
`public/content.json` on GitHub — no coding anywhere.

See **PANDUAN-UPLOAD.md** (Bahasa Indonesia) for the full upload + editing walkthrough.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint
PAGES_BUILD=1 PAGES_BASE_PATH=/portfolio bun x next build   # static export to out/
```

Deploy: push the repo to GitHub, enable **Settings → Pages → Source: GitHub
Actions**; `.github/workflows/deploy-pages.yml` builds and publishes on every push.
