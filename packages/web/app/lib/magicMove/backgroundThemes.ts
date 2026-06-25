/**
 * Background gradient themes for wrapping the code card in a visually
 * appealing gradient (similar to ray.so).  Definitions are canvas-native
 * so they work identically in preview and video export.
 */

// ---------- types ----------

export type GradientStop = { offset: number; color: string };

export type LinearLayer = {
  /** Normalised coordinates (0-1) resolved against the full canvas size. */
  type: "linear";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stops: GradientStop[];
};

export type RadialLayer = {
  type: "radial";
  /** Centre x (0-1, normalised against canvas width). */
  cx: number;
  /** Centre y (0-1, normalised against canvas height). */
  cy: number;
  /** Inner radius (0-1, normalised against Math.min(width, height)). */
  r0: number;
  /** Outer radius (0-1, normalised against Math.min(width, height)). */
  r1: number;
  stops: GradientStop[];
};

export type GradientLayer = LinearLayer | RadialLayer;

export type BackgroundTheme = {
  id: string;
  name: string;
  /** Colour shown in the Combobox swatch (first dominant colour). */
  previewColor: string;
  /** Optional grouping key for the combobox (e.g. "org"). Defaults to "gradient". */
  group?: string;
  layers: GradientLayer[];
};

export type BackgroundLayerCanvasOptions = {
  theme: BackgroundTheme;
  width: number;
  height: number;
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  cornerRadius: number;
};

export type BackgroundLayerCacheKeyOptions = Omit<BackgroundLayerCanvasOptions, "theme"> & {
  themeId: string;
};

// ---------- presets ----------

