import React, { useContext } from "react";
import { useMessage } from "../../contexts/MessageContext";

const SSEStatusIndicator = () => {
  const { sseConnected, sseReconnectAttempts, error } = useMessage();

  if (!sseConnected && sseReconnectAttempts === 0) {
    return null; // Don't show anything if not connected and no attempts made
  }

  const getStatusClass = () => {
    if (sseConnected) return "connected";
    if (sseReconnectAttempts > 0) return "reconnecting";
    return "disconnected";
  };

  const getStatusText = () => {
    if (sseConnected) return "Connected";
    if (sseReconnectAttempts > 0)
      return `Reconnecting... (${sseReconnectAttempts})`;
    return "Disconnected";
  };

  return (
    <div className="sse-status">
      <div className="d-flex align-items-center">
        <span className={`status-indicator ${getStatusClass()}`}></span>
        <small className="text-muted">{getStatusText()}</small>
        {error && (
          <small className="text-danger ms-2" title={error}>
            ⚠️
          </small>
        )}
      </div>
    </div>
  );
};

export default SSEStatusIndicator;
