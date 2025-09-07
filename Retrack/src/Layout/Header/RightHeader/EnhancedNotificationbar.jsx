import React, { useState, useEffect } from "react";
import SvgIcon from "../../../Components/Common/Component/SvgIcon";
import { CHECKALL, Notification } from "../../../Constant";
import TaskService from "../../../Services/task.service";
import meetingService from "../../../Services/meeting.service";
import { useUser } from "../../../contexts/UserContext";

const EnhancedNotificationbar = () => {
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Set up interval to refresh notifications every 5 minutes
      const interval = setInterval(loadNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [tasksResponse, meetingsResponse] = await Promise.all([
        TaskService.getAllTasks({ noPagination: true }),
        meetingService.getAllMeetings(),
      ]);

      const allNotifications = [];
      const now = new Date();

      // Process urgent tasks
      if (tasksResponse.Task) {
        const urgentTasks = tasksResponse.Task.filter(
          (task) =>
            task.priority === "High" &&
            task.status !== "Completed" &&
            task.assigned_to_email === user.email
        );

        urgentTasks.forEach((task) => {
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          const timeUntilDue = dueDate
            ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
            : null;

          let urgencyLevel = "normal";
          let message = `High priority task: ${task.title}`;

          if (timeUntilDue !== null) {
            if (timeUntilDue < 0) {
              urgencyLevel = "overdue";
              message = `OVERDUE: ${task.title}`;
            } else if (timeUntilDue <= 1) {
              urgencyLevel = "urgent";
              message = `Due today: ${task.title}`;
            } else if (timeUntilDue <= 3) {
              urgencyLevel = "warning";
              message = `Due in ${timeUntilDue} days: ${task.title}`;
            }
          }

          allNotifications.push({
            id: `task-${task.task_id}`,
            type: "task",
            urgency: urgencyLevel,
            title: message,
            description: task.description || "No description",
            dueDate: dueDate,
            timeUntilDue: timeUntilDue,
            taskId: task.task_id,
            priority: task.priority,
            status: task.status,
          });
        });
      }

      // Process upcoming meetings
      if (meetingsResponse.data) {
        const upcomingMeetings = meetingsResponse.data.filter((meeting) => {
          const meetingDate = new Date(meeting.meeting_date);
          const timeUntilMeeting = Math.ceil(
            (meetingDate - now) / (1000 * 60 * 60 * 24)
          );
          return timeUntilMeeting >= 0 && timeUntilMeeting <= 7; // Next 7 days
        });

        upcomingMeetings.forEach((meeting) => {
          const meetingDate = new Date(meeting.meeting_date);
          const timeUntilMeeting = Math.ceil(
            (meetingDate - now) / (1000 * 60 * 60 * 24)
          );

          let urgencyLevel = "normal";
          let message = `Meeting: ${meeting.meeting_title}`;

          if (timeUntilMeeting === 0) {
            urgencyLevel = "urgent";
            message = `Meeting today: ${meeting.meeting_title}`;
          } else if (timeUntilMeeting === 1) {
            urgencyLevel = "warning";
            message = `Meeting tomorrow: ${meeting.meeting_title}`;
          } else {
            message = `Meeting in ${timeUntilMeeting} days: ${meeting.meeting_title}`;
          }

          allNotifications.push({
            id: `meeting-${meeting.meeting_id}`,
            type: "meeting",
            urgency: urgencyLevel,
            title: message,
            description: meeting.meeting_description || "No description",
            meetingDate: meetingDate,
            timeUntilMeeting: timeUntilMeeting,
            meetingId: meeting.meeting_id,
            meetingTitle: meeting.meeting_title,
          });
        });
      }

      // Sort notifications by urgency and time
      allNotifications.sort((a, b) => {
        const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, normal: 3 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }

        if (a.type === "task" && b.type === "meeting") {
          return (a.timeUntilDue || 999) - (b.timeUntilMeeting || 999);
        }
        if (a.type === "meeting" && b.type === "task") {
          return (a.timeUntilMeeting || 999) - (b.timeUntilDue || 999);
        }

        return 0;
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type, urgency) => {
    if (type === "task") {
      return urgency === "overdue" ? "alert-triangle" : "check-square";
    } else if (type === "meeting") {
      return "calendar";
    }
    return "bell";
  };

  const getNotificationColor = (urgency) => {
    switch (urgency) {
      case "overdue":
        return "danger";
      case "urgent":
        return "warning";
      case "warning":
        return "info";
      default:
        return "primary";
    }
  };

  const getBorderColor = (urgency) => {
    switch (urgency) {
      case "overdue":
        return "b-l-danger";
      case "urgent":
        return "b-l-warning";
      case "warning":
        return "b-l-info";
      default:
        return "b-l-primary";
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffInHours = Math.ceil((date - now) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === "task") {
      // Navigate to task details or task list
      window.location.href = `/task-management`;
    } else if (notification.type === "meeting") {
      // Navigate to meeting details or meeting room
      window.location.href = `/meeting-management`;
    }
  };

  const notificationCount = notifications.length;

  return (
    <li className="onhover-dropdown">
      <div
        className="notification-box"
        onClick={() => setNotificationDropDown(!notificationDropDown)}
      >
        <SvgIcon iconId="notification" />
        {notificationCount > 0 && (
          <span
            className={`badge rounded-pill badge-${
              notificationCount > 5 ? "danger" : "secondary"
            }`}
          >
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </div>
      <div
        className={`notification-dropdown onhover-show-div ${
          notificationDropDown ? "active" : ""
        }`}
      >
        <h6 className="f-18 mb-0 dropdown-title">{Notification}</h6>
        {loading ? (
          <div className="text-center p-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          <ul>
            {notifications.slice(0, 10).map((notification, index) => (
              <li
                key={notification.id}
                className={`${getBorderColor(
                  notification.urgency
                )} border-4 cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center">
                  <SvgIcon
                    iconId={getNotificationIcon(
                      notification.type,
                      notification.urgency
                    )}
                    className={`me-2 text-${getNotificationColor(
                      notification.urgency
                    )}`}
                  />
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-medium">{notification.title}</p>
                    <p className="mb-0 small text-muted">
                      {notification.description}
                    </p>
                    <small
                      className={`text-${getNotificationColor(
                        notification.urgency
                      )}`}
                    >
                      {notification.type === "task"
                        ? notification.timeUntilDue < 0
                          ? "OVERDUE"
                          : formatTime(notification.dueDate)
                        : formatTime(notification.meetingDate)}
                    </small>
                  </div>
                </div>
              </li>
            ))}
            {notifications.length > 10 && (
              <li className="text-center">
                <small className="text-muted">
                  +{notifications.length - 10} more notifications
                </small>
              </li>
            )}
            <li>
              <a
                className="f-w-700"
                href="#javascript"
                onClick={(e) => {
                  e.preventDefault();
                  loadNotifications();
                }}
              >
                {CHECKALL}
              </a>
            </li>
          </ul>
        ) : (
          <div className="text-center p-3">
            <SvgIcon iconId="check-circle" className="text-success mb-2" />
            <p className="mb-0 text-muted">No notifications</p>
            <small className="text-muted">You're all caught up!</small>
          </div>
        )}
      </div>
    </li>
  );
};

export default EnhancedNotificationbar;
