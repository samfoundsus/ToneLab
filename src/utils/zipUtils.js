// V3: minimal client-side ZIP writer for "Export All".
//
// Deliberately hand-rolled instead of adding a dependency (e.g. JSZip):
// the app only ever needs to bundle a handful of small text files with no
// compression, which is a small, well-bounded, well-documented binary
// format (the ZIP "STORE" method — files are stored as-is, no deflate).
// This keeps the export path at zero new dependencies while still
// producing a real, standards-compliant .zip that any OS/archive tool can
// open. If richer needs ever come up (compression, huge files, nested
// folders), reaching for a real library at that point would be justified —
// today it isn't.

const textEncoder = new TextEncoder();

// Precomputed CRC-32 table (standard zlib/PKZIP polynomial).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const time =
    ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() >> 1) & 0x1f);
  const day =
    (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, day };
}

function u16(value) {
  const buf = new Uint8Array(2);
  new DataView(buf.buffer).setUint16(0, value, true);
  return buf;
}

function u32(value) {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, true);
  return buf;
}

/**
 * Builds a ZIP file (Blob) from a list of `{ name, content }` entries.
 * `content` may be a string (encoded as UTF-8) or a Uint8Array.
 */
export function createZipBlob(entries) {
  const { time, day } = dosDateTime(new Date());
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach(({ name, content }) => {
    const nameBytes = textEncoder.encode(name);
    const dataBytes = typeof content === 'string' ? textEncoder.encode(content) : content;
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    const localHeader = [
      u32(0x04034b50),
      u16(20), // version needed
      u16(0), // flags
      u16(0), // compression: store
      u16(time),
      u16(day),
      u32(crc),
      u32(size), // compressed size
      u32(size), // uncompressed size
      u16(nameBytes.length),
      u16(0) // extra field length
    ];

    localParts.push(...localHeader, nameBytes, dataBytes);

    const centralHeader = [
      u32(0x02014b50),
      u16(20), // version made by
      u16(20), // version needed
      u16(0), // flags
      u16(0), // compression: store
      u16(time),
      u16(day),
      u32(crc),
      u32(size),
      u32(size),
      u16(nameBytes.length),
      u16(0), // extra field length
      u16(0), // comment length
      u16(0), // disk number start
      u16(0), // internal attributes
      u32(0), // external attributes
      u32(offset) // relative offset of local header
    ];

    centralParts.push(...centralHeader, nameBytes);

    offset += localHeader.reduce((sum, part) => sum + part.length, 0) + nameBytes.length + dataBytes.length;
  });

  const centralDirSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const centralDirOffset = offset;

  const endRecord = [
    u32(0x06054b50),
    u16(0), // this disk
    u16(0), // central dir start disk
    u16(entries.length), // records on this disk
    u16(entries.length), // total records
    u32(centralDirSize),
    u32(centralDirOffset),
    u16(0) // comment length
  ];

  return new Blob([...localParts, ...centralParts, ...endRecord], { type: 'application/zip' });
}
