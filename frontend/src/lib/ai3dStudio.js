/** AI 3D Home Studio — 5-phase workflow, pipeline formula, prompts */

export const FORMULA_PIPELINE = [
  { id: "blueprint", en: "2D Blueprint", hi: "2D ब्लूप्रिंट", descEn: "Isometric floor plan concept image", descHi: "आइसोमेट्रिक फ्लोर प्लान कॉन्सेप्ट" },
  { id: "depth", en: "Depth Map", hi: "डेप्थ मैप", descEn: "AI extracts spatial depth from 2D", descHi: "AI से 2D से स्पेशियल डेप्थ" },
  { id: "mesh", en: "3D Mesh", hi: "3D मेश", descEn: "Walls, floors, geometry extrusion", descHi: "वॉल, फ्लोर, ज्योमेट्री एक्सट्रूशन" },
  { id: "materials", en: "Material Mapping", hi: "मटेरियल मैपिंग", descEn: "Text-to-3D assets & textures", descHi: "Text-to-3D एसेट और टेक्सचर" },
  { id: "render", en: "Photorealistic Render", hi: "फोटोरियलिस्टिक रेंडर", descEn: "3-point lighting + AI polish", descHi: "3-पॉइंट लाइटिंग + AI पॉलिश" },
];

export const PIPELINE_STEPS = FORMULA_PIPELINE;

export const SCALE_OPTIONS = [
  { id: "1:50", ratio: 50, labelEn: "1:50 (detail models)", labelHi: "1:50 (विस्तृत मॉडल)" },
  { id: "1:100", ratio: 100, labelEn: "1:100 (standard plans)", labelHi: "1:100 (स्टैंडर्ड प्लान)" },
];

export const LIGHTING_FORMULA = {
  key: { pct: 100, en: "Key light (sun / main)", hi: "Key Light (सूर्य / मुख्य)" },
  fill: { pct: 50, en: "Fill light (soft shadows)", hi: "Fill Light (सॉफ्ट शैडो)" },
  ambient: { pct: 30, en: "Backlight / ambient (depth)", hi: "Backlight / Ambient (गहराई)" },
};

export const FOV_DEFAULT = 68;
export const FOV_MIN = 60;
export const FOV_MAX = 75;

export const LAYOUT_ZONES = [
  {
    id: "living",
    pct: 40,
    en: "AI workstation & living",
    hi: "AI वर्कस्टेशन व लिविंग",
    detailEn: "Primary AI workstation corner, ergonomic desk, monitors, VR setup.",
    detailHi: "प्राथमिक AI वर्कस्टेशन, एर्गोनॉमिक डेस्क, मॉनिटर, VR सेटअप।",
  },
  {
    id: "bedroom",
    pct: 25,
    en: "Sleeping nook / private",
    hi: "स्लीपिंग नूक / प्राइवेट",
    detailEn: "Separated sleeping nook with glass partition.",
    detailHi: "ग्लास पार्टिशन से अलग स्लीपिंग नूक।",
  },
  {
    id: "kitchen",
    pct: 20,
    en: "Kitchenette & dining",
    hi: "किचनेट और डाइनिंग",
    detailEn: "Compact L-shaped kitchenette counter.",
    detailHi: "कॉम्पैक्ट L-शेप किचनेट काउंटर।",
  },
  {
    id: "utility",
    pct: 15,
    en: "Hidden washroom",
    hi: "हिडन वॉशरूम",
    detailEn: "Hidden door washroom and utility zone.",
    detailHi: "हिडन डोर वॉशरूम और यूटिलिटी ज़ोन।",
  },
];

export const AI_DESIGN_TOOLS = [
  { categoryEn: "2D to 3D layout", categoryHi: "2D से 3D", tool: "Planner 5D AI / Maket.ai", useEn: "Image to floorplan & 3D geometry", useHi: "इमेज से फ्लोरप्लान और 3D ज्योमेट्री", url: "https://planner5d.com" },
  { categoryEn: "Interior AI redesign", categoryHi: "इंटीरियर AI", tool: "RoomGPT / REimagine Home", useEn: "Photo upload → studio redesign", useHi: "फोटो अपलोड → स्टूडियो रीडिज़ाइन", url: "https://roomgpt.io" },
  { categoryEn: "Text-to-3D mesh", categoryHi: "Text-to-3D", tool: "Meshy.ai / Spline AI / CSM.ai", useEn: "Custom workstation & asset meshes", useHi: "कस्टम वर्कस्टेशन और एसेट मेश", url: "https://meshy.ai" },
  { categoryEn: "3D AI rendering", categoryHi: "3D AI रेंडर", tool: "LookX AI / Chaos Vantage", useEn: "Photorealistic 8K architectural render", useHi: "फोटोरियलिस्टिक 8K आर्किटेक्चरल रेंडर", url: "https://www.chaos.com" },
  { categoryEn: "Prompt engineering", categoryHi: "प्रॉम्प्ट इंजीनियरिंग", tool: "ChatGPT / Gemini", useEn: "Concept & prompt refinement", useHi: "कॉन्सेप्ट और प्रॉम्प्ट रिफाइनमेंट", url: "https://gemini.google.com" },
  { categoryEn: "Image generation", categoryHi: "इमेज जनरेशन", tool: "Midjourney / DALL-E 3 / Leonardo", useEn: "Isometric concept & blueprint visuals", useHi: "आइसोमेट्रिक कॉन्सेप्ट और ब्लूप्रिंट", url: "https://leonardo.ai" },
];

