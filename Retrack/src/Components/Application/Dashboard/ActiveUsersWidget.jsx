import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Badge,
} from "reactstrap";
import { H5 } from "../../../AbstractElements";
import UserService from "../../../Services/user.service";
import { Link } from "react-router-dom";

const ActiveUsersWidget = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveUsers();
  }, []);

  const loadActiveUsers = async () => {
    try {
      setLoading(true);
      console.log("Loading active users from UserMGT API...");
      const response = await UserService.getAllUsers();
      console.log("Users response:", response);

      if (response.success && response.users && response.users.length > 0) {
        // Get all users and take first 5 (since we don't have online status from API)
        const allUsers = response.users.slice(0, 5).map((user) => ({
          id: user.ID || user.id,
          name:
            user.Name ||
            user.name ||
            `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
          email: user.Email || user.email,
          online: Math.random() > 0.3, // Simulate online status since API doesn't provide it
          firstName: user.FirstName || user.firstName,
          lastName: user.LastName || user.lastName,
        }));
        console.log("Loaded users from API:", allUsers);
        setActiveUsers(allUsers);
      } else {
        console.log("No users found in API response, using fallback data");
        // Use demo users as fallback
        const demoUsers = UserService.getDemoUsers();
        setActiveUsers(demoUsers.slice(0, 5));
      }
    } catch (err) {
      console.error("Error loading active users:", err);
      // Use demo users as fallback when API fails
      const demoUsers = UserService.getDemoUsers();
      setActiveUsers(demoUsers.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserStatus = (user) => {
    if (user.online) {
      return { color: "success", text: "Online" };
    } else if (user.lastSeen) {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

      if (diffInMinutes < 5) {
        return { color: "warning", text: "Just now" };
      } else if (diffInMinutes < 60) {
        return { color: "info", text: `${diffInMinutes}m ago` };
      } else {
        return { color: "secondary", text: "Offline" };
      }
    } else {
      return { color: "secondary", text: "Offline" };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Online":
        return "success";
      case "Just now":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="active-users-widget border-0 shadow-sm">
      <CardHeader className="card-no-border bg-fluent-neutral text-white">
        <div className="header-top">
          <H5 className="text-white mb-0">
            <i className="fa fa-users me-2"></i>Active Users
          </H5>
          <Link
            to="/components/application/users/users-edit"
            className="btn btn-sm btn-light"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {loading ? (
          <div className="text-center py-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading users...</p>
          </div>
        ) : activeUsers.length > 0 ? (
          <ListGroup flush>
            {activeUsers.map((user) => {
              const status = getUserStatus(user);
              const initials = getUserInitials(user.name || user.Name);

              return (
                <ListGroupItem
                  key={user.id || user.ID}
                  className="d-flex justify-content-between align-items-center px-0 border-0 mb-2"
                >
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-3 position-relative">
                      <div
                        className="avatar-title bg-primary rounded-circle text-white fw-bold"
                        style={{
                          background: user.online
                            ? "var(--theme-deafult)"
                            : "var(--theme-secondary)",
                        }}
                      >
                        {initials}
                      </div>
                      <div
                        className={`position-absolute rounded-circle ${
                          user.online
                            ? "bg-fluent-success"
                            : "bg-fluent-neutral"
                        }`}
                        style={{
                          width: "12px",
                          height: "12px",
                          bottom: "0",
                          right: "0",
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px #fff",
                        }}
                      ></div>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold text-body">
                        {user.name || user.Name || "Unknown User"}
                      </h6>
                      <p className="mb-0 small text-muted">
                        <i className="fa fa-envelope me-1"></i>
                        {user.email || user.Email || "No email"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    color={getStatusColor(status.text)}
                    size="sm"
                    className="fw-bold"
                  >
                    {status.text}
                  </Badge>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No active users</p>
            <Link
              to="/components/application/users/users-edit"
              className="btn btn-sm btn-primary"
            >
              View Users
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ActiveUsersWidget;
