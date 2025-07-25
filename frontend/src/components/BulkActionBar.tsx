import React from 'react';
import { Trash2, Download, ShieldAlert, AlertTriangle, FileText, CheckCircle, Info, ChevronDown } from 'lucide-react';

export interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onChangeStatus: (status: string) => void;
}

const statuses = [
  { label: 'Critical', value: 'critical', icon: ShieldAlert },
  { label: 'High', value: 'high', icon: AlertTriangle },
  { label: 'Medium', value: 'medium', icon: FileText },
  { label: 'Low', value: 'low', icon: CheckCircle },
  { label: 'Info', value: 'informational', icon: Info },
];

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onDelete, onExport, onChangeStatus }) => {
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 rounded shadow-lg px-6 py-3 flex items-center gap-4 min-w-[350px]">
      <span className="font-medium text-sm text-textPrimary">{selectedCount} selected</span>
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-status-critical text-white text-xs font-semibold hover:bg-status-critical/90 transition"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" /> Delete Selected
      </button>
      <div className="relative">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition"
          onClick={() => setStatusMenuOpen(v => !v)}
        >
          <ShieldAlert className="w-4 h-4" /> Change Status <ChevronDown className="w-4 h-4" />
        </button>
        {statusMenuOpen && (
          <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded shadow-lg py-1 w-44 z-50">
            {statuses.map(status => (
              <button
                key={status.value}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-primary/10 focus:bg-primary/20 focus:outline-none transition text-left"
                onClick={() => { setStatusMenuOpen(false); onChangeStatus(status.label); }}
              >
                <status.icon className="w-4 h-4" /> {status.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-background border border-gray-200 text-xs font-semibold text-textPrimary hover:bg-gray-50 transition"
        onClick={onExport}
      >
        <Download className="w-4 h-4" /> Export as JSON
      </button>
    </div>
  );
};

export default BulkActionBar; 