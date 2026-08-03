// パレットのプリセット値（条件入力・求めたいもの入力の両方で共通利用）

export const LENGTH_PRESETS: { label: string; value: string }[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '10', value: '10' },
  { label: '√2', value: '√2' },
  { label: '√3', value: '√3' },
  { label: '1/2', value: '1/2' },
];

export const ANGLE_PRESETS: { label: string; value: string }[] = [
  { label: '15°', value: '15' },
  { label: '20°', value: '20' },
  { label: '30°', value: '30' },
  { label: '45°', value: '45' },
  { label: '50°', value: '50' },
  { label: '60°', value: '60' },
  { label: '75°', value: '75' },
  { label: '90°', value: '90' },
  { label: '100°', value: '100' },
  { label: '120°', value: '120' },
  { label: '135°', value: '135' },
  { label: '150°', value: '150' },
];

export const RATIO_PRESETS: { label: string; value: [number, number] }[] = [
  { label: '1:1', value: [1, 1] },
  { label: '1:2', value: [1, 2] },
  { label: '2:1', value: [2, 1] },
  { label: '1:3', value: [1, 3] },
  { label: '2:3', value: [2, 3] },
  { label: '3:1', value: [3, 1] },
];
