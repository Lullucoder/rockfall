import React from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ExportReport: React.FC = () => {
  // Export dashboard as PDF snapshot
  const handleExportPDF = async () => {
    const dashboard = document.querySelector('.min-h-screen');
    if (!dashboard) return;
    const canvas = await html2canvas(dashboard as HTMLElement);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('rockfall-dashboard-report.pdf');
  };

  // Export data as CSV
  const handleExportCSV = () => {
    fetch('/data/sensor_timeseries.json')
      .then(res => res.json())
      .then(data => {
        const rows = [
          ['Sensor ID', 'Zone ID', 'Type', 'Timestamp', 'Value', 'Unit'],
        ];
        data.sensors.forEach((sensor: any) => {
          sensor.readings.forEach((reading: any) => {
            rows.push([
              sensor.sensor_id,
              sensor.zone_id,
              sensor.sensor_type,
              reading.timestamp,
              reading.value,
              reading.unit
            ]);
          });
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rockfall-sensor-data.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleExportPDF}
        className="btn-secondary flex items-center text-sm px-3 py-2"
        aria-label="Export dashboard as PDF"
      >
        <Download className="w-4 h-4 mr-1" /> PDF
      </button>
      <button
        onClick={handleExportCSV}
        className="btn-secondary flex items-center text-sm px-3 py-2"
        aria-label="Export sensor data as CSV"
      >
        <Download className="w-4 h-4 mr-1" /> CSV
      </button>
    </div>
  );
};
