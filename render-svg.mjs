import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

const layouts = {
  product: { width: 800, height: 1000, media: [44, 235, 712, 495], text: [44, 141, 712], rows: false },
  promotion: { width: 800, height: 1000, media: [44, 263, 712, 453], text: [44, 156, 712], rows: false },
  detail: { width: 800, height: 1500, media: [44, 240, 712, 570], text: [44, 141, 712], rows: true },
  store: { width: 1080, height: 800, media: [564, 102, 472, 556], text: [44, 250, 484], rows: false },
};
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const font = 'Arial, Microsoft YaHei, PingFang SC, sans-serif';
const mono = 'Consolas, Monaco, Microsoft YaHei, monospace';
const xml = input => String(input ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
  .replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
const readable = (color) => {
  const linear = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2] > .20 ? '#171910' : '#fff7e7';
};
function color(input, fallback) {
  if (input === undefined) return fallback;
  if (typeof input !== 'string' || !/^#[0-9a-f]{6}$/i.test(input)) throw Error('Colors must be #RRGGBB.');
  return input;
}
function asText(input, key, maximum, required = false) {
  if (input === undefined && !required) return '';
  if (typeof input !== 'string' || (required && !input.trim()) || Array.from(input).length > maximum) {
    throw Error(key + ' must be text with at most ' + maximum + ' characters.');
  }
  return input.trim();
}
async function imageData(imagePath, briefPath) {
  if (!imagePath) return '';
  const path = resolve(dirname(briefPath), imagePath);
  const info = await stat(path);
  if (!info.isFile() || info.size > 8 * 1024 * 1024) throw Error('The image must be a local PNG or JPG file, at most 8 MB.');
  const buffer = await readFile(path);
  const mime = buffer.subarray(0, 8).equals(pngSignature) ? 'image/png'
    : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 ? 'image/jpeg' : '';
  if (!mime) throw Error('The image contents are not PNG or JPG.');
  return 'data:' + mime + ';base64,' + buffer.toString('base64');
}
function makeSvg(brief, src) {
  if (!Object.hasOwn(layouts, brief.format)) throw Error('format must be product, promotion, detail, or store.');
  const { width, height, media: [mx, my, mw, mh], text: [tx, ty, tw], rows } = layouts[brief.format];
  const bg = color(brief.background, '#f0daba'), accent = color(brief.accent, '#812b22');
  const ink = readable(bg), onAccent = readable(accent), wide = brief.format === 'store';
  const title = asText(brief.title, 'title', 60, true);
  const subtitle = asText(brief.subtitle, 'subtitle', 110);
  const brand = asText(brief.brand, 'brand', 40);
  const eyebrow = asText(brief.eyebrow, 'eyebrow', 48);
  const badge = asText(brief.badge, 'badge', 30);
  const price = asText(brief.price, 'price', 24);
  const cta = asText(brief.cta, 'cta', 54);
  const lang = brief.locale ?? 'en';
  if (typeof lang !== 'string' || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(lang)) throw Error('locale must be a language tag, such as zh-CN or en.');
  if (brief.benefits !== undefined && (!Array.isArray(brief.benefits) || brief.benefits.length > 3)) {
    throw Error('benefits must be an array with at most three items.');
  }
  const benefits = (brief.benefits ?? []).map((item, index) => asText(item, 'benefit ' + (index + 1), 40, true));
  const parts = [];
  const rect = (x, y, w, h, fill, radius = 0) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" rx="' + radius + '"/>';
  function text(value, x, y, size, space, fill = ink, options = {}) {
    if (!value) return '';
    const line = value.replace(/\s+/g, ' ');
    const units = Array.from(line).reduce((total, char) => total + (/[\u0000-\u00ff]/.test(char) ? .66 : 1.08), 0);
    const fit = Math.min(size, space / units).toFixed(1);
    return '<text x="' + x + '" y="' + y + '" fill="' + fill + '" font-size="' + fit + '" font-family="' + (options.mono ? mono : font)
      + '" text-anchor="' + (options.anchor || 'start') + '" font-weight="' + (options.weight || 400) + '">' + xml(line) + '</text>';
  }
  const rule = (x1, y, x2, fill = ink) => '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="' + fill + '" stroke-opacity=".42"/>';
  parts.push(rect(0, 0, width, height, bg), text(brand, 44, 54, 21, width - 355, ink, { weight: 800 }),
    text(eyebrow, width - 44, 54, 14, 280, ink, { mono: true, anchor: 'end' }), rule(44, 75, width - 44));
  if (wide && badge) parts.push(rect(tx, ty - 114, 154, 36, accent, 18), text(badge, tx + 77, ty - 90, 16, 131, onAccent, { anchor: 'middle', weight: 700 }));
  parts.push(text(title, tx, ty, wide ? 60 : 67, tw, ink, { weight: 800 }), text(subtitle, tx, ty + 44, 24, tw));
  parts.push(rect(mx, my, mw, mh, accent, 18));
  const cx = mx + mw / 2, cy = my + mh / 2;
  parts.push('<rect x="' + (mx + 16) + '" y="' + (my + 16) + '" width="' + (mw - 32) + '" height="' + (mh - 32)
    + '" rx="10" fill="none" stroke="' + onAccent + '" stroke-opacity=".52" stroke-dasharray="5 7"/>',
  '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.round(Math.min(mw, mh) * .39) + '" fill="' + onAccent + '" opacity=".12"/>');
  if (src) {
    parts.push('<image href="' + src + '" x="' + (mx + 36) + '" y="' + (my + 31) + '" width="' + (mw - 72) + '" height="' + (mh - 62)
      + '" preserveAspectRatio="xMidYMid meet"/>');
  } else {
    const bottleWidth = Math.min(mw * .33, 156), bottleHeight = mh * .58, x = cx - bottleWidth / 2, y = cy - bottleHeight / 2;
    const sample = lang.toLowerCase().startsWith('zh') ? '示意图 / SAMPLE' : 'PRODUCT PLACEHOLDER';
    parts.push(rect(x + bottleWidth * .25, y, bottleWidth * .5, bottleHeight * .15, onAccent, 6),
      rect(x, y + bottleHeight * .13, bottleWidth, bottleHeight * .87, bg, 18),
      rect(x + 12, y + bottleHeight * .49, bottleWidth - 24, bottleHeight * .24, ink, 5),
      text('SAMPLE', cx, y + bottleHeight * .65, 19, bottleWidth - 34, bg, { anchor: 'middle', mono: true }),
      text(sample, cx, my + mh - 33, 13, mw - 100, onAccent, { anchor: 'middle', mono: true }));
  }
  if (!wide && badge) {
    parts.push(rect(mx + 29, my + 29, 151, 36, bg, 18), text(badge, mx + 104, my + 53, 15, 130, ink, { anchor: 'middle', weight: 700 }));
  }
  if (rows) {
    parts.push(...benefits.flatMap((item, i) => {
      const y = 900 + 117 * i;
      return [rule(44, y - 44, width - 44), text('0' + (i + 1), 45, y, 28, 60, ink, { mono: true }),
        text(item, 136, y, 35, 610, ink, { weight: 700 })];
    }));
    parts.push(rule(44, 1340, width - 44), text(cta, 44, 1410, 26, 440, ink, { weight: 700 }),
      text(price, width - 44, 1410, 33, 234, ink, { anchor: 'end', weight: 800 }));
  } else {
    const bottom = wide ? 698 : 925;
    const priceY = wide ? 414 : 818;
    parts.push(text(price, 44, priceY, 38, wide ? 446 : 297, ink, { weight: 800 }),
      text(cta, wide ? 44 : width - 44, wide ? 479 : 818, 23, wide ? 445 : 371, ink, { anchor: wide ? 'start' : 'end', weight: 700 }),
      rule(44, bottom - 32, width - 44));
    const cell = (width - 88) / 3;
    parts.push(...benefits.map((item, i) => text(item, 44 + i * cell, bottom, 20, cell - 19, ink, { weight: 700 })));
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" xml:lang="' + lang + '" width="' + width + '" height="' + height
    + '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="design-title">'
    + '<title id="design-title">' + xml(title) + '</title>\n' + parts.filter(Boolean).join('\n') + '\n</svg>\n';
}

async function main() {
  const [briefFile, outputFile] = process.argv.slice(2);
  if (!briefFile || !outputFile || extname(outputFile).toLowerCase() !== '.svg') {
    throw Error('Usage: node scripts/render-svg.mjs <brief.json> <new-output.svg>');
  }
  const briefPath = resolve(briefFile);
  const brief = JSON.parse(await readFile(briefPath, 'utf8'));
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) throw Error('The brief must be a JSON object.');
  const src = await imageData(asText(brief.image, 'image', 1024), briefPath);
  const svg = makeSvg(brief, src);
  await writeFile(resolve(outputFile), svg, { encoding: 'utf8', flag: 'wx' });
  console.log(outputFile);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
