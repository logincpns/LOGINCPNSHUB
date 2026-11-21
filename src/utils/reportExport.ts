import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ReportOrientation = 'auto' | 'portrait' | 'landscape';
export type ResolvedOrientation = 'portrait' | 'landscape';
export type ReportPaperSize = 'A4' | 'F4';

export interface ReportSummaryItem {
  label: string;
  value: string;
}

export interface ReportDetailItem {
  label: string;
  value: string;
}

export interface ReportBrandInfo {
  appName?: string;
  tagline?: string;
  subTagline?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  promoInfo?: string;
  websiteInfo?: string;
}

export interface ReportExportOptions {
  orientation?: ReportOrientation;
  paperSize?: ReportPaperSize;
  summaryCards?: ReportSummaryItem[];
  detailRows?: ReportDetailItem[];
  brandInfo?: ReportBrandInfo;
  subtitle?: string;
  title?: string;
}

const DEFAULT_BRAND: Required<ReportBrandInfo> = {
  appName: 'LOGIN CPNS',
  tagline: 'BIMBEL SKD & SIMULASI CAT',
  subTagline: 'Lembaga Bimbingan Belajar Mandiri · Bank Soal HOTS & Tryout Akbar CPNS',
  whatsapp: '0813-1213-9893',
  email: 'loginbimbelasn@gmail.com',
  address: 'Kampung Jawa, Blangkejeren, Kab. Gayo Lues, Aceh',
  promoInfo:
    'Layanan Bimbel: Simulasi CAT 110 Soal · Tryout Bareng Nasional · Bimbel Zoom Malam · Kalkulator SKD & SKB · Paket Mulai Rp 150.000',
  websiteInfo: 'Bimbel Mandiri Independen · Info Paket & Jadwal Hubungi Admin Blangkejeren'
};

let cachedLogoDataUrl: string | null = null;

function mergeBrand(brand?: ReportBrandInfo): Required<ReportBrandInfo> {
  return {
    appName: brand?.appName || DEFAULT_BRAND.appName,
    tagline: brand?.tagline || DEFAULT_BRAND.tagline,
    subTagline: brand?.subTagline || DEFAULT_BRAND.subTagline,
    whatsapp: brand?.whatsapp || DEFAULT_BRAND.whatsapp,
    email: brand?.email || DEFAULT_BRAND.email,
    address: brand?.address || DEFAULT_BRAND.address,
    promoInfo: brand?.promoInfo || DEFAULT_BRAND.promoInfo,
    websiteInfo: brand?.websiteInfo || DEFAULT_BRAND.websiteInfo
  };
}

export function resolveReportOrientation(
  mode: ReportOrientation | undefined,
  paperSize: ReportPaperSize | undefined,
  headers: string[],
  rows: (string | number)[][]
): ResolvedOrientation {
  if (mode === 'portrait' || mode === 'landscape') {
    return mode;
  }
  const colCount = headers.length;
  if (colCount >= 8) {
    return 'landscape';
  }
  const totalEstimatedChars = headers.reduce((sum, h, idx) => {
    let maxColLen = h.length;
    for (let r = 0; r < Math.min(rows.length, 25); r++) {
      const len = String(rows[r]?.[idx] ?? '').length;
      if (len > maxColLen) maxColLen = len;
    }
    return sum + Math.min(maxColLen, 34);
  }, 0);

  const portraitThreshold = paperSize === 'F4' ? 88 : 82;
  return totalEstimatedChars > portraitThreshold || colCount >= 7 ? 'landscape' : 'portrait';
}

async function loadLogoPngDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  try {
    const response = await fetch('/assets/aistudio/image_171e0b3e.png');
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const dataUrl = await new Promise<string>(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 220;
          canvas.height = 220;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, 220, 220);
            // Crop cleanly around the blue rounded-square monitor emblem (top ~70% of source image)
            const sx = img.width * 0.14;
            const sy = img.height * 0.02;
            const sw = img.width * 0.72;
            const sh = img.height * 0.69;
            ctx.drawImage(img, sx, sy, sw, sh, 8, 8, 204, 204);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
          URL.revokeObjectURL(objectUrl);
          resolve('');
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve('');
        };
        img.src = objectUrl;
      });
      if (dataUrl) {
        cachedLogoDataUrl = dataUrl;
        return dataUrl;
      }
    }
  } catch {
    // Fall back to crisp vector canvas emblem
  }

  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.roundRect(10, 10, 180, 180, 36);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 58px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LC', 100, 104);
    cachedLogoDataUrl = canvas.toDataURL('image/png');
    return cachedLogoDataUrl;
  }
  return '';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isNumericOrShortCol(header: string): boolean {
  const h = header.toLowerCase();
  return (
    h === 'rank' ||
    h === 'no' ||
    h.includes('peringkat') ||
    h === 'twk' ||
    h === 'tiu' ||
    h === 'tkp' ||
    h === 'umur' ||
    h.includes('total') ||
    h.includes('durasi') ||
    h.includes('waktu') ||
    h.includes('tanggal') ||
    h.includes('berlaku') ||
    h.includes('sisa') ||
    h.includes('status') ||
    h.includes('peran') ||
    h.includes('paket') ||
    h.includes('kuota') ||
    h.includes('poster') ||
    h.includes('bukti')
  );
}