const THEMES: BackgroundTheme[] = [
  // ── Dark / neutral themes ──────────────────────────────────────────
  {
    id: "charcoal",
    name: "Charcoal",
    previewColor: "#1c1c1e",
    layers: [
      // Base: dark diagonal
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#111113" },
          { offset: 0.5, color: "#1c1c1e" },
          { offset: 1, color: "#111113" },
        ],
      },
      // Cool blue accent from top-left
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.6, y1: 0.8,
        stops: [
          { offset: 0, color: "rgba(99, 102, 241, 0.15)" },
          { offset: 1, color: "rgba(99, 102, 241, 0)" },
        ],
      },
      // Warm highlight from bottom-right
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.3, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(251, 146, 60, 0.08)" },
          { offset: 1, color: "rgba(251, 146, 60, 0)" },
        ],
      },
    ],
  },
  {
    id: "espresso",
    name: "Espresso",
    previewColor: "#2c1810",
    layers: [
      // Base: rich brown diagonal
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#1a0a04" },
          { offset: 0.4, color: "#3d1e0e" },
          { offset: 1, color: "#1a0e08" },
        ],
      },
      // Warm amber glow from top
      {
        type: "linear",
        x0: 0.3, y0: 0, x1: 0.7, y1: 0.8,
        stops: [
          { offset: 0, color: "rgba(217, 119, 6, 0.2)" },
          { offset: 0.6, color: "rgba(180, 83, 9, 0.08)" },
          { offset: 1, color: "rgba(180, 83, 9, 0)" },
        ],
      },
      // Deep crimson from bottom-left
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.8, y1: 0,
        stops: [
          { offset: 0, color: "rgba(153, 27, 27, 0.15)" },
          { offset: 1, color: "rgba(153, 27, 27, 0)" },
        ],
      },
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    previewColor: "#0b0b0f",
    layers: [
      // Base: near-black with subtle blue
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#05050a" },
          { offset: 0.5, color: "#0e0e18" },
          { offset: 1, color: "#050508" },
        ],
      },
      // Violet sheen from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.1, y1: 0.9,
        stops: [
          { offset: 0, color: "rgba(139, 92, 246, 0.12)" },
          { offset: 0.5, color: "rgba(99, 102, 241, 0.06)" },
          { offset: 1, color: "rgba(99, 102, 241, 0)" },
        ],
      },
      // Teal edge from bottom-left
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.7, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(20, 184, 166, 0.08)" },
          { offset: 1, color: "rgba(20, 184, 166, 0)" },
        ],
      },
    ],
  },
  {
    id: "walnut",
    name: "Walnut",
    previewColor: "#3b2a1a",
    layers: [
      // Base: warm brown
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.8, y1: 1,
        stops: [
          { offset: 0, color: "#1a0f06" },
          { offset: 0.5, color: "#3b2a1a" },
          { offset: 1, color: "#1e1408" },
        ],
      },
      // Golden highlight from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.2, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(234, 179, 8, 0.15)" },
          { offset: 0.5, color: "rgba(202, 138, 4, 0.06)" },
          { offset: 1, color: "rgba(202, 138, 4, 0)" },
        ],
      },
      // Deep red warmth from bottom
      {
        type: "linear",
        x0: 0.5, y0: 1, x1: 0.5, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(127, 29, 29, 0.12)" },
          { offset: 1, color: "rgba(127, 29, 29, 0)" },
        ],
      },
    ],
  },
  {
    id: "graphite",
    name: "Graphite",
    previewColor: "#2d2d30",
    layers: [
      // Base: vertical dark grey
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0, y1: 1,
        stops: [
          { offset: 0, color: "#3a3a3d" },
          { offset: 0.5, color: "#28282b" },
          { offset: 1, color: "#161618" },
        ],
      },
      // Steel blue sheen from left
      {
        type: "linear",
        x0: 0, y0: 0.3, x1: 0.8, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(148, 163, 184, 0.1)" },
          { offset: 1, color: "rgba(148, 163, 184, 0)" },
        ],
      },
      // Subtle warm corner from bottom-right
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.3, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(217, 119, 6, 0.06)" },
          { offset: 1, color: "rgba(217, 119, 6, 0)" },
        ],
      },
    ],
  },
  {
    id: "ash",
    name: "Ash",
    previewColor: "#3c3836",
    layers: [
      // Base: warm grey
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#2a2725" },
          { offset: 0.4, color: "#3c3836" },
          { offset: 1, color: "#201e1c" },
        ],
      },
      // Rose tint from top
      {
        type: "linear",
        x0: 0.5, y0: 0, x1: 0.5, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(244, 114, 182, 0.08)" },
          { offset: 1, color: "rgba(244, 114, 182, 0)" },
        ],
      },
      // Sage green from bottom-left
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.7, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(163, 230, 53, 0.06)" },
          { offset: 1, color: "rgba(163, 230, 53, 0)" },
        ],
      },
    ],
  },
  {
    id: "mono",
    name: "Mono",
    previewColor: "#6b7280",
    layers: [
      // Base: vertical grey
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0, y1: 1,
        stops: [
          { offset: 0, color: "#404450" },
          { offset: 1, color: "#0c0e14" },
        ],
      },
      // Cool blue wash from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0, y1: 1,
        stops: [
          { offset: 0, color: "rgba(96, 165, 250, 0.08)" },
          { offset: 1, color: "rgba(96, 165, 250, 0)" },
        ],
      },
    ],
  },
  // ── Vibrant themes ─────────────────────────────────────────────────
  {
    id: "sunset",
    name: "Sunset",
    previewColor: "#f97316",
    layers: [
      // Base: warm to cool diagonal
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#f97316" },
          { offset: 0.35, color: "#ef4444" },
          { offset: 0.65, color: "#ec4899" },
          { offset: 1, color: "#8b5cf6" },
        ],
      },
      // Bright highlight from top-left
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.5, y1: 0.5,
        stops: [
          { offset: 0, color: "rgba(253, 224, 71, 0.3)" },
          { offset: 1, color: "rgba(253, 224, 71, 0)" },
        ],
      },
    ],
  },
  {
    id: "midnight",
    name: "Midnight",
    previewColor: "#1e3a5f",
    layers: [
      // Base: deep navy
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0c1222" },
          { offset: 0.4, color: "#1e3a5f" },
          { offset: 1, color: "#1e1b4b" },
        ],
      },
      // Aurora teal from top
      {
        type: "linear",
        x0: 0.3, y0: 0, x1: 0.7, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(56, 189, 248, 0.15)" },
          { offset: 1, color: "rgba(56, 189, 248, 0)" },
        ],
      },
      // Purple glow from bottom-right
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.2, y1: 0.4,
        stops: [
          { offset: 0, color: "rgba(139, 92, 246, 0.2)" },
          { offset: 1, color: "rgba(139, 92, 246, 0)" },
        ],
      },
    ],
  },
  {
    id: "forest",
    name: "Forest",
    previewColor: "#16a34a",
    layers: [
      // Base: deep green to lime
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#052e16" },
          { offset: 0.4, color: "#15803d" },
          { offset: 0.7, color: "#16a34a" },
          { offset: 1, color: "#65a30d" },
        ],
      },
      // Lime highlight from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.2, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(163, 230, 53, 0.25)" },
          { offset: 1, color: "rgba(163, 230, 53, 0)" },
        ],
      },
      // Teal depth from bottom-left
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.6, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(13, 148, 136, 0.2)" },
          { offset: 1, color: "rgba(13, 148, 136, 0)" },
        ],
      },
    ],
  },
  {
    id: "sand",
    name: "Sand",
    previewColor: "#d4a574",
    layers: [
      // Base: warm sand
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#fef3c7" },
          { offset: 0.35, color: "#e8c088" },
          { offset: 0.65, color: "#d4a574" },
          { offset: 1, color: "#78350f" },
        ],
      },
      // Peach warmth from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0, y1: 1,
        stops: [
          { offset: 0, color: "rgba(251, 146, 60, 0.2)" },
          { offset: 1, color: "rgba(251, 146, 60, 0)" },
        ],
      },
    ],
  },
  {
    id: "breeze",
    name: "Breeze",
    previewColor: "#38bdf8",
    layers: [
      // Base: sky blue sweep
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#e0f2fe" },
          { offset: 0.35, color: "#7dd3fc" },
          { offset: 0.65, color: "#38bdf8" },
          { offset: 1, color: "#0369a1" },
        ],
      },
      // Cyan accent from top
      {
        type: "linear",
        x0: 0.5, y0: 0, x1: 0.5, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(34, 211, 238, 0.2)" },
          { offset: 1, color: "rgba(34, 211, 238, 0)" },
        ],
      },
    ],
  },
  {
    id: "candy",
    name: "Candy",
    previewColor: "#f472b6",
    layers: [
      // Base: pink → purple → blue
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#fb7185" },
          { offset: 0.3, color: "#f472b6" },
          { offset: 0.6, color: "#c084fc" },
          { offset: 1, color: "#60a5fa" },
        ],
      },
      // White highlight from top-left
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.5, y1: 0.5,
        stops: [
          { offset: 0, color: "rgba(255, 255, 255, 0.2)" },
          { offset: 1, color: "rgba(255, 255, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "crimson",
    name: "Crimson",
    previewColor: "#dc2626",
    layers: [
      // Base: dark red to orange
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#450a0a" },
          { offset: 0.3, color: "#991b1b" },
          { offset: 0.6, color: "#dc2626" },
          { offset: 1, color: "#ea580c" },
        ],
      },
      // Hot white-orange from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.3, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(251, 146, 60, 0.3)" },
          { offset: 1, color: "rgba(251, 146, 60, 0)" },
        ],
      },
      // Deep purple from bottom-left
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.6, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(88, 28, 135, 0.2)" },
          { offset: 1, color: "rgba(88, 28, 135, 0)" },
        ],
      },
    ],
  },
  {
    id: "falcon",
    name: "Falcon",
    previewColor: "#6366f1",
    layers: [
      // Base: deep indigo to violet
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#1e1b4b" },
          { offset: 0.35, color: "#4338ca" },
          { offset: 0.65, color: "#6366f1" },
          { offset: 1, color: "#a78bfa" },
        ],
      },
      // Pink glow from bottom
      {
        type: "linear",
        x0: 0.5, y0: 1, x1: 0.5, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(236, 72, 153, 0.2)" },
          { offset: 1, color: "rgba(236, 72, 153, 0)" },
        ],
      },
      // Cyan shimmer from top-right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.2, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(34, 211, 238, 0.12)" },
          { offset: 1, color: "rgba(34, 211, 238, 0)" },
        ],
      },
    ],
  },
  {
    id: "meadow",
    name: "Meadow",
    previewColor: "#34d399",
    layers: [
      // Base: yellow → green → cyan
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#fde68a" },
          { offset: 0.3, color: "#6ee7b7" },
          { offset: 0.6, color: "#34d399" },
          { offset: 1, color: "#0891b2" },
        ],
      },
      // Warm highlight from top-left
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.6, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(253, 224, 71, 0.25)" },
          { offset: 1, color: "rgba(253, 224, 71, 0)" },
        ],
      },
    ],
  },
  {
    id: "raindrop",
    name: "Raindrop",
    previewColor: "#818cf8",
    layers: [
      // Base: soft indigo
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#e0e7ff" },
          { offset: 0.35, color: "#a5b4fc" },
          { offset: 0.65, color: "#818cf8" },
          { offset: 1, color: "#3730a3" },
        ],
      },
      // Lavender bloom from top
      {
        type: "linear",
        x0: 0.5, y0: 0, x1: 0.5, y1: 0.5,
        stops: [
          { offset: 0, color: "rgba(196, 181, 253, 0.3)" },
          { offset: 1, color: "rgba(196, 181, 253, 0)" },
        ],
      },
    ],
  },
  // ── Org themes ───────────────────────────────────────────────────
  {
    id: "openai-1",
    name: "OpenAI - 1",
    previewColor: "#e8b84c",
    group: "org",
    layers: [
      // Base: warm gold to sky blue horizontal sweep
      {
        type: "linear",
        x0: 0, y0: 0.5, x1: 1, y1: 0.5,
        stops: [
          { offset: 0, color: "#d9a030" },
          { offset: 0.35, color: "#e8c86c" },
          { offset: 0.5, color: "#f0c0d0" },
          { offset: 0.75, color: "#a8c8e8" },
          { offset: 1, color: "#8cb8e0" },
        ],
      },
      // Yellow-gold radial blob top-left
      {
        type: "radial",
        cx: 0.2, cy: 0.3, r0: 0, r1: 0.7,
        stops: [
          { offset: 0, color: "rgba(230, 170, 40, 0.55)" },
          { offset: 0.5, color: "rgba(230, 180, 60, 0.2)" },
          { offset: 1, color: "rgba(230, 180, 60, 0)" },
        ],
      },
      // Pink radial blob in center-bottom
      {
        type: "radial",
        cx: 0.45, cy: 0.65, r0: 0, r1: 0.6,
        stops: [
          { offset: 0, color: "rgba(245, 160, 190, 0.45)" },
          { offset: 0.4, color: "rgba(240, 170, 200, 0.25)" },
          { offset: 1, color: "rgba(240, 170, 200, 0)" },
        ],
      },
      // Pink linear wash from bottom
      {
        type: "linear",
        x0: 0.3, y0: 1, x1: 0.6, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(240, 150, 180, 0.3)" },
          { offset: 0.5, color: "rgba(230, 170, 200, 0.15)" },
          { offset: 1, color: "rgba(230, 170, 200, 0)" },
        ],
      },
      // Light blue wash from right
      {
        type: "linear",
        x0: 1, y0: 0, x1: 0.4, y1: 0.8,
        stops: [
          { offset: 0, color: "rgba(140, 190, 240, 0.35)" },
          { offset: 1, color: "rgba(140, 190, 240, 0)" },
        ],
      },
    ],
  },
  {
    id: "openai-2",
    name: "OpenAI - 2",
    previewColor: "#c4b8e8",
    group: "org",
    layers: [
      // Base: light lavender/periwinkle
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#d0c8f0" },
          { offset: 0.5, color: "#c8c0e8" },
          { offset: 1, color: "#d8d0f0" },
        ],
      },
      // Large orange-peach radial blob bottom-left
      {
        type: "radial",
        cx: 0.2, cy: 0.75, r0: 0, r1: 0.9,
        stops: [
          { offset: 0, color: "rgba(255, 140, 50, 0.85)" },
          { offset: 0.25, color: "rgba(252, 130, 60, 0.7)" },
          { offset: 0.5, color: "rgba(248, 140, 90, 0.45)" },
          { offset: 0.75, color: "rgba(240, 150, 130, 0.15)" },
          { offset: 1, color: "rgba(240, 150, 130, 0)" },
        ],
      },
      // Large orange-salmon radial blob bottom-right
      {
        type: "radial",
        cx: 0.8, cy: 0.8, r0: 0, r1: 0.85,
        stops: [
          { offset: 0, color: "rgba(255, 150, 60, 0.8)" },
          { offset: 0.3, color: "rgba(250, 140, 80, 0.6)" },
          { offset: 0.6, color: "rgba(245, 140, 100, 0.25)" },
          { offset: 1, color: "rgba(245, 140, 100, 0)" },
        ],
      },
      // Warm peach wash across lower half
      {
        type: "radial",
        cx: 0.5, cy: 0.7, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(250, 160, 120, 0.5)" },
          { offset: 0.5, color: "rgba(245, 170, 150, 0.2)" },
          { offset: 1, color: "rgba(245, 170, 160, 0)" },
        ],
      },
    ],
  },
  {
    id: "openai-3",
    name: "OpenAI - 3",
    previewColor: "#3020c0",
    group: "org",
    layers: [
      // Base: deep blue-indigo (shifted away from red-purple)
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#1a1090" },
          { offset: 0.4, color: "#2218a8" },
          { offset: 0.7, color: "#2a20b8" },
          { offset: 1, color: "#1810a0" },
        ],
      },
      // Large radial light source from top-left (bright near-white)
      {
        type: "radial",
        cx: 0.15, cy: 0.1, r0: 0, r1: 1.0,
        stops: [
          { offset: 0, color: "rgba(220, 230, 255, 0.7)" },
          { offset: 0.2, color: "rgba(200, 215, 255, 0.5)" },
          { offset: 0.45, color: "rgba(160, 180, 255, 0.25)" },
          { offset: 0.7, color: "rgba(120, 140, 240, 0.08)" },
          { offset: 1, color: "rgba(120, 140, 240, 0)" },
        ],
      },
      // Strong diagonal light sweep from top-left to center
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.65, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(210, 220, 255, 0.6)" },
          { offset: 0.3, color: "rgba(180, 200, 255, 0.4)" },
          { offset: 0.6, color: "rgba(140, 160, 250, 0.15)" },
          { offset: 1, color: "rgba(140, 160, 250, 0)" },
        ],
      },
      // Secondary light ray — slightly offset for width
      {
        type: "linear",
        x0: 0.05, y0: 0, x1: 0.75, y1: 0.55,
        stops: [
          { offset: 0, color: "rgba(200, 215, 255, 0.45)" },
          { offset: 0.35, color: "rgba(170, 190, 255, 0.25)" },
          { offset: 0.7, color: "rgba(130, 150, 240, 0.08)" },
          { offset: 1, color: "rgba(130, 150, 240, 0)" },
        ],
      },
      // Dark bottom-right for contrast
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.3, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(10, 5, 60, 0.5)" },
          { offset: 0.5, color: "rgba(15, 10, 70, 0.2)" },
          { offset: 1, color: "rgba(15, 10, 70, 0)" },
        ],
      },
    ],
  },
  {
    id: "openai-4",
    name: "OpenAI - 4",
    previewColor: "#e89030",
    group: "org",
    layers: [
      // Base: warm amber to orange diagonal
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#d88828" },
          { offset: 0.3, color: "#e09030" },
          { offset: 0.6, color: "#d88040" },
          { offset: 1, color: "#c87838" },
        ],
      },
      // Golden highlight from top-left
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.7, y1: 0.8,
        stops: [
          { offset: 0, color: "rgba(240, 180, 80, 0.35)" },
          { offset: 0.5, color: "rgba(230, 160, 60, 0.15)" },
          { offset: 1, color: "rgba(230, 160, 60, 0)" },
        ],
      },
      // Subtle warm-light patch from right
      {
        type: "linear",
        x0: 1, y0: 0.3, x1: 0.3, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(250, 200, 120, 0.25)" },
          { offset: 1, color: "rgba(250, 200, 120, 0)" },
        ],
      },
    ],
  },
  {
    id: "anthropic-1",
    name: "Anthropic-1",
    previewColor: "#D4A27F",
    group: "org",
    layers: [
      // Base: keep the palette anchored tightly around the brand tone.
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#ddb08f" },
          { offset: 0.32, color: "#D4A27F" },
          { offset: 0.7, color: "#cf9b78" },
          { offset: 1, color: "#c89270" },
        ],
      },
      // Very soft lift for dimension without pulling away from the core hue.
      {
        type: "radial",
        cx: 0.24, cy: 0.2, r0: 0, r1: 0.62,
        stops: [
          { offset: 0, color: "rgba(237, 197, 166, 0.22)" },
          { offset: 0.42, color: "rgba(237, 197, 166, 0.08)" },
          { offset: 1, color: "rgba(237, 197, 166, 0)" },
        ],
      },
      // Broad center wash to keep the full canvas reading as Claude's tan.
      {
        type: "radial",
        cx: 0.54, cy: 0.5, r0: 0, r1: 0.88,
        stops: [
          { offset: 0, color: "rgba(212, 162, 127, 0.28)" },
          { offset: 0.48, color: "rgba(212, 162, 127, 0.12)" },
          { offset: 1, color: "rgba(212, 162, 127, 0)" },
        ],
      },
      // A restrained shadow pass preserves contrast behind light code cards.
      {
        type: "linear",
        x0: 1, y0: 0.24, x1: 0.22, y1: 0.86,
        stops: [
          { offset: 0, color: "rgba(116, 81, 63, 0.16)" },
          { offset: 0.5, color: "rgba(116, 81, 63, 0.06)" },
          { offset: 1, color: "rgba(116, 81, 63, 0)" },
        ],
      },
    ],
  },

  // ── Company / brand themes ───────────────────────────────────────────
  {
    id: "cloudflare",
    name: "Cloudflare",
    previewColor: "#f6821f",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#f6821f" },
          { offset: 0.5, color: "#f38020" },
          { offset: 1, color: "#faad3f" },
        ],
      },
      {
        type: "radial",
        cx: 0.2, cy: 0.2, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(255, 209, 128, 0.5)" },
          { offset: 1, color: "rgba(255, 209, 128, 0)" },
        ],
      },
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.3, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(180, 70, 10, 0.35)" },
          { offset: 1, color: "rgba(180, 70, 10, 0)" },
        ],
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    previewColor: "#0a0a0a",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0, y1: 1,
        stops: [
          { offset: 0, color: "#1a1a1a" },
          { offset: 1, color: "#000000" },
        ],
      },
      {
        type: "radial",
        cx: 0.5, cy: 0, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(255, 255, 255, 0.22)" },
          { offset: 0.6, color: "rgba(255, 255, 255, 0.04)" },
          { offset: 1, color: "rgba(255, 255, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "resend",
    name: "Resend",
    previewColor: "#0e0e10",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#101012" },
          { offset: 0.5, color: "#161618" },
          { offset: 1, color: "#0b0b0d" },
        ],
      },
      {
        type: "radial",
        cx: 0.5, cy: 0.4, r0: 0, r1: 0.7,
        stops: [
          { offset: 0, color: "rgba(255, 255, 255, 0.12)" },
          { offset: 1, color: "rgba(255, 255, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "raycast",
    name: "Raycast",
    previewColor: "#ff6363",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#1a0d12" },
          { offset: 0.5, color: "#2a0f17" },
          { offset: 1, color: "#0f0a0c" },
        ],
      },
      {
        type: "radial",
        cx: 0.7, cy: 0.25, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(255, 99, 99, 0.4)" },
          { offset: 0.5, color: "rgba(255, 99, 99, 0.12)" },
          { offset: 1, color: "rgba(255, 99, 99, 0)" },
        ],
      },
      {
        type: "linear",
        x0: 0, y0: 1, x1: 0.6, y1: 0.2,
        stops: [
          { offset: 0, color: "rgba(255, 140, 90, 0.16)" },
          { offset: 1, color: "rgba(255, 140, 90, 0)" },
        ],
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    previewColor: "#3ecf8e",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0b1a13" },
          { offset: 0.5, color: "#10231a" },
          { offset: 1, color: "#081410" },
        ],
      },
      {
        type: "radial",
        cx: 0.75, cy: 0.7, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(62, 207, 142, 0.4)" },
          { offset: 0.5, color: "rgba(62, 207, 142, 0.1)" },
          { offset: 1, color: "rgba(62, 207, 142, 0)" },
        ],
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    previewColor: "#635bff",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#635bff" },
          { offset: 0.4, color: "#7a5cff" },
          { offset: 0.7, color: "#a960ee" },
          { offset: 1, color: "#ff6692" },
        ],
      },
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.5, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(144, 224, 255, 0.35)" },
          { offset: 1, color: "rgba(144, 224, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    previewColor: "#5e6ad2",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0c0d12" },
          { offset: 0.5, color: "#13141d" },
          { offset: 1, color: "#08090a" },
        ],
      },
      {
        type: "radial",
        cx: 0.3, cy: 0.2, r0: 0, r1: 0.9,
        stops: [
          { offset: 0, color: "rgba(94, 106, 210, 0.35)" },
          { offset: 0.5, color: "rgba(94, 106, 210, 0.1)" },
          { offset: 1, color: "rgba(94, 106, 210, 0)" },
        ],
      },
      {
        type: "linear",
        x0: 1, y0: 1, x1: 0.4, y1: 0.3,
        stops: [
          { offset: 0, color: "rgba(168, 130, 255, 0.14)" },
          { offset: 1, color: "rgba(168, 130, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "tailwind",
    name: "Tailwind",
    previewColor: "#38bdf8",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0ea5e9" },
          { offset: 0.5, color: "#38bdf8" },
          { offset: 1, color: "#2dd4bf" },
        ],
      },
      {
        type: "linear",
        x0: 0.5, y0: 0, x1: 0.5, y1: 0.7,
        stops: [
          { offset: 0, color: "rgba(186, 230, 253, 0.3)" },
          { offset: 1, color: "rgba(186, 230, 253, 0)" },
        ],
      },
    ],
  },
  {
    id: "netlify",
    name: "Netlify",
    previewColor: "#00c7b7",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0a1f1d" },
          { offset: 0.5, color: "#0e2c2a" },
          { offset: 1, color: "#06181a" },
        ],
      },
      {
        type: "radial",
        cx: 0.7, cy: 0.3, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(0, 199, 183, 0.4)" },
          { offset: 0.5, color: "rgba(0, 199, 183, 0.1)" },
          { offset: 1, color: "rgba(0, 199, 183, 0)" },
        ],
      },
    ],
  },
  {
    id: "neon",
    name: "Neon",
    previewColor: "#00e599",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#05100d" },
          { offset: 1, color: "#020806" },
        ],
      },
      {
        type: "radial",
        cx: 0.8, cy: 0.8, r0: 0, r1: 0.9,
        stops: [
          { offset: 0, color: "rgba(0, 229, 153, 0.45)" },
          { offset: 0.5, color: "rgba(0, 229, 153, 0.1)" },
          { offset: 1, color: "rgba(0, 229, 153, 0)" },
        ],
      },
    ],
  },
  {
    id: "clerk",
    name: "Clerk",
    previewColor: "#6c47ff",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#100c1f" },
          { offset: 0.5, color: "#160f2b" },
          { offset: 1, color: "#0b0816" },
        ],
      },
      {
        type: "radial",
        cx: 0.4, cy: 0.3, r0: 0, r1: 0.9,
        stops: [
          { offset: 0, color: "rgba(108, 71, 255, 0.4)" },
          { offset: 0.5, color: "rgba(108, 71, 255, 0.1)" },
          { offset: 1, color: "rgba(108, 71, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "railway",
    name: "Railway",
    previewColor: "#c049ff",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#13111c" },
          { offset: 1, color: "#0b0a12" },
        ],
      },
      {
        type: "radial",
        cx: 0.5, cy: 0.5, r0: 0, r1: 0.9,
        stops: [
          { offset: 0, color: "rgba(192, 73, 255, 0.32)" },
          { offset: 0.5, color: "rgba(192, 73, 255, 0.08)" },
          { offset: 1, color: "rgba(192, 73, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    previewColor: "#5865f2",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#1a1c2e" },
          { offset: 0.5, color: "#23253b" },
          { offset: 1, color: "#151624" },
        ],
      },
      {
        type: "radial",
        cx: 0.3, cy: 0.25, r0: 0, r1: 0.85,
        stops: [
          { offset: 0, color: "rgba(88, 101, 242, 0.45)" },
          { offset: 0.5, color: "rgba(88, 101, 242, 0.12)" },
          { offset: 1, color: "rgba(88, 101, 242, 0)" },
        ],
      },
    ],
  },
  {
    id: "framer",
    name: "Framer",
    previewColor: "#0099ff",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#0099ff" },
          { offset: 0.5, color: "#00ccff" },
          { offset: 1, color: "#66e0ff" },
        ],
      },
      {
        type: "linear",
        x0: 0, y0: 0, x1: 0.6, y1: 0.6,
        stops: [
          { offset: 0, color: "rgba(255, 255, 255, 0.25)" },
          { offset: 1, color: "rgba(255, 255, 255, 0)" },
        ],
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    previewColor: "#24292e",
    group: "org",
    layers: [
      {
        type: "linear",
        x0: 0, y0: 0, x1: 1, y1: 1,
        stops: [
          { offset: 0, color: "#24292e" },
          { offset: 0.5, color: "#1b1f23" },
          { offset: 1, color: "#0d1117" },
        ],
      },
      {
        type: "radial",
        cx: 0.5, cy: 0.1, r0: 0, r1: 0.8,
        stops: [
          { offset: 0, color: "rgba(88, 166, 255, 0.18)" },
          { offset: 1, color: "rgba(88, 166, 255, 0)" },
        ],
      },
    ],
  },
];