const STYLE_PROMPTS = {
  modern: "modern minimalist",
  traditional: "traditional Indian warm tones",
  minimal: "ultra-minimal Scandinavian",
  luxury: "luxury high-end finishes",
  studio: "modern isometric studio apartment",
};

export function computeLayoutZones(builtUpSqft) {
  const total = Number(builtUpSqft) || 0;
  if (total <= 0) return null;
  return LAYOUT_ZONES.map((z) => ({
    ...z,
    sqft: Math.round(total * (z.pct / 100)),
  }));
}

function zoneText(zones, lang = "en") {
  if (!zones?.length) return "40% workstation, 25% sleep, 20% kitchen, 15% washroom";
  return zones.map((z) => {
    const label = lang === "hi" ? z.hi : z.en;
    return `${z.pct}% ${label} (${z.sqft} sqft)`;
  }).join(", ");
}

/** Phase 1 — Concept Generator (ChatGPT / Gemini) */
export function buildPrompt1Concept({ builtUpSqft = 400, zones = null, lang = "en" }) {
  const z = zones || computeLayoutZones(builtUpSqft);
  const zoning = zoneText(z, lang);
  return (
    `Act as an expert architectural prompt engineer. Create a highly detailed, 50-word prompt for an image-generation AI. ` +
    `The prompt must describe a modern, minimalist isometric 3D floor plan layout for a compact 3D Home Studio apartment (approx ${builtUpSqft} sq ft). ` +
    `Include specific zoning: ${zoning}. ` +
    `Specify the materials (warm oak wood flooring, exposed concrete walls, large glass partition) and the lighting (warm 3-point studio lighting, cinematic atmosphere).`
  );
}

/** Phase 2 — Isometric visual (Midjourney / DALL-E / Leonardo) */
export function buildPrompt2Isometric({ builtUpSqft = 400, style = "studio", fov = FOV_DEFAULT, extra = "" }) {
  const styleText = STYLE_PROMPTS[style] || style;
  const base =
    `Photorealistic 3D architectural render of a ${styleText} layout, open floor plan, warm lighting, ` +
    `primary AI workstation corner with ergonomic desk and multiple monitors, separated sleeping nook with glass partition, ` +
    `compact L-shaped kitchenette, minimalist furniture, warm oak flooring, exposed concrete walls, ` +
    `warm 3-point studio lighting (key 100% fill 50% backlight 30%), camera FOV ${fov} degrees, cinematic lighting, ` +
    `8k resolution, Unreal Engine 5 render`;
  const withExtra = extra.trim() ? `${base}, ${extra.trim()}` : base;
  return `${withExtra}.`;
}

/** Phase 3 — REimagine Home spatial conversion */
export function buildPrompt3Reimagine() {
  return (
    "Redesign this uploaded room as a modern 3D Home Studio. Keep the walls and windows, but replace all furniture with minimalist aesthetic, " +
    "include an ergonomic standing desk, sound-absorbing acoustic panels on the work wall, and a large central coffee table. " +
    "Use a warm, diffused lighting setup."
  );
}

/** Phase 4 — Meshy.ai asset generation */
export function buildPrompt4MeshyAsset() {
  return (
    "Generate a detailed 3D model of a modern, modular ergonomic workstation desk. " +
    "It must include an articulated arm holding a large curved monitor, an integrated cable management system, " +
    "and a black matte finish with wood accents. Low-poly optimized for rapid rendering."
  );
}

/** Phase 5 — LookX AI final render */
export function buildPrompt5LookXRender({ quality = "premium" } = {}) {
  return (
    `Photorealistic architectural visualization, interior view of modern 3D Home Studio, focus on the workstation, ` +
    `dramatic cinematic lighting, soft warm filling light from the left (fill 50%), sharp accent backlight from the right (key 100%), ` +
    `ambient depth light 30%, detailed textures on the oak floor and acoustic panels, ${quality} quality tier, ` +
    `hyper-realistic, 8k, raytracing.`
  );
}

