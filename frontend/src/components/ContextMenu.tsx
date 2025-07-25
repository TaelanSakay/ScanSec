import React from 'react';
import {
  Eye,
  Copy,
  Tag as TagIcon,
  Trash2,
  FileText,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';

export type ContextMenuAction =
  | 'view-details'
  | 'copy-file-path'
  | 'copy-vuln-info'
  | { tag: string }
  | { status: string }
  | 'delete';

export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: ContextMenuAction) => void;
  tags?: string[];
  statuses?: string[];
}

const defaultTags = ['Needs Review', 'False Positive', 'Exploit Available'];
const defaultStatuses = [
  { label: 'Critical', value: 'critical', icon: ShieldAlert },
  { label: 'High', value: 'high', icon: AlertTriangle },
  { label: 'Medium', value: 'medium', icon: FileText },
  { label: 'Low', value: 'low', icon: CheckCircle },
  { label: 'Info', value: 'informational', icon: Info },
];

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction, tags = defaultTags, statuses = defaultStatuses.map(s => s.label) }) => {
  const [submenu, setSubmenu] = React.useState<'tag' | 'status' | null>(null);
  // Remove Popover entirely if linter error persists
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg py-1 w-56 text-sm"
      style={{ left: x, top: y }}
      onMouseLeave={onClose}
      tabIndex={-1}
    >
      {/* Main menu */}
      {!submenu && (
        <>
          <MenuItem icon={<Eye className="w-4 h-4" />} label="View Details" onClick={() => onAction('view-details')} />
          <MenuItem icon={<Copy className="w-4 h-4" />} label="Copy File Path" onClick={() => onAction('copy-file-path')} />
          <MenuItem icon={<FileText className="w-4 h-4" />} label="Copy Vulnerability Info" onClick={() => onAction('copy-vuln-info')} />
          <MenuItem
            icon={<TagIcon className="w-4 h-4" />}
            label="Tag"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => setSubmenu('tag')}
          />
          <MenuItem
            icon={<ShieldAlert className="w-4 h-4" />}
            label="Change Status"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => setSubmenu('status')}
          />
          <MenuItem icon={<Trash2 className="w-4 h-4 text-status-critical" />} label={<span className="text-status-critical">Delete</span>} onClick={() => onAction('delete')} />
        </>
      )}
      {/* Tag submenu */}
      {submenu === 'tag' && (
        <div>
          <MenuItem label="< Back" onClick={() => setSubmenu(null)} />
          {tags.map(tag => (
            <MenuItem key={tag} icon={<TagIcon className="w-4 h-4" />} label={tag} onClick={() => onAction({ tag })} />
          ))}
        </div>
      )}
      {/* Status submenu */}
      {submenu === 'status' && (
        <div>
          <MenuItem label="< Back" onClick={() => setSubmenu(null)} />
          {defaultStatuses.map(status => (
            <MenuItem
              key={status.value}
              icon={<status.icon className="w-4 h-4" />}
              label={status.label}
              onClick={() => onAction({ status: status.label })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MenuItemProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, rightIcon, onClick }) => (
  <button
    className="flex items-center w-full px-4 py-2 gap-2 hover:bg-primary/10 focus:bg-primary/20 focus:outline-none transition text-left"
    onClick={onClick}
    tabIndex={0}
    type="button"
  >
    {icon && <span>{icon}</span>}
    <span className="flex-1">{label}</span>
    {rightIcon && <span>{rightIcon}</span>}
  </button>
);

export default ContextMenu; 