import exifr from 'exifr';

export interface ExifCategory {
  label: string;
  icon: string;
  fields: ExifField[];
}

export interface ExifField {
  key: string;
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface ParsedExif {
  categories: ExifCategory[];
  hasGps: boolean;
  rawCount: number;
  raw: Record<string, unknown>;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function formatGps(lat?: number, lon?: number): string {
  if (lat === undefined || lon === undefined) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
}

export async function readExif(file: File): Promise<ParsedExif | null> {
  try {
    const raw = await exifr.parse(file, {
      tiff: true,
      gps: true,
      xmp: true,
      icc: true,
      iptc: true,
      translateValues: true,
      reviveValues: true,
    });

    if (!raw) return null;

    const r = raw as Record<string, unknown>;

    const gpsCoords =
      r.latitude !== undefined && r.longitude !== undefined
        ? formatGps(r.latitude as number, r.longitude as number)
        : '';

    const categories: ExifCategory[] = [];

    // Location
    const locationFields: ExifField[] = [];
    if (gpsCoords) locationFields.push({ key: 'gps', label: 'GPS Coordinates', value: gpsCoords, sensitive: true });
    if (r.GPSAltitude !== undefined) locationFields.push({ key: 'alt', label: 'Altitude', value: `${formatValue(r.GPSAltitude)}m`, sensitive: true });
    if (r.GPSSpeed !== undefined) locationFields.push({ key: 'speed', label: 'Speed', value: `${formatValue(r.GPSSpeed)} km/h`, sensitive: true });
    if (locationFields.length) categories.push({ label: 'Location', icon: '📍', fields: locationFields });

    // Time
    const timeFields: ExifField[] = [];
    if (r.DateTimeOriginal) timeFields.push({ key: 'dto', label: 'Date Taken', value: formatValue(r.DateTimeOriginal), sensitive: true });
    if (r.CreateDate) timeFields.push({ key: 'cd', label: 'Created', value: formatValue(r.CreateDate), sensitive: true });
    if (r.ModifyDate) timeFields.push({ key: 'md', label: 'Modified', value: formatValue(r.ModifyDate) });
    if (r.OffsetTime) timeFields.push({ key: 'tz', label: 'Timezone', value: formatValue(r.OffsetTime), sensitive: true });
    if (timeFields.length) categories.push({ label: 'Time', icon: '🕐', fields: timeFields });

    // Camera & Device
    const cameraFields: ExifField[] = [];
    if (r.Make) cameraFields.push({ key: 'make', label: 'Manufacturer', value: formatValue(r.Make), sensitive: true });
    if (r.Model) cameraFields.push({ key: 'model', label: 'Device Model', value: formatValue(r.Model), sensitive: true });
    if (r.LensModel) cameraFields.push({ key: 'lens', label: 'Lens', value: formatValue(r.LensModel) });
    if (r.Software) cameraFields.push({ key: 'sw', label: 'Software', value: formatValue(r.Software), sensitive: true });
    if (r.HostComputer) cameraFields.push({ key: 'host', label: 'Computer', value: formatValue(r.HostComputer), sensitive: true });
    if (cameraFields.length) categories.push({ label: 'Camera & Device', icon: '📷', fields: cameraFields });

    // Technical
    const techFields: ExifField[] = [];
    if (r.ISO) techFields.push({ key: 'iso', label: 'ISO', value: formatValue(r.ISO) });
    if (r.FNumber) techFields.push({ key: 'fn', label: 'Aperture', value: `f/${formatValue(r.FNumber)}` });
    if (r.ExposureTime) techFields.push({ key: 'et', label: 'Shutter Speed', value: `${formatValue(r.ExposureTime)}s` });
    if (r.FocalLength) techFields.push({ key: 'fl', label: 'Focal Length', value: `${formatValue(r.FocalLength)}mm` });
    if (r.Flash !== undefined) techFields.push({ key: 'flash', label: 'Flash', value: formatValue(r.Flash) });
    if (r.WhiteBalance !== undefined) techFields.push({ key: 'wb', label: 'White Balance', value: formatValue(r.WhiteBalance) });
    if (r.ExposureMode !== undefined) techFields.push({ key: 'em', label: 'Exposure Mode', value: formatValue(r.ExposureMode) });
    if (r.MeteringMode) techFields.push({ key: 'mm', label: 'Metering Mode', value: formatValue(r.MeteringMode) });
    if (techFields.length) categories.push({ label: 'Technical', icon: '⚙️', fields: techFields });

    // Identity & Copyright
    const identityFields: ExifField[] = [];
    if (r.Artist) identityFields.push({ key: 'artist', label: 'Artist', value: formatValue(r.Artist), sensitive: true });
    if (r.Copyright) identityFields.push({ key: 'copy', label: 'Copyright', value: formatValue(r.Copyright), sensitive: true });
    if (r.ImageDescription) identityFields.push({ key: 'desc', label: 'Description', value: formatValue(r.ImageDescription) });
    if (r.UserComment) identityFields.push({ key: 'uc', label: 'User Comment', value: formatValue(r.UserComment), sensitive: true });
    if (r.XPAuthor) identityFields.push({ key: 'xpa', label: 'Author (XP)', value: formatValue(r.XPAuthor), sensitive: true });
    if (identityFields.length) categories.push({ label: 'Identity', icon: '👤', fields: identityFields });

    // File Info
    const fileFields: ExifField[] = [];
    if (r.ImageWidth || r.ExifImageWidth) fileFields.push({ key: 'w', label: 'Width', value: `${formatValue(r.ImageWidth ?? r.ExifImageWidth)}px` });
    if (r.ImageHeight || r.ExifImageHeight) fileFields.push({ key: 'h', label: 'Height', value: `${formatValue(r.ImageHeight ?? r.ExifImageHeight)}px` });
    if (r.ColorSpace) fileFields.push({ key: 'cs', label: 'Color Space', value: formatValue(r.ColorSpace) });
    if (r.Orientation) fileFields.push({ key: 'ori', label: 'Orientation', value: formatValue(r.Orientation) });
    if (fileFields.length) categories.push({ label: 'File Info', icon: '🗂️', fields: fileFields });

    const rawCount = Object.keys(r).length;
    const hasGps = !!gpsCoords;

    return { categories, hasGps, rawCount, raw: r };
  } catch {
    return null;
  }
}
