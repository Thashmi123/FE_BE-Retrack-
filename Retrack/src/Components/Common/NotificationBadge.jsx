import React, { useContext } from "react";
import ChatAppContext from "../../_helper/Chat";

const NotificationBadge = ({ className = "", style = {} }) => {
  const { getTotalUnreadCount } = useContext(ChatAppContext);

  const totalUnread = getTotalUnreadCount ? getTotalUnreadCount() : 0;

  if (totalUnread === 0) return null;

  return (
    <span
      className={`badge bg-danger rounded-pill position-absolute ${className}`}
      style={{
        top: "-8px",
        right: "-8px",
        fontSize: "0.7rem",
        minWidth: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {totalUnread > 99 ? "99+" : totalUnread}
    </span>
  );
};

export default NotificationBadge;
