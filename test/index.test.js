import test from 'node:test';
import assert from 'node:assert/strict';
import {
  axisRatio,
  evaluateCentering,
  gradingExpectedValue,
} from '../src/index.js';

test('axisRatio calculates 50/50 and 55/45 accurately in any unit', () => {
  assert.deepEqual(axisRatio(2.5, 2.5), { heavy: 50, light: 50, label: '50/50' });
  assert.deepEqual(axisRatio(2.2, 1.8), { heavy: 55, light: 45, label: '55/45' });
  assert.deepEqual(axisRatio(120, 180), { heavy: 60, light: 40, label: '60/40' });
});

test('evaluateCentering flags gem mint vs off-center ceilings', () => {
  const clean = evaluateCentering({
    front: { left: 2.4, right: 2.6, top: 2.5, bottom: 2.5 },
    back: { left: 2.0, right: 3.0, top: 2.5, bottom: 2.5 },
  });
  assert.equal(clean.front.worstLabel, '52/48');
  assert.equal(clean.back.worstLabel, '60/40');
  assert.match(clean.estimates.psa, /^PSA 10 \(within 55\/45/);
  assert.equal(clean.estimates.bgsCenteringSubgrade, 9.5);

  const offCenter = evaluateCentering({
    front: { left: 3.2, right: 1.8, top: 2.5, bottom: 2.5 },
  });
  assert.equal(offCenter.front.worstLabel, '64/36');
  assert.equal(offCenter.estimates.psa, 'PSA 9 ceiling');
});

test('gradingExpectedValue computes break-even gem rate on modern cards', () => {
  const ev = gradingExpectedValue({
    rawPrice: 200,
    psa9Price: 200,
    psa10Price: 520,
    gradingFee: 25,
    gemRate: 0.5,
  });
  assert.equal(ev.expectedProfitVsRaw, 135);
  assert.equal(ev.breakEvenGemRate, 0.08);
  assert.equal(ev.worthSubmittingAtGemRate, true);

  const losing = gradingExpectedValue({
    rawPrice: 200,
    psa9Price: 180,
    psa10Price: 300,
    gradingFee: 25,
    gemRate: 0.2,
    sellerFeeRate: 0.13,
  });
  assert.equal(losing.worthSubmittingAtGemRate, false);
});
