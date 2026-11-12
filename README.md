# card-centering-calculator

Zero-dependency JavaScript / TypeScript utility and CLI to calculate **trading card centering ratios** (`50/50`, `55/45`, `60/40`, `75/25`) and **grading Expected Value (EV)** before submitting Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana, or sports cards to PSA, BGS, CGC, or TAG.

- **Interactive web calculator:** [cardgradingai.app/card-centering](https://cardgradingai.app/card-centering)
- **Free AI photo pre-grading (Web, iOS & Android):** [Card Grading AI](https://cardgradingai.app)

---

## Why centering + EV math matters on modern cards

Card centering along each axis is determined by the wider border divided by the sum of both opposite borders:

```text
heavy_axis_% = (max(border_a, border_b) / (border_a + border_b)) * 100
```

Because it is a ratio, **any consistent unit works** — millimeters from a digital caliper, `1/64"` ruler ticks, or pixels measured on a flat, uncropped overhead photo.

### Commonly referenced centering thresholds

| Grade tier | Front centering | Back centering | Notes |
| --- | --- | --- | --- |
| **PSA Gem Mint 10** | ~`55/45` to `60/40` | `75/25` | Eye appeal applies in the `55/45`–`60/40` band |
| **PSA Mint 9** | ~`60/40` to `65/35` | `90/10` | One minor flaw allowed |
| **PSA NM-MT 8** | ~`65/35` to `70/30` | `90/10` | Light corner/edge wear |
| **BGS Pristine 10** | `50/50` | `55/45` | Black Label requires `10` on all 4 subgrades |
| **BGS Gem Mint 9.5** | `55/45` (Centering `9.5`) | `70/30` | Subgrade weighted formula |
| **CGC Pristine 10** | `50/50` | `55/45` | Visually flawless under magnification |
| **CGC Gem Mint 10** | `55/45` | `75/25` | Comparable to modern gem mint tier |

> Grading companies update their published standards periodically. Always confirm current tolerances on the official grader website before submitting high-value cards, and remember centering is only one of four grading factors alongside **corners, edges, and surface**.

---

## Quick start

### Run directly via CLI

```bash
npx github:Lolpo91/card-centering-calculator --front 2.3,2.7,2.5,2.5 --back 2.1,2.9,2.4,2.6
```

Output:

```json
{
  "front": {
    "leftRight": { "heavy": 54, "light": 46, "label": "54/46" },
    "topBottom": { "heavy": 50, "light": 50, "label": "50/50" },
    "worstHeavy": 54,
    "worstLabel": "54/46"
  },
  "back": {
    "leftRight": { "heavy": 58, "light": 42, "label": "58/42" },
    "topBottom": { "heavy": 52, "light": 48, "label": "52/48" },
    "worstHeavy": 58,
    "worstLabel": "58/42"
  },
  "estimates": {
    "psa": "PSA 10 (within 55/45 front & 75/25 back)",
    "bgsCenteringSubgrade": 9.5,
    "cgc": "CGC Gem Mint 10 candidate"
  }
}
```

### Check submission Expected Value (EV) & break-even gem rate

On modern Pokémon and TCG chase cards, PSA 9 copies frequently trade near ungraded prices. Use `--ev <raw,psa9,psa10>` to calculate your break-even gem rate after grading and marketplace fees:

```bash
npx github:Lolpo91/card-centering-calculator --ev 200,205,520 --fee 25 --gem 0.45 --seller-fee 0.13
```

---

## Programmatic API (ESM & TypeScript)

```ts
import {
  axisRatio,
  evaluateCentering,
  gradingExpectedValue,
} from 'card-centering-calculator';

// 1. Single axis ratio (e.g. pixel widths from an overhead scan)
const lr = axisRatio(142, 158);
// => { heavy: 52.7, light: 47.3, label: '52.7/47.3' }

// 2. Full front + back centering evaluation
const report = evaluateCentering({
  front: { left: 2.35, right: 2.65, top: 2.5, bottom: 2.5 },
  back: { left: 2.1, right: 2.9, top: 2.45, bottom: 2.55 },
});

// 3. Expected Value before paying grading fees
const ev = gradingExpectedValue({
  rawPrice: 1075,
  psa9Price: 1000,
  psa10Price: 4157,
  gradingFee: 40,
  gemRate: 0.4,
  sellerFeeRate: 0.13,
});
```

---

## Related Collector Resources

- [Card Centering Calculator (Web UI)](https://cardgradingai.app/card-centering) — instant visual border ratio checker in the browser.
- [How AI Card Pre-Grading Works](https://cardgradingai.app/ai-card-grading) — what photo-based inspection can and cannot detect before you submit.
- [Pokémon Card Pre-Grading Checklist](https://cardgradingai.app/pokemon-card-grading) — inspecting holo scratches, print lines, and dark-blue back whitening.
- [Sports Card Pre-Grading Guide](https://cardgradingai.app/sports-card-grading) — chrome refractor dimples, thick-stock corners, and centering borders.
- [Graded Card Price & PSA 10 Catalog](https://cardgradingai.app/catalog) — raw vs. PSA 9 / PSA 10 market comparisons across Pokémon, Magic, Yu-Gi-Oh!, and One Piece.

## License

MIT © [Card Grading AI](https://cardgradingai.app)
