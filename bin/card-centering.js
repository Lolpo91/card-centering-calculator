#!/usr/bin/env node
import { evaluateCentering, gradingExpectedValue } from '../src/index.js';

function parseQuad(raw, flagName) {
  const parts = String(raw).split(',').map((s) => Number(s.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error(`${flagName} expects 4 comma-separated numbers: left,right,top,bottom`);
  }
  const [left, right, top, bottom] = parts;
  return { left, right, top, bottom };
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`card-centering — Trading card centering & grading EV calculator

Usage:
  card-centering --front <L,R,T,B> [--back <L,R,T,B>]
  card-centering --ev <raw,psa9,psa10> [--fee 25] [--gem 0.5] [--seller-fee 0.13]

Examples:
  card-centering --front 2.3,2.7,2.5,2.5 --back 2.1,2.9,2.4,2.6
  card-centering --ev 200,205,520 --fee 25 --gem 0.45 --seller-fee 0.13

Interactive browser calculator: https://cardgradingai.app/card-centering`);
  process.exit(0);
}

const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const frontRaw = getArg('--front');
if (frontRaw) {
  const backRaw = getArg('--back');
  const res = evaluateCentering({
    front: parseQuad(frontRaw, '--front'),
    back: backRaw ? parseQuad(backRaw, '--back') : null,
  });
  console.log(JSON.stringify(res, null, 2));
}

const evRaw = getArg('--ev');
if (evRaw) {
  const [rawPrice, psa9Price, psa10Price] = evRaw.split(',').map(Number);
  const gradingFee = getArg('--fee') ? Number(getArg('--fee')) : 25;
  const gemRate = getArg('--gem') ? Number(getArg('--gem')) : 0.5;
  const sellerFeeRate = getArg('--seller-fee') ? Number(getArg('--seller-fee')) : 0;
  const res = gradingExpectedValue({
    rawPrice,
    psa9Price,
    psa10Price,
    gradingFee,
    gemRate,
    sellerFeeRate,
  });
  console.log(JSON.stringify(res, null, 2));
}