export const WORKFLOW_PHASES = [
  {
    id: "phase1",
    phase: 1,
    en: "Conceptualization & prompt engineering",
    hi: "कॉन्सेप्ट और प्रॉम्प्ट इंजीनियरिंग",
    tools: "ChatGPT / Gemini",
    toolUrl: "https://gemini.google.com",
    stepsEn: ["Codify layout zoning (40% work, 25% sleep, 20% kitchen, 15% utility) into text.", "Run Prompt 1 in ChatGPT or Gemini.", "Copy refined output for Phase 2."],
    stepsHi: ["लेआउट ज़ोनिंग टेक्स्ट में कोड करें।", "ChatGPT/Gemini में Prompt 1 चलाएँ।", "आउटपुट Phase 2 के लिए कॉपी करें।"],
    promptKey: "prompt1",
  },
  {
    id: "phase2",
    phase: 2,
    en: "2D visual concept & blueprint",
    hi: "2D विज़ुअल कॉन्सेप्ट और ब्लूप्रिंट",
    tools: "Midjourney / DALL-E 3 / Leonardo.ai",
    toolUrl: "https://leonardo.ai",
    stepsEn: ["Use Prompt 1 output or Prompt 2 below.", "Generate isometric floor plan image.", "Pick best image for Phase 3 upload."],
    stepsHi: ["Prompt 1 आउटपुट या Prompt 2 उपयोग करें।", "आइसोमेट्रिक फ्लोर प्लान इमेज जनरेट करें।", "Phase 3 अपलोड के लिए बेस्ट इमेज चुनें।"],
    promptKey: "prompt2",
  },
  {
    id: "phase3",
    phase: 3,
    en: "Spatial conversion (2D → 3D geometry)",
    hi: "स्पेशियल कन्वर्शन (2D → 3D)",
    tools: "Planner 5D AI / Maket.ai / REimagine Home",
    toolUrl: "https://planner5d.com",
    stepsEn: ["Upload isometric image from Phase 2.", "Use AI Recognize or Image to Floorplan.", "Refine walls, doors and partitions manually."],
    stepsHi: ["Phase 2 की इमेज अपलोड करें।", "AI Recognize / Image to Floorplan चलाएँ।", "वॉल, दरवाज़ा और पार्टिशन मैन्युअल ठीक करें।"],
    promptKey: "prompt3",
  },
  {
    id: "phase4",
    phase: 4,
    en: "Asset & material generation",
    hi: "एसेट और मटेरियल जनरेशन",
    tools: "Meshy.ai / Spline AI / CSM.ai",
    toolUrl: "https://meshy.ai",
    stepsEn: ["Generate custom meshes (desk, VR rig, mic).", "Import assets into main layout.", "Apply oak, concrete, glass materials."],
    stepsHi: ["कस्टम मेश जनरेट करें (डेस्क, VR, माइक)।", "मुख्य लेआउट में इम्पोर्ट करें।", "ओक, कंक्रीट, ग्लास मटेरियल लगाएँ।"],
    promptKey: "prompt4",
  },
  {
    id: "phase5",
    phase: 5,
    en: "Lighting, rendering & photorealism",
    hi: "लाइटिंग, रेंडर और फोटोरियलिज़्म",
    tools: "LookX AI / Chaos Vantage / Blender",
    toolUrl: "https://www.chaos.com",
    stepsEn: ["Import scene from Phases 3 & 4.", "Set 3-point lights: Key 100%, Fill 50%, Back 30%.", "Run AI Render to Photoreal (8K)."],
    stepsHi: ["Phase 3–4 सीन इम्पोर्ट करें।", "3-पॉइंट लाइट: Key 100%, Fill 50%, Back 30%.", "AI Render to Photoreal (8K) चलाएँ।"],
    promptKey: "prompt5",
  },
];

export function buildFullWorkflow({
  builtUpSqft = 400,
  room = "studio apartment",
  style = "studio",
  scale = "1:50",
  fov = FOV_DEFAULT,
  extra = "",
  quality = "premium",
  lang = "en",
}) {
  const zones = computeLayoutZones(builtUpSqft);
  return {
    formula: FORMULA_PIPELINE,
    zones,
    lighting: LIGHTING_FORMULA,
    fov,
    scale,
    prompts: {
      prompt1: buildPrompt1Concept({ builtUpSqft, zones, lang }),
      prompt2: buildPrompt2Isometric({ builtUpSqft, style, fov, extra }),
      prompt3: buildPrompt3Reimagine(),
      prompt4: buildPrompt4MeshyAsset(),
      prompt5: buildPrompt5LookXRender({ quality }),
    },
    phases: WORKFLOW_PHASES,
  };
}

export function buildStudioPrompt(opts) {
  return buildPrompt2Isometric(opts);
}

export function buildPipelineConfig({ builtUpSqft, scaleId = "1:50", fov = FOV_DEFAULT }) {
  const scaleOpt = SCALE_OPTIONS.find((s) => s.id === scaleId) || SCALE_OPTIONS[0];
  return {
    scale: scaleOpt.id,
    scale_ratio: scaleOpt.ratio,
    fov: Math.min(FOV_MAX, Math.max(FOV_MIN, Number(fov) || FOV_DEFAULT)),
    lighting: LIGHTING_FORMULA,
    zones: computeLayoutZones(builtUpSqft),
    formula: FORMULA_PIPELINE,
    steps: PIPELINE_STEPS,
  };
}
