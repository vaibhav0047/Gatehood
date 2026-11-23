import Papa from 'papaparse';
import { Buyer, CSVImportResult } from '../types';
import { generateInviteCode } from './codeGenerator';

export function parseBuyersCSV(csvContent: string): CSVImportResult {
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase().replace(/[\s_-]+/g, ''),
  });

  const errors: string[] = [];
  const buyers: Buyer[] = [];
  const seenUnits = new Set<string>();

  const rows = parseResult.data as Record<string, string>[];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Accounting for 1-based index and header row

    // Resolve column aliases
    const tower = row.tower || row.towername || row.block || row.building || '';
    const unit = row.unit || row.unitno || row.flat || row.flatno || row.apartment || '';
    const name = row.name || row.buyername || row.customername || row.buyer || '';
    const phone = row.phone || row.mobile || row.contact || row.phonenumber || '';
    const config = row.configuration || row.config || row.type || '3BHK Premium';
    const progress = row.progress ? parseInt(row.progress, 10) : 68;

    if (!tower.trim() || !unit.trim() || !name.trim() || !phone.trim()) {
      errors.push(`Row ${rowNum}: Missing required fields (tower, unit, name, or phone).`);
      return;
    }

    const cleanUnit = unit.trim().toUpperCase();
    if (seenUnits.has(cleanUnit)) {
      errors.push(`Row ${rowNum}: Duplicate unit "${cleanUnit}" skipped.`);
      return;
    }
    seenUnits.add(cleanUnit);

    const now = Date.now();
    // 30 days default expiration for invite codes
    const inviteExpiresAt = now + 30 * 24 * 60 * 60 * 1000;

    const buyer: Buyer = {
      id: cleanUnit,
      name: name.trim(),
      phone: phone.trim(),
      tower: tower.trim(),
      unit: cleanUnit,
      configuration: config.trim(),
      progressPercent: isNaN(progress) ? 68 : Math.min(100, Math.max(0, progress)),
      possessionDate: '2027-06-30',
      inviteCode: generateInviteCode(cleanUnit),
      inviteStatus: 'pending',
      inviteExpiresAt,
      joinedAt: null,
      createdAt: now,
    };

    buyers.push(buyer);
  });

  return {
    success: buyers.length > 0,
    totalRows: rows.length,
    importedCount: buyers.length,
    skippedCount: rows.length - buyers.length,
    errors,
    buyers,
  };
}
