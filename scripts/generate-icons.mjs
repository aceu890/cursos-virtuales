import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(path, width, height, getPixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = getPixel(x, y);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function paint(size, padRatio) {
  const pad = Math.floor(size * padRatio);
  const inner = size - pad * 2;
  return (x, y) => {
    const bg = [47, 184, 174, 255];
    if (x < 0 || y < 0) return bg;
    const cx = size / 2;
    const cy = size / 2 - inner * 0.06;
    const r = inner * 0.22;
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy <= r * r) {
      return [244, 255, 253, 255];
    }
    const baseTop = cy + r * 0.7;
    const baseW = r * 0.7;
    const baseH = r * 0.55;
    if (
      y >= baseTop &&
      y <= baseTop + baseH &&
      Math.abs(x - cx) <= baseW / 2
    ) {
      return [213, 232, 230, 255];
    }
    return bg;
  };
}

mkdirSync("public/icons", { recursive: true });
writePng("public/icons/icon-192.png", 192, 192, paint(192, 0.08));
writePng("public/icons/icon-512.png", 512, 512, paint(512, 0.08));
writePng("public/icons/icon-maskable-192.png", 192, 192, paint(192, 0.22));
writePng("public/icons/icon-maskable-512.png", 512, 512, paint(512, 0.22));
writePng("public/icons/apple-touch-icon.png", 180, 180, paint(180, 0.1));
console.log("Iconos PWA generados en public/icons");
