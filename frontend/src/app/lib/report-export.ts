import { formatCurrency, formatDate, formatDuration } from './utils';
import {
  getCompletedRides,
  getRevenueMetrics,
  type InstituteData,
  type RideHistoryRecord,
} from './admin-data';
export type ReportFormat = 'pdf' | 'csv' | 'excel';
const formatName: Record<ReportFormat, string> = {
  pdf: 'PDF',
  csv: 'CSV',
  excel: 'Excel',
};
const reportFileName = (institute: InstituteData, format: ReportFormat) => {
  const slug = institute.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const stamp = new Date().toISOString().slice(0, 10);
  const extension = format === 'excel' ? 'xls' : format;
  return `${slug || 'institute'}-quickped-report-${stamp}.${extension}`;
};
const downloadBlob = (content: BlobPart, mimeType: string, fileName: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
const csvEscape = (value: string | number | undefined) => {
  const text = value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};
const addCsvSection = (rows: string[][], title: string, items: Array<Array<string | number | undefined>>) => {
  rows.push([title]);
  rows.push(...items.map((item) => item.map((value) => String(value ?? ''))));
  rows.push([]);
};
const getRideRows = (rides: RideHistoryRecord[]) =>
  rides.map((ride) => [
    ride.id,
    ride.user,
    ride.userPhone ?? '',
    ride.vehicleId,
    ride.startDock,
    ride.endDock,
    formatDuration(ride.duration),
    formatCurrency(ride.fare),
    formatDate(ride.completedAt),
    ride.status,
  ]);
const buildCsvReport = (institute: InstituteData) => {
  const metrics = getRevenueMetrics(institute);
  const completedRides = getCompletedRides(institute.rideHistory);
  const rows: string[][] = [];
  addCsvSection(rows, 'Institute Information', [
    ['Name', institute.name],
    ['Total Docks', institute.docks.length],
    ['Total Vehicles', institute.vehicles.length],
    ['Vehicle Types', institute.vehicleTypes.join(', ')],
  ]);
  addCsvSection(rows, 'Revenue', [
    ['Daily Revenue', formatCurrency(metrics.daily)],
    ['Weekly Revenue', formatCurrency(metrics.weekly)],
    ['Monthly Revenue', formatCurrency(metrics.monthly)],
    ['Total Revenue', formatCurrency(metrics.total)],
  ]);
  addCsvSection(rows, 'Ride History', [
    ['Ride ID', 'User', 'Phone', 'Vehicle', 'Start Dock', 'End Dock', 'Duration', 'Fare', 'Completed At', 'Status'],
    ...getRideRows(completedRides),
  ]);
  addCsvSection(rows, 'Users', [
    ['Name', 'Phone', 'Email', 'Role', 'Joining Date', 'Institute', 'Ride Count', 'Wallet Balance'],
    ...institute.users.map((user) => [
      user.name,
      user.phone,
      user.email,
      user.role,
      user.memberSince,
      user.institute,
      user.totalRides,
      formatCurrency(user.walletBalance),
    ]),
  ]);
  addCsvSection(rows, 'Vehicles', [
    ['Vehicle ID', 'Type', 'Status', 'Battery', 'Dock', 'Location', 'Total Rides', 'Condition'],
    ...institute.vehicles.map((vehicle) => [
      vehicle.id,
      vehicle.type,
      vehicle.status,
      `${vehicle.battery}%`,
      vehicle.dockId,
      vehicle.location,
      vehicle.totalRides,
      vehicle.condition,
    ]),
  ]);
  addCsvSection(rows, 'Docks', [
    ['Dock ID', 'Name', 'Location', 'Campus', 'Spots', 'Occupied', 'Status'],
    ...institute.docks.map((dock) => [
      dock.id,
      dock.name,
      dock.location,
      dock.campus,
      dock.spots,
      dock.occupied,
      dock.status,
    ]),
  ]);
  addCsvSection(rows, 'Issue Reports', [
    ['Issue ID', 'Vehicle', 'Ride ID', 'User', 'Phone', 'Issue', 'Description', 'Reported At'],
    ...institute.issueReports.map((issue) => [
      issue.id,
      issue.vehicleId,
      issue.rideId ?? '',
      issue.user,
      issue.userPhone ?? '',
      issue.issueLabel,
      issue.description || 'No details',
      formatDate(issue.reportedAt),
    ]),
  ]);
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
};
const escapeHtml = (value: string | number | undefined) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const tableRows = (rows: Array<Array<string | number | undefined>>) =>
  rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
const buildExcelReport = (institute: InstituteData) => {
  const metrics = getRevenueMetrics(institute);
  const completedRides = getCompletedRides(institute.rideHistory);
  const sections = [
    {
      title: 'Institute Information',
      rows: [
        ['Name', institute.name],
        ['Total Docks', institute.docks.length],
        ['Total Vehicles', institute.vehicles.length],
        ['Vehicle Types', institute.vehicleTypes.join(', ')],
      ],
    },
    {
      title: 'Revenue',
      rows: [
        ['Daily Revenue', formatCurrency(metrics.daily)],
        ['Weekly Revenue', formatCurrency(metrics.weekly)],
        ['Monthly Revenue', formatCurrency(metrics.monthly)],
        ['Total Revenue', formatCurrency(metrics.total)],
      ],
    },
    {
      title: 'Ride History',
      rows: [
        ['Ride ID', 'User', 'Phone', 'Vehicle', 'Start Dock', 'End Dock', 'Duration', 'Fare', 'Completed At', 'Status'],
        ...getRideRows(completedRides),
      ],
    },
    {
      title: 'Users',
      rows: [
        ['Name', 'Phone', 'Email', 'Role', 'Joining Date', 'Institute', 'Ride Count', 'Wallet Balance'],
        ...institute.users.map((user) => [
          user.name,
          user.phone,
          user.email,
          user.role,
          user.memberSince,
          user.institute,
          user.totalRides,
          formatCurrency(user.walletBalance),
        ]),
      ],
    },
    {
      title: 'Vehicles',
      rows: [
        ['Vehicle ID', 'Type', 'Status', 'Battery', 'Dock', 'Location', 'Total Rides', 'Condition'],
        ...institute.vehicles.map((vehicle) => [
          vehicle.id,
          vehicle.type,
          vehicle.status,
          `${vehicle.battery}%`,
          vehicle.dockId,
          vehicle.location,
          vehicle.totalRides,
          vehicle.condition,
        ]),
      ],
    },
    {
      title: 'Docks',
      rows: [
        ['Dock ID', 'Name', 'Location', 'Campus', 'Spots', 'Occupied', 'Status'],
        ...institute.docks.map((dock) => [
          dock.id,
          dock.name,
          dock.location,
          dock.campus,
          dock.spots,
          dock.occupied,
          dock.status,
        ]),
      ],
    },
    {
      title: 'Issue Reports',
      rows: [
        ['Issue ID', 'Vehicle', 'Ride ID', 'User', 'Phone', 'Issue', 'Description', 'Reported At'],
        ...institute.issueReports.map((issue) => [
          issue.id,
          issue.vehicleId,
          issue.rideId ?? '',
          issue.user,
          issue.userPhone ?? '',
          issue.issueLabel,
          issue.description || 'No details',
          formatDate(issue.reportedAt),
        ]),
      ],
    },
  ];
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { font-size: 20px; }
      h2 { margin-top: 24px; font-size: 16px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
      td { border: 1px solid #cbd5e1; padding: 6px; font-size: 12px; }
      tr:first-child td { font-weight: bold; background: #eef2ff; }
    </style>
  </head>
  <body>
    <h1>QuickPed Complete Report - ${escapeHtml(institute.name)}</h1>
    ${sections.map((section) => `<h2>${escapeHtml(section.title)}</h2><table>${tableRows(section.rows)}</table>`).join('')}
  </body>
</html>`;
};
const pdfText = (value: string) =>
  value
    .replace(/₹/g, 'INR ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
const wrapLine = (line: string, maxLength = 86) => {
  if (line.length <= maxLength) return [line];
  const words = line.split(' ');
  const output: string[] = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) output.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) output.push(current);
  return output;
};
const buildPdfReport = (institute: InstituteData) => {
  const metrics = getRevenueMetrics(institute);
  const completedRides = getCompletedRides(institute.rideHistory);
  const lines = [
    `QuickPed Complete Report - ${institute.name}`,
    `Generated: ${formatDate(new Date())}`,
    '',
    'Institute Information',
    `Docks: ${institute.docks.length}`,
    `Vehicles: ${institute.vehicles.length}`,
    `Vehicle Types: ${institute.vehicleTypes.join(', ')}`,
    '',
    'Revenue',
    `Daily: ${formatCurrency(metrics.daily)}`,
    `Weekly: ${formatCurrency(metrics.weekly)}`,
    `Monthly: ${formatCurrency(metrics.monthly)}`,
    `Total: ${formatCurrency(metrics.total)}`,
    '',
    'Ride History',
    ...completedRides.flatMap((ride) => [
      `${ride.id} | ${ride.user} | ${ride.vehicleId} | ${formatDuration(ride.duration)} | ${formatCurrency(ride.fare)} | ${formatDate(ride.completedAt)}`,
      `${ride.startDock} to ${ride.endDock}`,
    ]),
    '',
    'Users',
    ...institute.users.map((user) => `${user.name} | ${user.phone} | ${user.role} | ${user.memberSince} | rides ${user.totalRides} | wallet ${formatCurrency(user.walletBalance)}`),
    '',
    'Vehicles',
    ...institute.vehicles.map((vehicle) => `${vehicle.id} | ${vehicle.type} | ${vehicle.status} | battery ${vehicle.battery}% | ${vehicle.location}`),
    '',
    'Docks',
    ...institute.docks.map((dock) => `${dock.id} | ${dock.name} | ${dock.location} | ${dock.occupied}/${dock.spots} | ${dock.status}`),
    '',
    'Issue Reports',
    ...(institute.issueReports.length
      ? institute.issueReports.map((issue) => `${issue.id} | ${issue.vehicleId} | ${issue.issueLabel} | ${issue.user} | ${formatDate(issue.reportedAt)} | ${issue.description || 'No details'}`)
      : ['No issue reports.']),
  ].flatMap((line) => wrapLine(line));
  const linesPerPage = 52;
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / linesPerPage)) }, (_, index) =>
    lines.slice(index * linesPerPage, (index + 1) * linesPerPage)
  );
  const fontObjectNumber = 3 + pages.length * 2;
  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const stream = pageLines
      .map((line, lineIndex) => `BT /F1 10 Tf 40 ${800 - lineIndex * 14} Td (${pdfText(line)}) Tj ET`)
      .join('\n');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};
export const downloadInstituteReport = (institute: InstituteData, format: ReportFormat) => {
  const fileName = reportFileName(institute, format);
  if (format === 'csv') {
    downloadBlob(buildCsvReport(institute), 'text/csv;charset=utf-8', fileName);
    return `${formatName[format]} report downloaded.`;
  }
  if (format === 'excel') {
    downloadBlob(buildExcelReport(institute), 'application/vnd.ms-excel;charset=utf-8', fileName);
    return `${formatName[format]} report downloaded.`;
  }
  downloadBlob(buildPdfReport(institute), 'application/pdf', fileName);
  return `${formatName[format]} report downloaded.`;
};