// ---------- lookup ----------

export function getBackgroundThemeById(id: string): BackgroundTheme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function getAllBackgroundThemes(): BackgroundTheme[] {
  return THEMES;
}

/**
 * Builds a CSS `background` value that approximates a canvas background theme,
 * so the same look can be reused in DOM overlays (e.g. the lesson intro card).
 * CSS paints the first listed background on top, which is the reverse of how
 * the canvas renderer layers them, so we reverse the layer order here.
 */
export function backgroundThemeToCss(theme: BackgroundTheme): string {
  const toGradient = (layer: GradientLayer): string => {
    const stops = layer.stops
      .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
      .join(", ");
    if (layer.type === "linear") {
      const dx = layer.x1 - layer.x0;
      const dy = layer.y1 - layer.y0;
      // CSS angle: 0deg points up, increasing clockwise (y grows downward).
      const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      return `linear-gradient(${angle.toFixed(1)}deg, ${stops})`;
    }
    const cx = (layer.cx * 100).toFixed(1);
    const cy = (layer.cy * 100).toFixed(1);
    const radius = (layer.r1 * 100).toFixed(1);
    return `radial-gradient(circle ${radius}% at ${cx}% ${cy}%, ${stops})`;
  };

  return [...theme.layers].reverse().map(toGradient).join(", ");
}

