/**
 * @file routineData.ts
 * @description Dermatologist-recommended baseline routines for different skin types.
 * Based on AAD guidelines.
 */

export interface RoutineStep {
  id: number;
  title: string;
  done: boolean;
}

export interface SkinRoutine {
  day: RoutineStep[];
  night: RoutineStep[];
}

export const ROUTINES: Record<string, SkinRoutine> = {
  Oily: {
    day: [
      { id: 1, title: "Salicylic Acid Cleanser", done: false },
      { id: 2, title: "Niacinamide Serum", done: false },
      { id: 3, title: "Gel Moisturizer", done: false },
      { id: 4, title: "Matte Sunscreen (SPF 50)", done: false },
    ],
    night: [
      { id: 1, title: "Oil Cleanser", done: false },
      { id: 2, title: "Foaming Cleanser", done: false },
      { id: 3, title: "Retinol (0.5%)", done: false },
      { id: 4, title: "Lightweight Moisturizer", done: false },
    ]
  },
  Dry: {
    day: [
      { id: 1, title: "Hydrating Cream Cleanser", done: false },
      { id: 2, title: "Hyaluronic Acid Serum", done: false },
      { id: 3, title: "Rich Cream Moisturizer", done: false },
      { id: 4, title: "Hydrating Sunscreen (SPF 50)", done: false },
    ],
    night: [
      { id: 1, title: "Cleansing Balm", done: false },
      { id: 2, title: "Hydrating Cleanser", done: false },
      { id: 3, title: "Peptide / Ceramide Serum", done: false },
      { id: 4, title: "Heavy Night Cream / Sleep Mask", done: false },
    ]
  },
  Sensitive: {
    day: [
      { id: 1, title: "Ultra-Gentle Cleanser", done: false },
      { id: 2, title: "Centella Asiatica Serum", done: false },
      { id: 3, title: "Barrier Repair Cream", done: false },
      { id: 4, title: "Mineral Sunscreen (SPF 50)", done: false },
    ],
    night: [
      { id: 1, title: "Micellar Water", done: false },
      { id: 2, title: "Gentle Cleanser", done: false },
      { id: 3, title: "Azelaic Acid (if needed)", done: false },
      { id: 4, title: "Barrier Cream", done: false },
    ]
  },
  Combination: {
    day: [
      { id: 1, title: "Gentle Foaming Cleanser", done: false },
      { id: 2, title: "Vitamin C Serum", done: false },
      { id: 3, title: "Light Moisturizer", done: false },
      { id: 4, title: "Hybrid Sunscreen (SPF 50)", done: false },
    ],
    night: [
      { id: 1, title: "Double Cleanse", done: false },
      { id: 2, title: "BHA Liquid (T-Zone)", done: false },
      { id: 3, title: "Retinol (Cheeks/Forehead)", done: false },
      { id: 4, title: "Gel-Cream Moisturizer", done: false },
    ]
  },
  Normal: {
    day: [
      { id: 1, title: "Gentle Cleanser", done: false },
      { id: 2, title: "Vitamin C Serum", done: false },
      { id: 3, title: "Moisturizer", done: false },
      { id: 4, title: "Sunscreen (SPF 50)", done: false },
    ],
    night: [
      { id: 1, title: "Double Cleanse", done: false },
      { id: 2, title: "Retinol / Acid Treatment", done: false },
      { id: 3, title: "Night Cream", done: false },
    ]
  }
};
