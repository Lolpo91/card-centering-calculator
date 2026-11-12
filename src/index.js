/**
 * Zero-dependency trading card centering & grading break-even calculator.
 * Works with any consistent border unit (mm, pixels, inches, 1/64 in).
 */

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function formatRatio(heavyShare) {
  if (!Number.isFinite(heavyShare)) return '–';
  const heavy = round1(heavyShare);
  const light = round1(100 - heavy);
  const clean = (n) => n.toFixed(1).replace(/\.0$/, '');
  return `${clean(heavy)}/${clean(light)}`;
}

/**
 * Compute centering ratio along a single axis (left/right or top/bottom).
 */
export function axisRatio(borderA, borderB) {
  const a = Number(borderA);
  const b = Number(borderB);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0 || a + b <= 0) {
    throw new RangeError('Border measurements must be non-negative numbers with a positive sum.');
  }
  const total = a + b;
  const heavy = round1((Math.max(a, b) / total) * 100);
  const light = round1(100 - heavy);
  return {
    heavy,
    light,
    label: formatRatio(heavy),
  };
}

function sideSummary(borders) {
  const lr = axisRatio(borders.left, borders.right);
  const tb = axisRatio(borders.top, borders.bottom);
  const worstHeavy = Math.max(lr.heavy, tb.heavy);
  return {
    leftRight: lr,
    topBottom: tb,
    worstHeavy,
    worstLabel: formatRatio(worstHeavy),
  };
}

/**
 * Evaluate front (and optional back) border measurements against commonly
 * published PSA, BGS, and CGC centering guidelines.
 */
export function evaluateCentering({ front, back = null }) {
  if (!front) {
    throw new TypeError('front border measurements ({ left, right, top, bottom }) are required.');
  }

  const frontResult = sideSummary(front);
  const backResult = back ? sideSummary(back) : null;
  const f = frontResult.worstHeavy;
  const b = backResult ? backResult.worstHeavy : 50;

  let psaMaxCeiling;
  if (f <= 55 && b <= 75) {
    psaMaxCeiling = 'PSA 10 (within 55/45 front & 75/25 back)';
  } else if (f <= 60 && b <= 75) {
    psaMaxCeiling = 'PSA 10 borderline / PSA 9 safe (55/45–60/40 front band)';
  } else if (f <= 65 && b <= 90) {
    psaMaxCeiling = 'PSA 9 ceiling';
  } else if (f <= 70 && b <= 90) {
    psaMaxCeiling = 'PSA 8 ceiling';
  } else {
    psaMaxCeiling = 'PSA 7 or lower (or OC qualifier)';
  }

  let bgsCenteringSubgrade;
  if (f === 50 && b === 50) {
    bgsCenteringSubgrade = 10;
  } else if (f <= 50.5 && b <= 55) {
    bgsCenteringSubgrade = 10;
  } else if (f <= 55 && b <= 70) {
    bgsCenteringSubgrade = 9.5;
  } else if (f <= 60 && b <= 80) {
    bgsCenteringSubgrade = 9;
  } else if (f <= 65 && b <= 85) {
    bgsCenteringSubgrade = 8.5;
  } else {
    bgsCenteringSubgrade = 8;
  }

  let cgcMaxCeiling;
  if (f === 50 && b <= 55) {
    cgcMaxCeiling = 'CGC Pristine 10 candidate';
  } else if (f <= 55 && b <= 75) {
    cgcMaxCeiling = 'CGC Gem Mint 10 candidate';
  } else if (f <= 60 && b <= 80) {
    cgcMaxCeiling = 'CGC Mint+ 9.5 / Mint 9 range';
  } else if (f <= 65 && b <= 90) {
    cgcMaxCeiling = 'CGC Mint 9 / NM-Mint+ 8.5 range';
  } else {
    cgcMaxCeiling = 'CGC 8 or lower';
  }

  return {
    front: frontResult,
    back: backResult,
    estimates: {
      psa: psaMaxCeiling,
      bgsCenteringSubgrade,
      cgc: cgcMaxCeiling,
    },
  };
}

/**
 * Compute net grading Expected Value (EV) and break-even PSA 10 gem rate.
 *
 * @param {object} params
 * @param {number} params.rawPrice       Current ungraded market price (USD)
 * @param {number} params.psa9Price      Current PSA 9 market price (USD)
 * @param {number} params.psa10Price     Current PSA 10 market price (USD)
 * @param {number} [params.gradingFee=25] All-in grading + shipping/insurance per card
 * @param {number} [params.gemRate=0.5]  Estimated probability (0..1) of grading PSA 10
 * @param {number} [params.sellerFeeRate=0] Optional marketplace fee rate (e.g. 0.13 for 13%)
 */
export function gradingExpectedValue({
  rawPrice,
  psa9Price,
  psa10Price,
  gradingFee = 25,
  gemRate = 0.5,
  sellerFeeRate = 0,
}) {
  if (rawPrice < 0 || psa9Price < 0 || psa10Price < 0 || gradingFee < 0) {
    throw new RangeError('Prices and fees must be non-negative.');
  }
  if (gemRate < 0 || gemRate > 1) {
    throw new RangeError('gemRate must be between 0 and 1.');
  }
  if (sellerFeeRate < 0 || sellerFeeRate >= 1) {
    throw new RangeError('sellerFeeRate must be in [0, 1).');
  }

  const netKeep = 1 - sellerFeeRate;
  const netRaw = rawPrice * netKeep;
  const netPsa9 = psa9Price * netKeep - gradingFee;
  const netPsa10 = psa10Price * netKeep - gradingFee;

  const expectedGradedNet = gemRate * netPsa10 + (1 - gemRate) * netPsa9;
  const expectedProfitVsRaw = round2(expectedGradedNet - netRaw);

  const spread = netPsa10 - netPsa9;
  let breakEvenGemRate = null;
  if (spread > 0) {
    const rawNeeded = (netRaw - netPsa9) / spread;
    breakEvenGemRate = round2(Math.min(1, Math.max(0, rawNeeded)));
  }

  return {
    netRaw: round2(netRaw),
    netPsa9: round2(netPsa9),
    netPsa10: round2(netPsa10),
    expectedProfitVsRaw,
    breakEvenGemRate,
    worthSubmittingAtGemRate: expectedProfitVsRaw > 0,
  };
}
