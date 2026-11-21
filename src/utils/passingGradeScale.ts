import { PassingGradeConfig, SkdCalculatorConfig } from '../types';

export interface SkdScaleTargets {
  maxTwk: number;
  maxTiu: number;
  maxTkp: number;
  maxSkdTotal: number;
  maxSkbCat: number;
  twkTotalQ: number;
  tiuTotalQ: number;
  tkpTotalQ: number;
  skbTotalQ: number;
  twkMinQ: number;
  tiuMinQ: number;
  tkpMinQ5: number;
  tkpAvgNeeded: string;
}

export function getSkdScaleTargets(
  pg: PassingGradeConfig,
  calcConfig?: Partial<SkdCalculatorConfig>
): SkdScaleTargets {
  const maxTwk = calcConfig?.max_twk ?? 150;
  const maxTiu = calcConfig?.max_tiu ?? 175;
  const maxTkp = calcConfig?.max_tkp ?? 225;
  const maxSkbCat = calcConfig?.max_skb_cat ?? 500;

  const twkTotalQ = Math.max(1, Math.round(maxTwk / 5));
  const tiuTotalQ = Math.max(1, Math.round(maxTiu / 5));
  const tkpTotalQ = Math.max(1, Math.round(maxTkp / 5));
  const skbTotalQ = Math.max(1, Math.round(maxSkbCat / 5));

  const twkMinQ = Math.min(twkTotalQ, Math.max(1, Math.ceil(pg.twk / 5)));
  const tiuMinQ = Math.min(tiuTotalQ, Math.max(1, Math.ceil(pg.tiu / 5)));
  const tkpMinQ5 = Math.min(tkpTotalQ, Math.max(1, Math.ceil(pg.tkp / 5)));
  const tkpAvgNeeded = (pg.tkp / tkpTotalQ).toFixed(1);

  return {
    maxTwk,
    maxTiu,
    maxTkp,
    maxSkdTotal: maxTwk + maxTiu + maxTkp,
    maxSkbCat,
    twkTotalQ,
    tiuTotalQ,
    tkpTotalQ,
    skbTotalQ,
    twkMinQ,
    tiuMinQ,
    tkpMinQ5,
    tkpAvgNeeded
  };
}

export interface CompactTargetRow {
  code: 'TWK' | 'TIU' | 'TKP';
  pgLabel: string;
  minQuestionLabel: string;
  colorClass: string;
}

export function getCompactTargetRowsForExam(
  totalQuestions: number,
  pg: PassingGradeConfig,
  category?: 'TWK' | 'TIU' | 'TKP',
  calcConfig?: Partial<SkdCalculatorConfig>
): CompactTargetRow[] {
  const scale = getSkdScaleTargets(pg, calcConfig);

  // Try Out SKD Lengkap 110 Soal (atau campuran multi-kategori)
  if (!category || totalQuestions >= 100) {
    return [
      {
        code: 'TWK',
        pgLabel: `PG ${pg.twk}/${scale.maxTwk}`,
        minQuestionLabel: `Min ${scale.twkMinQ}/${scale.twkTotalQ} benar`,
        colorClass: 'text-blue-700 bg-blue-50/80 border-blue-200'
      },
      {
        code: 'TIU',
        pgLabel: `PG ${pg.tiu}/${scale.maxTiu}`,
        minQuestionLabel: `Min ${scale.tiuMinQ}/${scale.tiuTotalQ} benar`,
        colorClass: 'text-sky-700 bg-sky-50/80 border-sky-200'
      },
      {
        code: 'TKP',
        pgLabel: `PG ${pg.tkp}/${scale.maxTkp}`,
        minQuestionLabel: `Min ${scale.tkpMinQ5}/${scale.tkpTotalQ} poin 5`,
        colorClass: 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
      }
    ];
  }

  // Single category (Latihan Harian 15 soal atau Tryout Kategori 30 soal)
  const maxScore = totalQuestions * 5;
  if (category === 'TWK') {
    const targetPg = totalQuestions <= 15 ? 25 : Math.min(maxScore, pg.twk);
    const minQ = Math.min(totalQuestions, Math.ceil(targetPg / 5));
    return [
      {
        code: 'TWK',
        pgLabel: `PG ${targetPg}/${maxScore}`,
        minQuestionLabel: `Min ${minQ}/${totalQuestions} benar`,
        colorClass: 'text-blue-700 bg-blue-50/80 border-blue-200'
      }
    ];
  }

  if (category === 'TIU') {
    const targetPg = totalQuestions <= 15 ? 25 : Math.min(maxScore, pg.tiu);
    const minQ = Math.min(totalQuestions, Math.ceil(targetPg / 5));
    return [
      {
        code: 'TIU',
        pgLabel: `PG ${targetPg}/${maxScore}`,
        minQuestionLabel: `Min ${minQ}/${totalQuestions} benar`,
        colorClass: 'text-sky-700 bg-sky-50/80 border-sky-200'
      }
    ];
  }

  const targetPg = totalQuestions <= 15 ? 50 : Math.min(maxScore, pg.tkp);
  const minQ5 = Math.min(totalQuestions, Math.ceil(targetPg / 5));
  return [
    {
      code: 'TKP',
      pgLabel: `PG ${targetPg}/${maxScore}`,
      minQuestionLabel: `Min ${minQ5}/${totalQuestions} poin 5`,
      colorClass: 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
    }
  ];
}
