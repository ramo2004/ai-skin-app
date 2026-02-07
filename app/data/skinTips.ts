/**
 * @file skinTips.ts
 * @description A collection of high-quality, dermatologically relevant skin health tips.
 */

export interface SkinTip {
  id: number;
  title: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
  color: string;
}

export const dailyTips: SkinTip[] = [
  {
    id: 1,
    title: "The 60-Second Rule",
    description: "Wash your face for a full 60 seconds to allow ingredients to actually penetrate and work.",
    icon: "timer-outline",
    color: "#4CAF50",
  },
  {
    id: 2,
    title: "Pillowcase Hygiene",
    description: "Change your pillowcase every 2-3 days. Bacteria and oil buildup can cause acne on your cheeks.",
    icon: "bed-outline",
    color: "#3F51B5",
  },
  {
    id: 3,
    title: "Double Cleansing",
    description: "Use an oil-based cleanser first to remove SPF and makeup, followed by a water-based cleanser.",
    icon: "water-plus-outline",
    color: "#2196F3",
  },
  {
    id: 4,
    title: "SPF is Non-Negotiable",
    description: "UV rays damage skin even on cloudy days. Apply sunscreen as the last step of your AM routine.",
    icon: "weather-sunny",
    color: "#FF9800",
  },
  {
    id: 5,
    title: "Hydration vs. Moisture",
    description: "Hydration adds water (think hyaluronic acid); moisture locks it in (think oils/creams). You need both.",
    icon: "water-outline",
    color: "#00BCD4",
  },
  {
    id: 6,
    title: "Don't Pop It!",
    description: "Popping pimples pushes bacteria deeper, increasing inflammation and the risk of scarring.",
    icon: "alert-circle-outline",
    color: "#F44336",
  },
  {
    id: 7,
    title: "Patch Test New Products",
    description: "Apply new products behind your ear or on your inner arm 24h before using them on your face.",
    icon: "flask-outline",
    color: "#9C27B0",
  },
  {
    id: 8,
    title: "Water Temperature Matters",
    description: "Wash with lukewarm water. Hot water strips natural oils, while cold water won't remove dirt effectively.",
    icon: "thermometer",
    color: "#607D8B",
  },
  {
    id: 9,
    title: "Smartphone Bacteria",
    description: "Your phone screen carries more bacteria than a toilet seat. Wipe it down daily with alcohol.",
    icon: "cellphone",
    color: "#795548",
  },
  {
    id: 10,
    title: "Exfoliate Wisely",
    description: "Over-exfoliating damages your moisture barrier. Limit specific acids/scrubs to 1-2 times per week.",
    icon: "leaf",
    color: "#8BC34A",
  },
  {
    id: 11,
    title: "Diet & Skin Connection",
    description: "High-glycemic foods (sugar, white bread) can trigger inflammation and acne spikes.",
    icon: "food-apple-outline",
    color: "#E91E63",
  },
  {
    id: 12,
    title: "Layering Order",
    description: "Apply products from thinnest to thickest consistency: Toner → Serum → Moisturizer → Oil.",
    icon: "layers-outline",
    color: "#673AB7",
  },
  {
    id: 13,
    title: "Vitamin C for Brightening",
    description: "Use Vitamin C in the morning to brighten dark spots and boost sun protection.",
    icon: "white-balance-sunny",
    color: "#FFC107",
  },
  {
    id: 14,
    title: "Retinol Rules",
    description: "Apply retinol at night on dry skin. It increases cell turnover but makes you sun-sensitive.",
    icon: "moon-waning-crescent",
    color: "#3F51B5",
  },
  {
    id: 15,
    title: "Barrier Repair",
    description: "If your skin stings, it's damaged. Stop actives and focus on ceramides and hydration.",
    icon: "shield-outline",
    color: "#FF5722",
  },
  {
    id: 16,
    title: "Hair Products & Acne",
    description: "Pomade or hair oil can cause 'pomade acne' on your forehead. Keep hair off your face while sleeping.",
    icon: "face-man-profile",
    color: "#795548",
  },
  {
    id: 17,
    title: "Stress Breakouts",
    description: "Stress releases cortisol, which increases oil production. Mindfulness can be skincare too.",
    icon: "meditation",
    color: "#009688",
  },
  {
    id: 18,
    title: "Sleep Lines",
    description: "Sleeping on your back prevents creases and unknowingly transferring bacteria to your face.",
    icon: "sleep",
    color: "#9E9E9E",
  },
  {
    id: 19,
    title: "Towel Hygiene",
    description: "Reuse body towels, but use a fresh, dedicated face towel (or paper towel) every single time.",
    icon: "tshirt-crew-outline",
    color: "#03A9F4",
  },
  {
    id: 20,
    title: "Neck & Chest",
    description: "Your skincare routine shouldn't stop at your jawline. Treat your neck and decolletage too.",
    icon: "human",
    color: "#E91E63",
  },
  {
    id: 21,
    title: "Consistent Routine",
    description: "It takes 28 days for skin cells to turnover. Give products at least 4-6 weeks to see results.",
    icon: "calendar-check",
    color: "#4CAF50",
  },
  {
    id: 22,
    title: "Green Tea Benefits",
    description: "Drinking green tea or using products with it can reduce sebum production and inflammation.",
    icon: "tea",
    color: "#8BC34A",
  },
  {
    id: 23,
    title: "Hands Off!",
    description: "Touching your face transfers dirt and bacteria. Train yourself to keep hands away.",
    icon: "hand-left",
    color: "#F44336",
  },
  {
    id: 24,
    title: "Hyaluronic Acid Tip",
    description: "Always apply Hyaluronic Acid to DAMP skin, or it might draw moisture OUT of your skin.",
    icon: "water-alert",
    color: "#2196F3",
  },
  {
    id: 25,
    title: "Listen to Your Skin",
    description: "Skin changes with seasons and hormones. Adjust your routine based on how it feels today.",
    icon: "ear-hearing",
    color: "#9C27B0",
  },
];
