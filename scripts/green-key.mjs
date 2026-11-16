import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const SRC = "/home/z/my-project/public/gta-hero.webp";
const OUT = "/home/z/my-project/scripts/key-green.png";

const PROMPT = `Replace the entire background with one completely flat, uniform solid pure green chroma-key color (#00FF00) with no shadows, no gradient, no texture, no objects. Keep the two characters exactly as they are: the woman in the black niqab with a blue dress and the man with glasses, black face mask, messy dark hair, purple-brown adidas track jacket and red bag strap. Keep their poses, faces, clothing, outlines and colors 100% identical. Only the background changes to flat green, including every gap between their arms and bodies.`;

const b64 = fs.readFileSync(SRC).toString("base64");
const dataUrl = `data:image/webp;base64,${b64}`;

const zai = await ZAI.create();
const res = await zai.images.generations.edit({
  prompt: PROMPT,
  images: [{ url: dataUrl }],
  size: "1024x1024",
});
if (!res?.data?.[0]?.base64) throw new Error("no image returned");
fs.writeFileSync(OUT, Buffer.from(res.data[0].base64, "base64"));
console.log("saved", OUT);
