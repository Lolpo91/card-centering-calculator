export interface AxisRatio {
  heavy: number;
  light: number;
  label: string;
}

export interface SideBorders {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SideCenteringSummary {
  leftRight: AxisRatio;
  topBottom: AxisRatio;
  worstHeavy: number;
  worstLabel: string;
}

export interface CenteringEvaluation {
  front: SideCenteringSummary;
  back: SideCenteringSummary | null;
  estimates: {
    psa: string;
    bgsCenteringSubgrade: number;
    cgc: string;
  };
}

export interface GradingEvParams {
  rawPrice: number;
  psa9Price: number;
  psa10Price: number;
  gradingFee?: number;
  gemRate?: number;
  sellerFeeRate?: number;
}

export interface GradingEvResult {
  netRaw: number;
  netPsa9: number;
  netPsa10: number;
  expectedProfitVsRaw: number;
  breakEvenGemRate: number | null;
  worthSubmittingAtGemRate: boolean;
}

export function formatRatio(heavyShare: number): string;
export function axisRatio(borderA: number, borderB: number): AxisRatio;
export function evaluateCentering(input: {
  front: SideBorders;
  back?: SideBorders | null;
}): CenteringEvaluation;
export function gradingExpectedValue(params: GradingEvParams): GradingEvResult;