function getColumnAlignment(header: string): 'left' | 'center' | 'right' {
  const h = header.toLowerCase();
  if (
    h === 'rank' ||
    h === 'no' ||
    h.includes('peringkat') ||
    h === 'twk' ||
    h === 'tiu' ||
    h === 'tkp' ||
    h === 'umur' ||
    h.includes('total') ||
    h.includes('status') ||
    h.includes('peran') ||
    h.includes('paket') ||
    h.includes('durasi') ||
    h.includes('waktu') ||
    h.includes('tanggal') ||
    h.includes('berlaku') ||
    h.includes('sisa') ||
    h.includes('poster') ||
    h.includes('bukti') ||
    h.includes('kuota') ||
    h.includes('referral')
  ) {
    return 'center';
  }
  return 'left';
}

function formatPrintedDateIndo(): string {
  return new Date().toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPaperLabel(paperSize: ReportPaperSize, orientation: ResolvedOrientation): string {
  const dim = paperSize === 'F4' ? 'F4 (215×330 mm)' : 'A4 (210×297 mm)';
  return `${dim} · ${orientation === 'landscape' ? 'Landscape' : 'Portrait'}`;
}

export async function exportTableToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][],
  options?: ReportExportOptions
) {
  const paperSize: ReportPaperSize = options?.paperSize || 'A4';
  const resolvedOrientation = resolveReportOrientation(options?.orientation, paperSize, headers, rows);
  const brand = mergeBrand(options?.brandInfo);
  const title = (options?.title || sheetName).toUpperCase();
  const subtitle = options?.subtitle || 'Laporan Platform Bimbel LOGIN CPNS';
  const colCount = Math.max(headers.length, 6);
  const lastColLetter = String.fromCharCode(64 + Math.min(colCount, 26));
  const splitCol = Math.max(2, Math.floor(colCount * 0.56));
  const rightStartCol = splitCol + 1;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LOGIN CPNS System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ showGridLines: true }],
    pageSetup: {
      paperSize: paperSize === 'F4' ? (14 as ExcelJS.PaperSize) : (9 as ExcelJS.PaperSize),
      orientation: resolvedOrientation,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.35,
        right: 0.35,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2
      }
    }
  });

  // Compute smart column widths first
  const colWidths = Array.from({ length: colCount }, (_, colIdx) => {
    const h = headers[colIdx] || '';
    const hl = h.toLowerCase();
    let maxLen = h.length;
    rows.forEach(r => {
      const val = String(r[colIdx] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    if (hl === 'no') return 7;
    if (hl === 'rank' || hl.includes('peringkat')) return 11;
    if (hl === 'umur') return 9;
    if (hl === 'twk' || hl === 'tiu' || hl === 'tkp') return 9;
    if (hl.includes('total')) return 12;
    if (hl.includes('hp') || hl.includes('whatsapp')) return 17;
    if (hl.includes('email')) return Math.min(Math.max(maxLen + 3, 24), 32);
    if (hl.includes('tanggal') || hl.includes('berlaku')) return 16;
    if (hl.includes('sisa')) return 20;
    if (hl.includes('status') || hl.includes('paket') || hl.includes('peran')) return 17;
    if (hl.includes('tau dari') || hl.includes('referral')) return 18;
    if (hl.includes('waktu') || hl.includes('durasi')) return 17;
    if (hl.includes('alamat') || hl.includes('instansi') || hl.includes('sesi') || hl.includes('ujian') || hl.includes('judul')) {
      return Math.min(Math.max(maxLen + 4, 26), 40);
    }
    if (hl.includes('pendidikan') || hl.includes('pekerjaan')) {
      return Math.min(Math.max(maxLen + 4, 20), 30);
    }
    if (hl.includes('nama')) {
      return Math.min(Math.max(maxLen + 4, 22), 30);
    }
    return Math.min(Math.max(maxLen + 5, 14), 32);
  });
  worksheet.columns = colWidths.map(w => ({ width: w }));

  // Load & place logo in top-left kop area
  const logoDataUrl = await loadLogoPngDataUrl();
  if (logoDataUrl) {
    const cleanBase64 = logoDataUrl.replace(/^data:image\/png;base64,/, '');
    const imageId = workbook.addImage({
      base64: cleanBase64,
      extension: 'png'
    });
    worksheet.addImage(imageId, {
      tl: { col: 0.15, row: 0.15 },
      ext: { width: 56, height: 56 }
    });
  }

  // ===== KOP SURAT FORMAL (Rows 1 - 4) =====
  worksheet.mergeCells(1, 2, 1, splitCol);
  worksheet.mergeCells(2, 2, 2, splitCol);
  worksheet.mergeCells(3, 2, 3, splitCol);

  if (rightStartCol <= colCount) {
    worksheet.mergeCells(1, rightStartCol, 1, colCount);
    worksheet.mergeCells(2, rightStartCol, 2, colCount);
    worksheet.mergeCells(3, rightStartCol, 3, colCount);
  }

  worksheet.mergeCells(4, 1, 4, colCount);

  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 18;
  worksheet.getRow(3).height = 22;
  worksheet.getRow(4).height = 26;

  const kopBrandCell = worksheet.getCell(1, 2);
  kopBrandCell.value = `${brand.appName} — ${brand.tagline}`;
  kopBrandCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };
  kopBrandCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  const kopSubCell = worksheet.getCell(2, 2);
  kopSubCell.value = brand.subTagline;
  kopSubCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF1E40AF' } };
  kopSubCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  const kopAddrCell = worksheet.getCell(3, 2);
  kopAddrCell.value = `Alamat: ${brand.address}`;
  kopAddrCell.font = { name: 'Calibri', size: 9, color: { argb: 'FF334155' } };
  kopAddrCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  if (rightStartCol <= colCount) {
    const rightWaCell = worksheet.getCell(1, rightStartCol);
    rightWaCell.value = `WA Admin: ${brand.whatsapp}`;
    rightWaCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
    rightWaCell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };

    const rightEmailCell = worksheet.getCell(2, rightStartCol);
    rightEmailCell.value = `Email: ${brand.email}`;
    rightEmailCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
    rightEmailCell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };

    const rightWebCell = worksheet.getCell(3, rightStartCol);
    rightWebCell.value = brand.websiteInfo;
    rightWebCell.font = { name: 'Calibri', size: 8.5, italic: true, color: { argb: 'FF475569' } };
    rightWebCell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
  }

  // Promo strip at bottom of Kop Surat with formal double bottom border
  const promoKopCell = worksheet.getCell(4, 1);
  promoKopCell.value = brand.promoInfo;
  promoKopCell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: 'FF1E3A8A' } };
  promoKopCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  promoKopCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  for (let c = 1; c <= colCount; c++) {
    worksheet.getCell(4, c).border = {
      top: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      bottom: { style: 'double', color: { argb: 'FF1E3A8A' } }
    };
  }

  // Blank spacer row 5
  worksheet.getRow(5).height = 8;

  // ===== CENTERED MERGED REPORT TITLE & SUBTITLE (Rows 6-7) =====
  worksheet.mergeCells(`A6:${lastColLetter}6`);
  worksheet.mergeCells(`A7:${lastColLetter}7`);
  worksheet.getRow(6).height = 24;
  worksheet.getRow(7).height = 18;

  const titleCell = worksheet.getCell('A6');
  titleCell.value = title;
  titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  const subCell = worksheet.getCell('A7');
  subCell.value = `${subtitle}  |  Dicetak: ${formatPrintedDateIndo()}  |  Format: ${formatPaperLabel(
    paperSize,
    resolvedOrientation
  )}`;
  subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  let currentRow = 8;
  worksheet.getRow(currentRow).height = 6;
  currentRow += 1;

  // ===== DETAIL SESI / PELAKSANAAN BOX (2 pairs per row) =====
  const detailRows = options?.detailRows || [];
  if (detailRows.length > 0) {
    const leftLabelEnd = Math.min(2, splitCol);
    const leftValStart = leftLabelEnd + 1;
    const leftValEnd = splitCol;
    const rightLabelStart = splitCol + 1;
    const rightLabelEnd = Math.min(rightLabelStart + 1, colCount);
    const rightValStart = rightLabelEnd + 1;

    for (let i = 0; i < detailRows.length; i += 2) {
      const leftItem = detailRows[i];
      const rightItem = detailRows[i + 1];
      const rowObj = worksheet.getRow(currentRow);
      rowObj.height = 20;

      // Left Pair
      if (leftLabelEnd >= 1) {
        if (leftLabelEnd > 1) worksheet.mergeCells(currentRow, 1, currentRow, leftLabelEnd);
        const lbl = worksheet.getCell(currentRow, 1);
        lbl.value = leftItem.label;
        lbl.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        lbl.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
      if (leftValStart <= leftValEnd) {
        if (leftValEnd > leftValStart) worksheet.mergeCells(currentRow, leftValStart, currentRow, leftValEnd);
        const val = worksheet.getCell(currentRow, leftValStart);
        val.value = leftItem.value;
        val.font = { name: 'Calibri', size: 9, bold: false, color: { argb: 'FF0F172A' } };
        val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        val.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      // Right Pair (or blank merged)
      if (rightLabelStart <= colCount) {
        if (rightItem && rightValStart <= colCount) {
          if (rightLabelEnd > rightLabelStart) {
            worksheet.mergeCells(currentRow, rightLabelStart, currentRow, rightLabelEnd);
          }
          const rLbl = worksheet.getCell(currentRow, rightLabelStart);
          rLbl.value = rightItem.label;
          rLbl.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
          rLbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          rLbl.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

          if (colCount > rightValStart) {
            worksheet.mergeCells(currentRow, rightValStart, currentRow, colCount);
          }
          const rVal = worksheet.getCell(currentRow, rightValStart);
          rVal.value = rightItem.value;
          rVal.font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' } };
          rVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
          rVal.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        } else {
          if (colCount > rightLabelStart) {
            worksheet.mergeCells(currentRow, rightLabelStart, currentRow, colCount);
          }
          const rEmpty = worksheet.getCell(currentRow, rightLabelStart);
          rEmpty.value = rightItem ? `${rightItem.label}: ${rightItem.value}` : '';
          rEmpty.font = { name: 'Calibri', size: 9, color: { argb: 'FF0F172A' } };
          rEmpty.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      }

      for (let c = 1; c <= colCount; c++) {
        worksheet.getCell(currentRow, c).border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      }
      currentRow += 1;
    }

    worksheet.getRow(currentRow).height = 8;
    currentRow += 1;
  }

  // ===== SUMMARY KPI CARDS ROW =====
  const summaryCards = options?.summaryCards || [];
  if (summaryCards.length > 0) {
    const chunkWidth = Math.max(1, Math.floor(colCount / summaryCards.length));
    const kpiRow = worksheet.getRow(currentRow);
    kpiRow.height = 24;

    summaryCards.forEach((card, idx) => {
      const startC = idx * chunkWidth + 1;
      const endC = idx === summaryCards.length - 1 ? colCount : Math.min(colCount, (idx + 1) * chunkWidth);
      if (startC <= colCount) {
        if (endC > startC) {
          worksheet.mergeCells(currentRow, startC, currentRow, endC);
        }
        const cell = worksheet.getCell(currentRow, startC);
        cell.value = `${card.label.toUpperCase()}: ${card.value}`;
        cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF1E3A8A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
    });

    for (let c = 1; c <= colCount; c++) {
      worksheet.getCell(currentRow, c).border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    }

    currentRow += 1;
    worksheet.getRow(currentRow).height = 8;
    currentRow += 1;
  }

  // ===== COLORED TABLE HEADER ROW =====
  const headerRowNumber = currentRow;
  const headerRow = worksheet.getRow(headerRowNumber);
  headerRow.height = 28;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } }
    };
  });
  currentRow += 1;

  // ===== DATA ROWS WITH FULL BORDERS, ZEBRA STRIPES & STATUS COLORING =====
  rows.forEach((row, rIdx) => {
    const dataRow = worksheet.getRow(currentRow);
    let maxWrappedLines = 1;

    row.forEach((val, cIdx) => {
      const h = headers[cIdx] || '';
      const hl = h.toLowerCase();
      const valStr = String(val ?? '');
      const colW = colWidths[cIdx] || 14;
      const estimatedLines = Math.max(1, Math.ceil(valStr.length / Math.max(1, colW - 3)));
      if (estimatedLines > maxWrappedLines) maxWrappedLines = estimatedLines;

      const cell = dataRow.getCell(cIdx + 1);
      cell.value = typeof val === 'number' ? val : valStr;

      const isEven = rIdx % 2 === 0;
      let fillHex = isEven ? 'FFFFFFFF' : 'FFF8FAFC';
      let fontColor = 'FF0F172A';
      let isBold = isNumericOrShortCol(h);

      if (valStr === 'LULUS PG') {
        fillHex = 'FFECFDF5';
        fontColor = 'FF047857';
        isBold = true;
      } else if (valStr.includes('TIDAK LULUS') || valStr.includes('BELUM LULUS')) {
        fillHex = 'FFFEF2F2';
        fontColor = 'FFB91C1C';
        isBold = true;
      } else if (hl.includes('total')) {
        fontColor = 'FF1D4ED8';
        isBold = true;
      } else if (hl === 'rank' || hl.includes('peringkat')) {
        isBold = true;
      }

      cell.font = { name: 'Calibri', size: 9.5, bold: isBold, color: { argb: fontColor } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillHex } };
      cell.alignment = {
        horizontal: getColumnAlignment(h),
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    dataRow.height = Math.max(21, maxWrappedLines * 14 + 7);
    currentRow += 1;
  });

  // Freeze at table header row
  worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber, showGridLines: true }];

  // Kop Bawah (Footer Dokumen)
  currentRow += 1;
  worksheet.mergeCells(currentRow, 1, currentRow, colCount);
  const footerRow1 = worksheet.getRow(currentRow);
  footerRow1.height = 20;
  const footerCell1 = worksheet.getCell(currentRow, 1);
  footerCell1.value = `${brand.appName} — ${brand.tagline} · Alamat: ${brand.address} · WA Admin: ${brand.whatsapp} · Email: ${brand.email}`;
  footerCell1.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: 'FF1E3A8A' } };
  footerCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  footerCell1.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  for (let c = 1; c <= colCount; c++) {
    worksheet.getCell(currentRow, c).border = {
      top: { style: 'double', color: { argb: 'FF1E3A8A' } }
    };
  }

  currentRow += 1;
  worksheet.mergeCells(currentRow, 1, currentRow, colCount);
  const footerRow2 = worksheet.getRow(currentRow);
  footerRow2.height = 18;
  const footerCell2 = worksheet.getCell(currentRow, 1);
  footerCell2.value =
    'Catatan: LOGIN CPNS adalah lembaga bimbingan belajar mandiri/swasta dan bukan merupakan instansi pemerintah atau perwakilan BKN.';
  footerCell2.font = { name: 'Calibri', size: 8, italic: true, color: { argb: 'FF64748B' } };
  footerCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  footerCell2.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  triggerDownload(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export async function exportTableToWord(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  options?: ReportExportOptions
) {
  const paperSize: ReportPaperSize = options?.paperSize || 'A4';
  const orientation = resolveReportOrientation(options?.orientation, paperSize, headers, rows);
  const brand = mergeBrand(options?.brandInfo);
  const logoDataUrl = await loadLogoPngDataUrl();

  const pageSizeCss =
    paperSize === 'F4'
      ? orientation === 'landscape'
        ? '33.0cm 21.5cm'
        : '21.5cm 33.0cm'
      : orientation === 'landscape'
        ? '29.7cm 21.0cm'
        : '21.0cm 29.7cm';

  const summaryCards = options?.summaryCards || [];
  const detailRows = options?.detailRows || [];

  // Build 2-column detail grid (2 label/value pairs per row)
  const detailPairsHtml =
    detailRows.length > 0
      ? (() => {
          const rowsHtml: string[] = [];
          for (let i = 0; i < detailRows.length; i += 2) {
            const left = detailRows[i];
            const right = detailRows[i + 1];
            rowsHtml.push(`
              <tr>
                <td style="width:18%;background:#f1f5f9;border:1px solid #cbd5e1;padding:5px 8px;font-size:8.5pt;font-weight:bold;color:#1e3a8a;">${escapeHtml(
                  left.label
                )}</td>
                <td style="width:32%;background:#ffffff;border:1px solid #cbd5e1;padding:5px 8px;font-size:8.5pt;color:#0f172a;">${escapeHtml(
                  left.value
                )}</td>
                ${
                  right
                    ? `
                  <td style="width:18%;background:#f1f5f9;border:1px solid #cbd5e1;padding:5px 8px;font-size:8.5pt;font-weight:bold;color:#1e3a8a;">${escapeHtml(
                    right.label
                  )}</td>
                  <td style="width:32%;background:#ffffff;border:1px solid #cbd5e1;padding:5px 8px;font-size:8.5pt;color:#0f172a;">${escapeHtml(
                    right.value
                  )}</td>
                `
                    : `<td colspan="2" style="background:#ffffff;border:1px solid #cbd5e1;padding:5px 8px;"></td>`
                }
              </tr>
            `);
          }
          return `
            <table style="width:100%;border-collapse:collapse;margin:0 0 10px 0;">
              ${rowsHtml.join('')}
            </table>
          `;
        })()
      : '';

  const summaryHtml =
    summaryCards.length > 0
      ? `
        <table style="width:100%;border-collapse:separate;border-spacing:6px 0;margin:0 0 12px 0;">
          <tr>
            ${summaryCards
              .map(
                c => `
                  <td style="background:#f8fafc;border:1px solid #cbd5e1;padding:7px 10px;text-align:center;">
                    <div style="font-size:7.5pt;color:#64748b;font-weight:bold;text-transform:uppercase;">${escapeHtml(
                      c.label
                    )}</div>
                    <div style="font-size:10.5pt;color:#0f172a;font-weight:bold;margin-top:2px;">${escapeHtml(
                      c.value
                    )}</div>
                  </td>
                `
              )
              .join('')}
          </tr>
        </table>
      `
      : '';

  const isDenseWord = headers.length >= 12;
  const wordColWeights = headers.map(h => {
    const hl = h.toLowerCase();
    if (hl === 'no') return 0.48;
    if (hl === 'rank' || hl.includes('peringkat')) return 0.72;
    if (hl === 'umur') return 0.58;
    if (hl === 'twk' || hl === 'tiu' || hl === 'tkp') return 0.65;
    if (hl.includes('total')) return 0.9;
    if (hl.includes('status') || hl.includes('paket') || hl.includes('peran')) return 1.05;
    if (hl.includes('sisa') || hl.includes('referral')) return 1.15;
    if (hl.includes('tgl') || hl.includes('tanggal') || hl.includes('berlaku') || hl.includes('waktu') || hl.includes('durasi')) return 1.05;
    if (hl.includes('hp') || hl.includes('whatsapp')) return 1.45;
    if (hl.includes('email')) return 2.05;
    if (hl.includes('pendidikan') || hl.includes('pekerjaan')) return 1.35;
    if (hl.includes('alamat')) return 1.7;
    if (hl.includes('instansi') || hl.includes('formasi')) return 1.85;
    if (hl.includes('nama') || hl.includes('mentor')) return 1.55;
    if (hl.includes('sesi') || hl.includes('ujian') || hl.includes('judul')) return 2.65;
    return 1.2;
  });
  const totalWordWeight = wordColWeights.reduce((acc, w) => acc + w, 0);
  const wordColGroup = `<colgroup>${wordColWeights
    .map(w => `<col style="width:${((w / totalWordWeight) * 100).toFixed(2)}%;" />`)
    .join('')}</colgroup>`;

  const headerCells = headers
    .map(h => {
      const align = getColumnAlignment(h);
      return `<th style="background-color:#1e40af;color:#ffffff;padding:${
        isDenseWord ? '5px 4px' : '7px 6px'
      };border:1px solid #1e3a8a;text-align:${align};font-size:${
        isDenseWord ? '7.8pt' : '9pt'
      };font-weight:bold;word-wrap:break-word;overflow-wrap:break-word;">${escapeHtml(h)}</th>`;
    })
    .join('');

  const bodyRows = rows
    .map((row, idx) => {
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = row
        .map((cell, cIdx) => {
          const valStr = String(cell ?? '');
          const align = getColumnAlignment(headers[cIdx] || '');
          let extraColor = '#0f172a';
          let extraWeight = isNumericOrShortCol(headers[cIdx] || '') ? '600' : 'normal';
          let cellBg = rowBg;
          if (valStr === 'LULUS PG' || valStr === 'ACTIVE') {
            extraColor = '#047857';
            extraWeight = 'bold';
            cellBg = '#ecfdf5';
          } else if (
            valStr.includes('TIDAK LULUS') ||
            valStr.includes('BELUM LULUS') ||
            valStr === 'INACTIVE'
          ) {
            extraColor = '#b91c1c';
            extraWeight = 'bold';
            cellBg = '#fef2f2';
          } else if ((headers[cIdx] || '').toLowerCase().includes('total')) {
            extraColor = '#1d4ed8';
            extraWeight = 'bold';
          }
          return `<td style="background-color:${cellBg};padding:${
            isDenseWord ? '4px 4px' : '6px 6px'
          };border:1px solid #cbd5e1;text-align:${align};font-size:${
            isDenseWord ? '7.5pt' : '8.5pt'
          };color:${extraColor};font-weight:${extraWeight};vertical-align:middle;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;">${escapeHtml(
            valStr
          )}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page Section1 {
            size: ${pageSizeCss};
            mso-page-orientation: ${orientation};
            margin: 1.2cm 1.2cm 1.2cm 1.2cm;
          }
          div.Section1 { page: Section1; }
          body { font-family: Calibri, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- KOP SURAT FORMAL -->
          <table style="width:100%;border-collapse:collapse;border-bottom:3px double #1e3a8a;margin-bottom:8px;">
            <tr>
              <td style="width:68px;vertical-align:middle;padding:4px 8px 8px 0;">
                ${
                  logoDataUrl
                    ? `<img src="${logoDataUrl}" width="58" height="58" alt="Logo LOGIN CPNS" style="display:block;border-radius:10px;" />`
                    : ''
                }
              </td>
              <td style="vertical-align:middle;padding:4px 8px 8px 4px;">
                <div style="font-size:15pt;font-weight:bold;color:#0f172a;letter-spacing:0.4px;line-height:1.15;">
                  ${escapeHtml(brand.appName)} &mdash; <span style="color:#1e40af;">${escapeHtml(brand.tagline)}</span>
                </div>
                <div style="font-size:8.5pt;font-weight:bold;color:#334155;margin-top:2px;">
                  ${escapeHtml(brand.subTagline)}
                </div>
                <div style="font-size:8.5pt;color:#475569;margin-top:2px;">
                  <strong>Alamat:</strong> ${escapeHtml(brand.address)}
                </div>
              </td>
              <td style="width:36%;vertical-align:middle;text-align:right;padding:4px 0 8px 8px;">
                <div style="font-size:9pt;font-weight:bold;color:#047857;">
                  WA Admin: ${escapeHtml(brand.whatsapp)}
                </div>
                <div style="font-size:8.5pt;font-weight:bold;color:#1e3a8a;margin-top:2px;">
                  Email: ${escapeHtml(brand.email)}
                </div>
                <div style="font-size:7.5pt;color:#475569;margin-top:3px;">
                  ${escapeHtml(brand.websiteInfo)}
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="background-color:#eff6ff;border-top:1px solid #bfdbfe;padding:5px 8px;text-align:center;font-size:8pt;font-weight:bold;color:#1e3a8a;">
                ${escapeHtml(brand.promoInfo)}
              </td>
            </tr>
          </table>

          <!-- JUDUL LAPORAN RATA TENGAH -->
          <div style="text-align:center;margin:10px 0 10px 0;">
            <div style="font-size:13.5pt;font-weight:bold;color:#0f172a;text-transform:uppercase;">
              ${escapeHtml(title)}
            </div>
            <div style="font-size:8.5pt;color:#475569;margin-top:3px;">
              ${escapeHtml(subtitle)} &nbsp;|&nbsp; Dicetak: ${escapeHtml(formatPrintedDateIndo())} &nbsp;|&nbsp; Kertas: ${escapeHtml(
    formatPaperLabel(paperSize, orientation)
  )}
            </div>
          </div>

          ${detailPairsHtml}
          ${summaryHtml}

          <!-- TABEL LAPORAN -->
          <table style="border-collapse:collapse;width:100%;table-layout:fixed;">
            ${wordColGroup}
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>

          <!-- KOP BAWAH & PENGESAHAN -->
          <div style="margin-top:18px;text-align:right;font-size:8.5pt;color:#334155;">
            <div>Blangkejeren, ${escapeHtml(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}</div>
            <div style="font-weight:bold;color:#0f172a;margin-top:2px;">Tim Pengelola ${escapeHtml(brand.appName)}</div>
          </div>
          <div style="margin-top:14px;border-top:2px solid #1e3a8a;background-color:#f8fafc;padding:8px 10px;text-align:center;">
            <div style="font-size:8pt;font-weight:bold;color:#1e3a8a;">
              ${escapeHtml(brand.appName)} &mdash; ${escapeHtml(brand.tagline)} &middot; Alamat: ${escapeHtml(brand.address)} &middot; WA Admin: ${escapeHtml(brand.whatsapp)} &middot; Email: ${escapeHtml(brand.email)}
            </div>
            <div style="font-size:7.5pt;color:#64748b;margin-top:2px;font-style:italic;">
              Catatan: LOGIN CPNS adalah lembaga bimbingan belajar mandiri/swasta dan bukan merupakan instansi pemerintah atau perwakilan BKN.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.doc') ? filename : `${filename}.doc`);
}

export async function exportTableToPdf(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  options?: ReportExportOptions
) {
  const paperSize: ReportPaperSize = options?.paperSize || 'A4';
  const orientation = resolveReportOrientation(options?.orientation, paperSize, headers, rows);
  const brand = mergeBrand(options?.brandInfo);
  const logoDataUrl = await loadLogoPngDataUrl();

  // F4 (Folio Indonesia): 215 mm × 330 mm = 609.45 pt × 935.43 pt
  const pdfFormat: 'a4' | [number, number] = paperSize === 'F4' ? [609.45, 935.43] : 'a4';

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: pdfFormat
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = orientation === 'portrait' ? 24 : 28;
  const contentWidth = pageWidth - marginX * 2;
  const isCompactPortrait = orientation === 'portrait' && headers.length >= 8;

  // ===== 1. KOP SURAT FORMAL (Logo Kiri + Judul Lembaga + Info Kontak & Alamat Kanan + Strip Promo) =====
  let cursorY = 20;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', marginX, cursorY + 2, 44, 44);
    } catch {
      // Ignore if image fails
    }
  }

  const leftTextX = marginX + 52;
  const rightBoxWidth = orientation === 'portrait' ? 190 : 250;
  const leftMaxWidth = contentWidth - 52 - rightBoxWidth - 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(orientation === 'portrait' ? 11.5 : 13.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${brand.appName} — ${brand.tagline}`, leftTextX, cursorY + 13, { maxWidth: leftMaxWidth });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text(brand.subTagline, leftTextX, cursorY + 26, { maxWidth: leftMaxWidth });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Alamat: ${brand.address}`, leftTextX, cursorY + 39, { maxWidth: leftMaxWidth });

  // Right Kop Info (WA Admin, Email, Info Official)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`WA Admin: ${brand.whatsapp}`, pageWidth - marginX, cursorY + 13, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(30, 58, 138);
  doc.text(`Email: ${brand.email}`, pageWidth - marginX, cursorY + 25, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text(brand.websiteInfo, pageWidth - marginX, cursorY + 37, { align: 'right', maxWidth: rightBoxWidth });

  cursorY += 50;

  // Promo strip inside Kop bottom
  doc.setFillColor(239, 246, 255);
  doc.rect(marginX, cursorY, contentWidth, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 58, 138);
  doc.text(brand.promoInfo, pageWidth / 2, cursorY + 10.5, { align: 'center', maxWidth: contentWidth - 12 });

  cursorY += 19;

  // Classic double formal kop divider line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1.8);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  doc.setLineWidth(0.6);
  doc.line(marginX, cursorY + 2.8, pageWidth - marginX, cursorY + 2.8);

  cursorY += 15;

  // ===== 2. JUDUL LAPORAN RATA TENGAH =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(orientation === 'portrait' ? 11.5 : 13);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), pageWidth / 2, cursorY, { align: 'center', maxWidth: contentWidth });

  cursorY += 13;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(71, 85, 105);
  const metaLine = `${subtitle}  |  Dicetak: ${formatPrintedDateIndo()}  |  Kertas: ${formatPaperLabel(
    paperSize,
    orientation
  )}`;
  doc.text(metaLine, pageWidth / 2, cursorY, { align: 'center', maxWidth: contentWidth });

  cursorY += 10;

  // ===== 3. INFORMASI DETAIL SESI / PELAKSANAAN =====
  const detailRows = options?.detailRows || [];
  if (detailRows.length > 0) {
    const detailBody: string[][] = [];
    for (let i = 0; i < detailRows.length; i += 2) {
      const left = detailRows[i];
      const right = detailRows[i + 1];
      detailBody.push([
        left.label,
        left.value,
        right ? right.label : '',
        right ? right.value : ''
      ]);
    }
    autoTable(doc, {
      body: detailBody,
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: orientation === 'portrait' ? 7.2 : 7.8,
        cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.5,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.17, fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 58, 138] },
        1: { cellWidth: contentWidth * 0.33, fillColor: [255, 255, 255] },
        2: { cellWidth: contentWidth * 0.17, fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 58, 138] },
        3: { cellWidth: contentWidth * 0.33, fillColor: [255, 255, 255] }
      }
    });
    const lastAuto = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    cursorY = (lastAuto?.finalY || cursorY) + 8;
  }

  // ===== 4. RINGKASAN KPI STRIP =====
  const summaryCards = options?.summaryCards || [];
  if (summaryCards.length > 0) {
    const gap = 7;
    const cardWidth = (contentWidth - gap * (summaryCards.length - 1)) / summaryCards.length;
    summaryCards.forEach((card, i) => {
      const cx = marginX + i * (cardWidth + gap);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.6);
      doc.roundedRect(cx, cursorY, cardWidth, 30, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label.toUpperCase(), cx + 7, cursorY + 11);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.8);
      doc.setTextColor(15, 23, 42);
      doc.text(card.value, cx + 7, cursorY + 24);
    });
    cursorY += 38;
  }

  // ===== 5. PROPORTIONAL COLUMN WIDTHS & TABEL LAPORAN =====
  const isDenseTable = headers.length >= 12;
  const columnWeights = headers.map(h => {
    const hl = h.toLowerCase();
    if (hl === 'no') return 0.5;
    if (hl === 'rank' || hl.includes('peringkat')) return 0.72;
    if (hl === 'umur') return 0.6;
    if (hl === 'twk' || hl === 'tiu' || hl === 'tkp') return 0.65;
    if (hl.includes('total')) return 0.9;
    if (hl.includes('status') || hl.includes('paket') || hl.includes('peran')) return 1.08;
    if (hl.includes('sisa') || hl.includes('referral')) return 1.2;
    if (hl.includes('waktu') || hl.includes('durasi') || hl.includes('tgl') || hl.includes('tanggal') || hl.includes('berlaku')) return 1.08;
    if (hl.includes('hp') || hl.includes('whatsapp')) return 1.55;
    if (hl.includes('tau dari')) return 1.1;
    if (hl.includes('jenis')) return 1.3;
    if (hl.includes('email')) return 2.15;
    if (hl.includes('pendidikan') || hl.includes('pekerjaan')) return 1.38;
    if (hl.includes('alamat')) return 1.72;
    if (hl.includes('instansi') || hl.includes('formasi')) return 1.88;
    if (hl.includes('nama') || hl.includes('mentor')) return 1.65;
    if (hl.includes('sesi') || hl.includes('ujian') || hl.includes('judul')) return 2.75;
    return 1.25;
  });
  const totalWeight = columnWeights.reduce((acc, w) => acc + w, 0);
  const columnStyles: Record<number, { cellWidth: number; halign: 'left' | 'center' | 'right' }> = {};
  headers.forEach((h, idx) => {
    columnStyles[idx] = {
      cellWidth: (columnWeights[idx] / totalWeight) * contentWidth,
      halign: getColumnAlignment(h)
    };
  });

  autoTable(doc, {
    head: [headers],
    body: rows.map(r => r.map(c => String(c ?? ''))),
    startY: cursorY,
    margin: { left: marginX, right: marginX, bottom: 44, top: 28 },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: isDenseTable ? 6.4 : isCompactPortrait ? 7 : orientation === 'portrait' ? 7.8 : 8.4,
      cellPadding: isDenseTable
        ? { top: 3.2, bottom: 3.2, left: 2.8, right: 2.8 }
        : isCompactPortrait
          ? { top: 3.5, bottom: 3.5, left: 3, right: 3 }
          : { top: 4.5, bottom: 4.5, left: 4.5, right: 4.5 },
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.6,
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: isDenseTable ? 6.6 : isCompactPortrait ? 7.2 : 8.4,
      lineColor: [30, 58, 138],
      lineWidth: 0.7,
      valign: 'middle',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles,
    didParseCell: data => {
      if (data.section === 'body') {
        const text = String(data.cell.raw || '');
        const colHeader = (headers[data.column.index] || '').toLowerCase();
        if (text === 'LULUS PG' || text === 'ACTIVE') {
          data.cell.styles.textColor = [4, 120, 87];
          data.cell.styles.fillColor = [236, 253, 245];
          data.cell.styles.fontStyle = 'bold';
        } else if (
          text.includes('TIDAK LULUS') ||
          text.includes('BELUM LULUS') ||
          text === 'INACTIVE' ||
          text.includes('Kedaluwarsa')
        ) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 242, 242];
          data.cell.styles.fontStyle = 'bold';
        } else if (colHeader.includes('total')) {
          data.cell.styles.textColor = [29, 78, 216];
          data.cell.styles.fontStyle = 'bold';
        } else if (colHeader === 'rank' || colHeader.includes('peringkat')) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: () => {
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(marginX, pageHeight - 36, pageWidth - marginX, pageHeight - 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.1);
      doc.setTextColor(30, 58, 138);
      doc.text(
        `${brand.appName} — ${brand.tagline} · ${brand.address} · WA Admin: ${brand.whatsapp} · Email: ${brand.email}`,
        marginX,
        pageHeight - 25
      );

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.6);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Catatan: LOGIN CPNS adalah lembaga bimbingan belajar mandiri/swasta dan bukan merupakan instansi pemerintah atau perwakilan BKN.',
        marginX,
        pageHeight - 14
      );
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Hal. ${p} / ${totalPages}`, pageWidth - marginX, pageHeight - 25, { align: 'right' });
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export function readAndCompressImageFile(file: File, maxWidth = 1100, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
