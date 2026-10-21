import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StatusAlertProps {
  message: string;
  onRetry?: () => void;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="status-alert">
      <div className="alert-content">
        <AlertCircle size={20} className="alert-icon" />
        <p className="alert-message">{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
