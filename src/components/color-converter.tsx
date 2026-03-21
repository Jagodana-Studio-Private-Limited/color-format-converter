"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Pipette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─── Color Math ──────────────────────────────────────────────────────────────

interface RGBA {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function delinearize(c: number): number {
  const v = clamp(c);
  return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
}

function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // Linear RGB → LMS
  const lms_l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const lms_m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const lms_s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // Cube root
  const l_ = Math.cbrt(lms_l);
  const m_ = Math.cbrt(lms_m);
  const s_ = Math.cbrt(lms_s);

  // LMS → Lab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Lab → LCH
  const C = Math.sqrt(a * a + bv * bv);
  let H = (Math.atan2(bv, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklchToRgb(l: number, c: number, h: number): RGBA {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bv = c * Math.sin(hRad);

  // Lab → LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * bv;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bv;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * bv;

  // Cube
  const lms_l = l_ * l_ * l_;
  const lms_m = m_ * m_ * m_;
  const lms_s = s_ * s_ * s_;

  // LMS → Linear RGB
  const lr = 4.0767416621 * lms_l - 3.3077115913 * lms_m + 0.2309699292 * lms_s;
  const lg = -1.2684380046 * lms_l + 2.6097574011 * lms_m - 0.3413193965 * lms_s;
  const lb = -0.0041960863 * lms_l - 0.7034186147 * lms_m + 1.7076147010 * lms_s;

  return { r: delinearize(lr), g: delinearize(lg), b: delinearize(lb), a: 1 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r1: h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6; break;
    case g1: h = ((b1 - r1) / d + 2) / 6; break;
    default: h = ((r1 - g1) / d + 4) / 6; break;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGBA {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, a: 1 };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hNorm = h / 360;
  return {
    r: Math.round(hue2rgb(hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(hNorm) * 255),
    b: Math.round(hue2rgb(hNorm - 1 / 3) * 255),
    a: 1,
  };
}

function rgbToHwb(r: number, g: number, b: number): { h: number; w: number; bk: number } {
  const { h } = rgbToHsl(r, g, b);
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const w = Math.min(r1, g1, b1);
  const bk = 1 - Math.max(r1, g1, b1);
  return { h, w, bk };
}

function hwbToRgb(h: number, w: number, bk: number): RGBA {
  if (w + bk >= 1) {
    const gray = Math.round((w / (w + bk)) * 255);
    return { r: gray, g: gray, b: gray, a: 1 };
  }
  const { r, g, b } = hslToRgb(h, 1, 0.5);
  const factor = 1 - w - bk;
  return {
    r: Math.round(r * factor / 255 * 255 + w * 255),
    g: Math.round(g * factor / 255 * 255 + w * 255),
    b: Math.round(b * factor / 255 * 255 + w * 255),
    a: 1,
  };
}

// ─── Named CSS Colors ────────────────────────────────────────────────────────

const CSS_NAMED_COLORS: Record<string, string> = {
  aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff",
  aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc",
  bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd",
  blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a",
  burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00",
  chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff",
  darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00",
  darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f",
  darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493",
  deepskyblue: "#00bfff", dimgray: "#696969", dodgerblue: "#1e90ff",
  firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22",
  fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff",
  gold: "#ffd700", goldenrod: "#daa520", gray: "#808080",
  green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0",
  hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082",
  ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa",
  lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd",
  lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90",
  lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa", lightslategray: "#778899", lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32",
  linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000",
  mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3",
  mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585",
  midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080",
  oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23",
  orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6",
  palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee",
  palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9",
  peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd",
  powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399",
  red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1",
  saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460",
  seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d",
  silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd",
  slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f",
  steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080",
  thistle: "#d8bfd8", tomato: "#ff6347", transparent: "#00000000",
  turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3",
  white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00",
  yellowgreen: "#9acd32",
};

// ─── Parser ──────────────────────────────────────────────────────────────────

function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  // Named color
  if (CSS_NAMED_COLORS[s]) return parseColor(CSS_NAMED_COLORS[s]);

  // HEX
  const hexMatch = s.match(/^#?([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    const h = hexMatch[1];
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
        a: 1,
      };
    }
    if (h.length === 4) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
        a: parseInt(h[3] + h[3], 16) / 255,
      };
    }
    if (h.length === 6) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: 1,
      };
    }
    if (h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: parseInt(h.slice(6, 8), 16) / 255,
      };
    }
  }

  // rgb() / rgba()
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (rgbMatch) {
    const parseComponent = (v: string, max = 255) =>
      v.endsWith("%") ? (parseFloat(v) / 100) * max : parseFloat(v);
    return {
      r: Math.round(clamp(parseComponent(rgbMatch[1]), 0, 255)),
      g: Math.round(clamp(parseComponent(rgbMatch[2]), 0, 255)),
      b: Math.round(clamp(parseComponent(rgbMatch[3]), 0, 255)),
      a: rgbMatch[4]
        ? clamp(rgbMatch[4].endsWith("%") ? parseFloat(rgbMatch[4]) / 100 : parseFloat(rgbMatch[4]))
        : 1,
    };
  }

  // hsl() / hsla()
  const hslMatch = s.match(/^hsla?\(\s*([\d.]+(?:deg|rad|grad|turn)?)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (hslMatch) {
    let h = parseFloat(hslMatch[1]);
    if (hslMatch[1].endsWith("rad")) h = (h * 180) / Math.PI;
    else if (hslMatch[1].endsWith("grad")) h = h * 0.9;
    else if (hslMatch[1].endsWith("turn")) h = h * 360;
    h = ((h % 360) + 360) % 360;
    const s = clamp(parseFloat(hslMatch[2]) / 100);
    const l = clamp(parseFloat(hslMatch[3]) / 100);
    const alpha = hslMatch[4]
      ? clamp(hslMatch[4].endsWith("%") ? parseFloat(hslMatch[4]) / 100 : parseFloat(hslMatch[4]))
      : 1;
    const rgba = hslToRgb(h, s, l);
    return { ...rgba, a: alpha };
  }

  // hwb()
  const hwbMatch = s.match(/^hwb\(\s*([\d.]+(?:deg|rad|grad|turn)?)\s+\s*([\d.]+)%\s+\s*([\d.]+)%(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
  if (hwbMatch) {
    let h = parseFloat(hwbMatch[1]);
    if (hwbMatch[1].endsWith("rad")) h = (h * 180) / Math.PI;
    else if (hwbMatch[1].endsWith("grad")) h = h * 0.9;
    else if (hwbMatch[1].endsWith("turn")) h = h * 360;
    h = ((h % 360) + 360) % 360;
    const w = clamp(parseFloat(hwbMatch[2]) / 100);
    const bk = clamp(parseFloat(hwbMatch[3]) / 100);
    const alpha = hwbMatch[4]
      ? clamp(hwbMatch[4].endsWith("%") ? parseFloat(hwbMatch[4]) / 100 : parseFloat(hwbMatch[4]))
      : 1;
    const rgba = hwbToRgb(h, w, bk);
    return { ...rgba, a: alpha };
  }

  // oklch()
  const oklchMatch = s.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+(?:none)?)\s+([\d.]+(?:deg|rad|grad|turn)?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
  if (oklchMatch) {
    const lRaw = oklchMatch[1];
    const l = lRaw.endsWith("%") ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
    const c = parseFloat(oklchMatch[2]);
    let h = parseFloat(oklchMatch[3]);
    if (oklchMatch[3].endsWith("rad")) h = (h * 180) / Math.PI;
    else if (oklchMatch[3].endsWith("grad")) h = h * 0.9;
    else if (oklchMatch[3].endsWith("turn")) h = h * 360;
    h = ((h % 360) + 360) % 360;
    const alpha = oklchMatch[4]
      ? clamp(oklchMatch[4].endsWith("%") ? parseFloat(oklchMatch[4]) / 100 : parseFloat(oklchMatch[4]))
      : 1;
    const rgba = oklchToRgb(l, c, h);
    return { ...rgba, a: alpha };
  }

  return null;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function toHex(c: RGBA): string {
  const r = c.r.toString(16).padStart(2, "0");
  const g = c.g.toString(16).padStart(2, "0");
  const b = c.b.toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toUpperCase();
}

function toHexA(c: RGBA): string {
  if (c.a >= 1) return toHex(c);
  const r = c.r.toString(16).padStart(2, "0");
  const g = c.g.toString(16).padStart(2, "0");
  const b = c.b.toString(16).padStart(2, "0");
  const a = Math.round(c.a * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}${a}`.toUpperCase();
}

function toRgb(c: RGBA): string {
  return `rgb(${c.r} ${c.g} ${c.b})`;
}

function toRgba(c: RGBA): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${+c.a.toFixed(3)})`;
}

function toHsl(c: RGBA): string {
  const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
  return `hsl(${Math.round(h)} ${+(s * 100).toFixed(1)}% ${+(l * 100).toFixed(1)}%)`;
}

function toHsla(c: RGBA): string {
  const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
  return `hsla(${Math.round(h)}, ${+(s * 100).toFixed(1)}%, ${+(l * 100).toFixed(1)}%, ${+c.a.toFixed(3)})`;
}

function toHwb(c: RGBA): string {
  const { h, w, bk } = rgbToHwb(c.r, c.g, c.b);
  return `hwb(${Math.round(h)} ${+(w * 100).toFixed(1)}% ${+(bk * 100).toFixed(1)}%)`;
}

function toOklch(c: RGBA): string {
  const { l, c: ch, h } = rgbToOklch(c.r, c.g, c.b);
  return `oklch(${+(l * 100).toFixed(2)}% ${+ch.toFixed(4)} ${+h.toFixed(2)})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface FormatResult {
  label: string;
  value: string;
  description: string;
}

function getFormats(color: RGBA): FormatResult[] {
  return [
    { label: "HEX", value: toHex(color), description: "Hexadecimal" },
    { label: "HEX (with alpha)", value: toHexA(color), description: "8-digit HEX" },
    { label: "RGB", value: toRgb(color), description: "Red Green Blue" },
    { label: "RGBA", value: toRgba(color), description: "RGB with Alpha" },
    { label: "HSL", value: toHsl(color), description: "Hue Saturation Lightness" },
    { label: "HSLA", value: toHsla(color), description: "HSL with Alpha" },
    { label: "HWB", value: toHwb(color), description: "Hue Whiteness Blackness" },
    { label: "OKLCH", value: toOklch(color), description: "Perceptual LCH" },
  ];
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${value}`}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

const DEFAULT_COLOR = "#ec4899";

export function ColorConverter() {
  const [inputValue, setInputValue] = useState(DEFAULT_COLOR);
  const [pickerValue, setPickerValue] = useState(DEFAULT_COLOR);
  const pickerRef = useRef<HTMLInputElement>(null);

  const parsed = parseColor(inputValue);

  // Compute preview hex for <input type="color"> — must be a valid 6-digit hex
  const previewHex = parsed ? toHex(parsed) : "#cccccc";

  const formats = parsed ? getFormats(parsed) : [];

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const p = parseColor(e.target.value);
    if (p) setPickerValue(toHex(p));
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setPickerValue(hex);
    setInputValue(hex.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Input row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Color picker swatch */}
        <div className="relative flex-shrink-0">
          <input
            ref={pickerRef}
            type="color"
            value={pickerValue}
            onChange={handlePickerChange}
            className="sr-only"
            aria-label="Color picker"
          />
          <button
            onClick={() => pickerRef.current?.click()}
            aria-label="Open color picker"
            className="h-12 w-12 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: previewHex }}
          >
            <span className="sr-only">
              <Pipette className="h-4 w-4" />
            </span>
          </button>
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleTextChange}
            placeholder="Enter a color: #ec4899, rgb(255,0,128), hsl(330 100% 60%)…"
            spellCheck={false}
            className={[
              "w-full h-12 px-4 rounded-xl border bg-background font-mono text-sm",
              "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand",
              "transition-colors placeholder:text-muted-foreground/50",
              parsed === null && inputValue.trim()
                ? "border-destructive text-destructive"
                : "border-border",
            ].join(" ")}
          />
          {parsed === null && inputValue.trim() && (
            <p className="absolute -bottom-5 left-1 text-xs text-destructive">
              Invalid color value
            </p>
          )}
        </div>
      </motion.div>

      {/* Color preview swatch */}
      {parsed && (
        <motion.div
          key={previewHex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="h-20 rounded-2xl border border-border/50 shadow-sm overflow-hidden"
          style={{ backgroundColor: `rgba(${parsed.r},${parsed.g},${parsed.b},${parsed.a})` }}
          aria-label={`Color preview: ${inputValue}`}
        />
      )}

      {/* Format cards */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {formats.map((fmt, i) => (
            <motion.div
              key={fmt.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              {/* Color dot */}
              <div
                className="h-7 w-7 rounded-lg flex-shrink-0 border border-border/30 shadow-sm"
                style={{ backgroundColor: previewHex }}
              />

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand uppercase tracking-wider leading-none mb-1">
                  {fmt.label}
                </p>
                <p className="font-mono text-sm truncate text-foreground">
                  {fmt.value}
                </p>
              </div>

              {/* Copy button */}
              <CopyButton value={fmt.value} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!parsed && !inputValue.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border/60 bg-muted/10 py-14 text-center"
        >
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-muted-foreground text-sm">
            Enter a color above or click the swatch to pick one
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Supports HEX, RGB, RGBA, HSL, HSLA, HWB, OKLCH, and named colors
          </p>
        </motion.div>
      )}

      {/* Copy all button */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const all = formats.map((f) => `${f.label}: ${f.value}`).join("\n");
              try {
                await navigator.clipboard.writeText(all);
                toast.success("All formats copied!");
              } catch {
                toast.error("Failed to copy");
              }
            }}
            className="gap-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy all formats
          </Button>
        </motion.div>
      )}
    </div>
  );
}
