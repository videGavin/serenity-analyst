# Serenity Analyst — a Claude Skill

A self-contained [Claude Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) that analyzes **AI-hardware / semiconductor** stocks using the *supply-chain chokepoint* methodology distilled from the X investor **Serenity ([@aleabitoreddit](https://x.com/aleabitoreddit))**.

> *"I don't trade the GPU. I trade the things the GPU can't work without."*

It doesn't chase GPU/Mag7 winners — it walks **upstream** along the hyperscaler-capex flow to the most upstream near-monopoly names ("everyone needs it, nobody can make it, takes years to scale"), and tries to get in before institutions do.

## What's inside

```
serenity-analyst/
├── SKILL.md                          # the skill (instructions + chokepoint framework)
├── README.md                         # this file
├── LICENSE
├── .env.example                      # credential template (copy to .env)
├── .gitignore
├── references/                       # knowledge base (auto-read by the skill)
│   ├── supply_chain_graph.json       #   12-layer AI-hardware chain + verified supplier edges
│   ├── methodology.md                #   full investor profile & methodology
│   ├── chain_map.md                  #   human-readable layered map (+ Mermaid)
│   ├── cjk_addendum.md               #   facts only in his Chinese/Japanese posts
│   └── verification.md               #   quote-level fact-check log
├── examples/
│   └── advanced-packaging-case.md    #   a worked example (advanced-packaging equipment)
└── scripts/
    └── search_serenity.mjs           #   fetch his live take on a ticker (X API)
```

## Install

**Claude Code / Claude Desktop** — copy this folder into your skills directory:

```bash
# Claude Code (project-level)
cp -r serenity-analyst .claude/skills/

# or user-level
cp -r serenity-analyst ~/.claude/skills/
```

The skill loads automatically when you ask something matching its `description`.

## Usage

Just ask, e.g.:

- "Use Serenity's chokepoint framework to analyze $CRDO"
- "$NVDA has run a lot — which upstream supplier should I buy instead?"
- "Advanced-packaging equipment is the fastest-growing WFE sub-segment in 2026 — who benefits?"

The skill reads the bundled knowledge base, applies the 7-step framework, and returns a structured thesis (with an NFA note).

## Example output

**Q:** *CoWoS is expanding from AI GPUs to HPC and high-end networking chips; Hybrid Bonding is expanding from HBM to 3D-stacked logic; CPO gets a commercial timeline (2027-2028). Advanced-packaging equipment is the fastest-growing WFE sub-segment in 2026 (~35% YoY). Which stocks benefit?*

**A (abridged — full version in [`examples/advanced-packaging-case.md`](examples/advanced-packaging-case.md)):**

He literally posted a *"Bottleneck ETF"* (2026-02-12) for exactly this chain — `$LITE / $AMKR / DISCO / $GLW / $COHR / $ONTO / $CAMT / $TSM / $KLAC / $APH`. Ranked by his preference:

| Tier | Tickers | Why |
|---|---|---|
| **① Core (he holds, on his 100-1000% list)** | **$LPK** (glass-TGV equip.), **Unimicron** (CoWoS carrier), **$AEHR** (test), **Nitto Boseki** (T-Glass) | chokepoint + already paid off |
| **② Back-end equipment duopolies (architecture-agnostic)** | **$BESI** (hybrid bonding), **TOWA/6315** (molding), **$DISCO** (dicing) | benefit whoever wins the packaging race |
| **③ "Complexity tax" (highest certainty)** | **$ONTO / $CAMT / $FORM** | inspection/test intensity rises with every new package type |
| **④ New-category early entry (2027-28)** | glass chain **$LPK > $GLW > $NBCLF > $ONTO** | equipment orders first, revenue ramps 2027 |
| **⑤ HBM4 pure-play** | $ADEA (bonding-IP royalty), $FORM, Auros (322310) | $MU / SK / Samsung capex |
| **⑥ CPO test (2027-28)** | $FORM, Advantest (6857), $KEYS, MSScorps (6830) | CPO yield / alignment bottleneck |
| **⑦ Big exposure, lower preference** | $AMKR / $ASX (OSAT, low margins); **$AIXA he avoids** | — |

Two Serenity-specific tells: he prefers **equipment/materials chokepoints over OSAT** (pricing power), and he flags **equipment as strongly cyclical** — thesis breaks when packaging/WFE capex growth peaks (he took a real short-term -20% hit on TOWA and used it to preach "direction right ≠ timing right"). Value on comparable in-layer market cap, **never P/E**. NFA.

> Every name above is sourced to a dated quote from his posts — see the full example for the receipts.

## Live data (optional)

`scripts/search_serenity.mjs` pulls his **current** posts on a ticker via the official X API. Credentials are read **only from environment variables** — nothing is hardcoded.

```bash
cp .env.example .env        # then fill in your own keys
export $(grep -v '^#' .env | xargs)
node scripts/search_serenity.mjs "$AXTI" --since 2026-01-01 --max 50
```

Get credentials at <https://developer.x.com>. Full-archive search needs a Pro/Enterprise tier; the script auto-falls back to 7-day recent search otherwise. You can also set `X_BEARER_TOKEN` directly.

## Data provenance

The knowledge base was distilled from **6,192 of Serenity's posts** (2025-07-02 → 2026-05-31, the account's full history) via multi-agent analysis, then quote-verified against the source (see `references/verification.md`).

## ⚠️ Disclaimer

This is a **research / educational** tool that models one public investor's *stated* methodology. It is **not investment advice** (NFA). Self-reported returns and market-share figures are the investor's own claims, not independently verified. Do your own research.

## License

MIT — see `LICENSE`. The distilled analysis is derived from public posts for research/educational use.
