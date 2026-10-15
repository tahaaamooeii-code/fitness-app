const path = require("path");
const sharp = require(
  "C:/Users/Heram/Desktop/Claude code/tahaamouei.ir/node_modules/sharp"
);

const LOGO_PATH =
  "C:/Users/Heram/Desktop/Claude code/tahaamouei.ir/public/brand/logo-main.jpg";
const ASSETS_DIR = path.join(__dirname, "..", "assets");

const NAVY = "#04061a";
const TEAL = "#009999";
const SIZE = 1024;

// lucide "dumbbell" icon path data, 24x24 viewBox
const DUMBBELL_PATH = [
  "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z",
  "m2.5 21.5 1.4-1.4",
  "m20.1 3.9 1.4-1.4",
  "M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z",
  "m9.6 14.4 4.8-4.8",
].map((d) => `<path d="${d}" />`).join("");

function dumbbellBadgeSvg({ badgeSize, iconScale, strokeWidth }) {
  const r = badgeSize / 2;
  const iconSize = badgeSize * iconScale;
  const offset = (badgeSize - iconSize) / 2;
  return `
<svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 ${badgeSize} ${badgeSize}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${r}" cy="${r}" r="${r - 4}" fill="${TEAL}" stroke="${NAVY}" stroke-width="8" />
  <g transform="translate(${offset}, ${offset}) scale(${iconSize / 24})"
     fill="none" stroke="#ffffff" stroke-width="${strokeWidth}"
     stroke-linecap="round" stroke-linejoin="round">
    ${DUMBBELL_PATH}
  </g>
</svg>`;
}

async function buildComposite({ canvasSize, logoScale, badgeScale, transparentBg }) {
  const logoSize = Math.round(canvasSize * logoScale);
  const logoBuffer = await sharp(LOGO_PATH)
    .removeAlpha()
    .resize(logoSize, logoSize, { fit: "cover" })
    .png()
    .toBuffer();

  const logoOffset = Math.round((canvasSize - logoSize) / 2);
  const composites = [{ input: logoBuffer, left: logoOffset, top: logoOffset }];

  if (badgeScale > 0) {
    const badgeSize = Math.round(canvasSize * badgeScale);
    const badgeSvg = dumbbellBadgeSvg({
      badgeSize,
      iconScale: 0.56,
      strokeWidth: 2.6,
    });
    const badgeBuffer = await sharp(Buffer.from(badgeSvg)).png().toBuffer();
    const badgeOffset = Math.round(canvasSize - badgeSize - canvasSize * 0.04);
    composites.push({
      input: badgeBuffer,
      left: Math.round((canvasSize - badgeSize) / 2),
      top: badgeOffset,
    });
  }

  const base = transparentBg
    ? sharp({
        create: {
          width: canvasSize,
          height: canvasSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
    : sharp({
        create: {
          width: canvasSize,
          height: canvasSize,
          channels: 4,
          background: NAVY,
        },
      });

  return base.composite(composites).png().toBuffer();
}

async function main() {
  // Main app icon (iOS + general launcher): near full-bleed.
  const icon = await buildComposite({
    canvasSize: SIZE,
    logoScale: 0.94,
    badgeScale: 0.34,
    transparentBg: false,
  });
  await sharp(icon).toFile(path.join(ASSETS_DIR, "icon.png"));

  // Android adaptive icon foreground: extra padding so the mask (circle/
  // squircle) on various launchers doesn't clip the brain mark or badge.
  const foreground = await buildComposite({
    canvasSize: SIZE,
    logoScale: 0.64,
    badgeScale: 0.26,
    transparentBg: false,
  });
  await sharp(foreground).toFile(
    path.join(ASSETS_DIR, "android-icon-foreground.png")
  );

  // Adaptive icon background: flat navy, matches the logo's own background.
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: NAVY },
  })
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-background.png"));

  // Monochrome (Android 13+ themed icon): simple white dumbbell glyph only,
  // transparent background, per Android's themed-icon guidance.
  const monoSvg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${SIZE * 0.28}, ${SIZE * 0.28}) scale(${(SIZE * 0.44) / 24})"
     fill="none" stroke="#ffffff" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round">
    ${DUMBBELL_PATH}
  </g>
</svg>`;
  await sharp(Buffer.from(monoSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-monochrome.png"));

  // Splash icon: logo only (no badge), used by expo-splash-screen's native
  // splash, kept simple/fast since the custom intro screen does the rest.
  const splash = await buildComposite({
    canvasSize: SIZE,
    logoScale: 0.5,
    badgeScale: 0,
    transparentBg: false,
  });
  await sharp(splash).toFile(path.join(ASSETS_DIR, "splash-icon.png"));

  console.log("Icons generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
