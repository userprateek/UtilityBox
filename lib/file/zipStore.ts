export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value & 0xffff, true);
}

/** ZIP archive stored without compression. Suitable for a handful of PDFs. */
export function zipStored(files: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.bytes);
    const local = new Uint8Array(30 + name.length + file.bytes.length);
    const view = new DataView(local.buffer);
    writeUint32(view, 0, 0x04034b50);
    writeUint16(view, 4, 20);
    writeUint16(view, 6, 0x0800);
    writeUint16(view, 8, 0);
    writeUint16(view, 10, 0);
    writeUint16(view, 12, 0);
    writeUint32(view, 14, crc);
    writeUint32(view, 18, file.bytes.length);
    writeUint32(view, 22, file.bytes.length);
    writeUint16(view, 26, name.length);
    writeUint16(view, 28, 0);
    local.set(name, 30);
    local.set(file.bytes, 30 + name.length);
    locals.push(local);

    const dir = new Uint8Array(46 + name.length);
    const dirView = new DataView(dir.buffer);
    writeUint32(dirView, 0, 0x02014b50);
    writeUint16(dirView, 4, 20);
    writeUint16(dirView, 6, 20);
    writeUint16(dirView, 8, 0x0800);
    writeUint16(dirView, 10, 0);
    writeUint16(dirView, 12, 0);
    writeUint16(dirView, 14, 0);
    writeUint32(dirView, 16, crc);
    writeUint32(dirView, 20, file.bytes.length);
    writeUint32(dirView, 24, file.bytes.length);
    writeUint16(dirView, 28, name.length);
    writeUint16(dirView, 30, 0);
    writeUint16(dirView, 32, 0);
    writeUint16(dirView, 34, 0);
    writeUint16(dirView, 36, 0);
    writeUint32(dirView, 38, 0);
    writeUint32(dirView, 42, offset);
    dir.set(name, 46);
    central.push(dir);
    offset += local.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  const total = offset + centralSize + end.length;
  const archive = new Uint8Array(total);
  let cursor = 0;
  for (const part of locals) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  for (const part of central) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  archive.set(end, cursor);
  return archive;
}

export function unzipStored(archive: Uint8Array): ZipEntry[] {
  const files: ZipEntry[] = [];
  let offset = 0;
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const decoder = new TextDecoder();

  while (offset + 30 <= archive.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) break;
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const size = view.getUint32(offset + 22, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = decoder.decode(archive.subarray(nameStart, nameStart + nameLength));
    const bytes = archive.subarray(dataStart, dataStart + size);
    files.push({ name, bytes });
    offset = dataStart + size;
  }

  return files;
}
