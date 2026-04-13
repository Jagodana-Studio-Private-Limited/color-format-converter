import { ImageResponse } from "@vercel/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#ec4899";   // pink-500
const ACCENT = "#a855f7";  // purple-500

// Sample color swatches shown in OG image
const SWATCHES = [
  "#ec4899", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
];

// Sample format rows shown in OG image
const FORMAT_ROWS = [
  { label: "HEX",   value: "#EC4899" },
  { label: "RGB",   value: "rgb(236 72 153)" },
  { label: "HSL",   value: "hsl(330 81.2% 60.4%)" },
  { label: "OKLCH", value: "oklch(63.49% 0.2437 0.00°)" },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#09090b",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(236,72,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "4px",
            background: `linear-gradient(to right, ${BRAND}, ${ACCENT})`,
          }}
        />

        {/* Left glow */}
        <div
          style={{
            position: "absolute",
            top: "-60px", left: "-60px",
            width: "380px", height: "380px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND}20 0%, transparent 70%)`,
          }}
        />

        {/* Right glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px", right: "-40px",
            width: "340px", height: "340px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT}20 0%, transparent 70%)`,
          }}
        />

        {/* Main layout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
            padding: "56px 64px",
            gap: "52px",
            position: "relative",
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "420px",
              flexShrink: 0,
            }}
          >
            {/* Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "68px",
                height: "68px",
                borderRadius: "18px",
                background: `linear-gradient(135deg, ${BRAND}, ${ACCENT})`,
                fontSize: "36px",
                marginBottom: "28px",
              }}
            >
              🎨
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: "18px",
                background: `linear-gradient(135deg, #ffffff 40%, ${BRAND})`,
                backgroundClip: "text",
                color: "transparent",
                fontFamily: "sans-serif",
              }}
            >
              Color Format Converter
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "19px",
                color: "#71717a",
                lineHeight: 1.5,
                marginBottom: "32px",
                fontFamily: "sans-serif",
              }}
            >
              HEX · RGB · HSL · HWB · OKLCH · Named colors
            </div>

            {/* Swatch row */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
              {SWATCHES.map((color) => (
                <div
                  key={color}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: color,
                    border: "2px solid rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>

            {/* Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Real-time", "One-click copy", "100% In-Browser"].map((p) => (
                <div
                  key={p}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "999px",
                    border: `1px solid ${BRAND}44`,
                    background: `${BRAND}12`,
                    fontSize: "12px",
                    color: BRAND,
                    fontFamily: "sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — format output preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              gap: "12px",
            }}
          >
            {/* Input row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#ec4899",
                  flexShrink: 0,
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  color: "#a1a1aa",
                  fontFamily: "monospace",
                }}
              >
                #EC4899  —  any format accepted
              </div>
            </div>

            {/* Format rows */}
            {FORMAT_ROWS.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  padding: "13px 16px",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: BRAND,
                    width: "64px",
                    flexShrink: 0,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#d4d4d8",
                    fontFamily: "monospace",
                    flex: 1,
                  }}
                >
                  {row.value}
                </div>
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    background: "#27272a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  ⎘
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "26px",
            right: "64px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#3f3f46", fontFamily: "sans-serif" }}>
            Free tool by
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#52525b", fontFamily: "sans-serif" }}>
            jagodana.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
