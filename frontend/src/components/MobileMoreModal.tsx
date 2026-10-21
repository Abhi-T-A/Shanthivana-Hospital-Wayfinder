import React from 'react';
import { X, ShieldCheck, Compass, Building2, Phone } from 'lucide-react';

interface MobileMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceStatus: string;
  dbStatus: string;
  totalDestinations: number;
}

export const MobileMoreModal: React.FC<MobileMoreModalProps> = ({
  isOpen,
  onClose,
  serviceStatus,
  dbStatus,
  totalDestinations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-modal-backdrop" onClick={onClose}>
      <div className="mobile-more-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="m-sheet-header-row">
          <div className="m-sheet-title-group">
            <Compass size={20} className="text-emerald-700" />
            <h2 className="m-more-sheet-title">About Shanthivana Wayfinder</h2>
          </div>
          <button
            type="button"
            className="m-sheet-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="m-more-body">
          <div className="m-more-card">
            <Building2 size={24} className="text-emerald-800 mb-2" />
            <h3 className="font-bold text-slate-900">S.D.M. Hospital Campus</h3>
            <p className="text-xs text-slate-600 mt-1">
              Shanthivana Nature Cure Centre & Hospital, Dharmasthala, Karnataka.
            </p>
          </div>

          <div className="m-more-status-box">
            <div className="m-status-row">
              <span className="text-xs text-slate-500">FastAPI Service:</span>
              <span className="text-xs font-semibold text-emerald-700">{serviceStatus}</span>
            </div>
            <div className="m-status-row">
              <span className="text-xs text-slate-500">Database:</span>
              <span className="text-xs font-semibold text-emerald-700">{dbStatus}</span>
            </div>
            <div className="m-status-row">
              <span className="text-xs text-slate-500">Active Destinations:</span>
              <span className="text-xs font-semibold text-slate-900">{totalDestinations}</span>
            </div>
          </div>

          <div className="m-more-notice">
            <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Campus walking pathway survey is underway. Real-time GPS coordinates ensure visitor safety without fabricated pathways.
            </p>
          </div>

          <div className="m-contact-help">
            <Phone size={16} className="text-slate-500" />
            <span className="text-xs text-slate-600">
              For assistance, visit the Main Hospital A Block Reception desk.
            </span>
          </div>

          <button
            type="button"
            className="m-btn-more-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