/** Rough perceived brightness (0-255) of a hex colour, for text contrast. */
export function hexBrightness(hex: string): number {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return 0;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function createBackgroundLayerCacheKey(opts: BackgroundLayerCacheKeyOptions): string {
  const {
    themeId,
    width,
    height,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    cornerRadius,
  } = opts;

  return [
    themeId,
    width,
    height,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    cornerRadius,
  ].join(":");
}

// ---------- canvas drawing ----------

/**
 * Draws a background gradient onto the full canvas area.
 * Call this before drawing the code card.
 */
export function drawBackgroundGradient(opts: {
  ctx: CanvasRenderingContext2D;
  theme: BackgroundTheme;
  width: number;
  height: number;
  cornerRadius?: number;
}) {
  const { ctx, theme, width, height, cornerRadius } = opts;

  if (cornerRadius && cornerRadius > 0) {
    ctx.save();
    const r = Math.min(cornerRadius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(width, 0, width, height, r);
    ctx.arcTo(width, height, 0, height, r);
    ctx.arcTo(0, height, 0, 0, r);
    ctx.arcTo(0, 0, width, 0, r);
    ctx.closePath();
    ctx.clip();
  }

  for (const layer of theme.layers) {
    let grad: CanvasGradient;
    if (layer.type === "linear") {
      grad = ctx.createLinearGradient(
        layer.x0 * width,
        layer.y0 * height,
        layer.x1 * width,
        layer.y1 * height,
      );
    } else {
      const ref = Math.min(width, height);
      grad = ctx.createRadialGradient(
        layer.cx * width,
        layer.cy * height,
        layer.r0 * ref,
        layer.cx * width,
        layer.cy * height,
        layer.r1 * ref,
      );
    }
    for (const stop of layer.stops) {
      grad.addColorStop(stop.offset, stop.color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  if (cornerRadius && cornerRadius > 0) {
    ctx.restore();
  }
}

/**
 * Draws a subtle shadow behind the code card when background is visible.
 */
export function drawCardShadow(opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
}) {
  const { ctx, x, y, width, height, cornerRadius } = opts;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;

  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  const r = Math.min(cornerRadius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  // Fill with an opaque colour so the shadow actually renders;
  // the shape itself will be covered by the card background.
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();
}

export function createBackgroundLayerCanvas(opts: BackgroundLayerCanvasOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = opts.width;
  canvas.height = opts.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D not supported");
  }

  drawBackgroundGradient({
    ctx,
    theme: opts.theme,
    width: opts.width,
    height: opts.height,
    cornerRadius: opts.cornerRadius,
  });

  drawCardShadow({
    ctx,
    x: opts.cardX,
    y: opts.cardY,
    width: opts.cardWidth,
    height: opts.cardHeight,
    cornerRadius: opts.cornerRadius,
  });

  return canvas;
}
