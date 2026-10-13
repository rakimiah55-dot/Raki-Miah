import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ExternalLink, 
  FileText, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { PdfGenerationResult } from '../services/pdfReportGenerator';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfResult: PdfGenerationResult | null;
  onExportCsv: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfResult,
  onExportCsv,
}) => {
  if (!isOpen || !pdfResult) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfResult.blobUrl;
    link.download = pdfResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.open(pdfResult.blobUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    window.open(pdfResult.blobUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-800 text-white">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white">
                  {pdfResult.fileName}
                </h3>
                <span className="text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  Ready for Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Multi-Page PDF Document Generated
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportCsv}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Download raw data in CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">CSV Data</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Open full page PDF"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">New Tab</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 p-2 relative overflow-hidden flex flex-col">
          <iframe
            id="pdf-preview-iframe"
            src={`${pdfResult.blobUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full rounded-xl border border-slate-800 bg-white"
            title="PDF Document Preview"
          />
        </div>
      </div>
    </div>
  );
};
