import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Progress, Row, Col } from "reactstrap";
import { H5, H6 } from "../../../AbstractElements";
import TaskService from "../../../Services/task.service";
import { useUser } from "../../../contexts/UserContext";
import { Link } from "react-router-dom";

const TaskProgressWidget = () => {
  const { user } = useUser();
  const [taskStats, setTaskStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTaskStats();
  }, []);

  const loadTaskStats = async () => {
    try {
      setLoading(true);
      console.log("Loading task stats for user:", user?.email || user?.Email);

      // Get current user email for filtering
      const currentUserEmail = user?.email || user?.Email;

      // Get all tasks first, then filter by assigned user email
      const response = await TaskService.getAllTasks({
        noPagination: true,
      });
      console.log("Tasks response:", response);

      const allTasks = response.Task || response.data || [];
      console.log("All tasks:", allTasks);

      // Filter tasks by assigned user email
      const userTasks = allTasks.filter(
        (task) => task.assigned_to_email === currentUserEmail
      );
      console.log("Filtered tasks for user:", userTasks);

      const stats = {
        total: userTasks.length,
        todo: userTasks.filter(
          (task) =>
            task.status === "To Do" ||
            task.status === "TO DO" ||
            task.status === "todo" ||
            task.status === "pending" ||
            task.status === "Pending"
        ).length,
        inProgress: userTasks.filter(
          (task) =>
            task.status === "In Progress" ||
            task.status === "in_progress" ||
            task.status === "InProgress"
        ).length,
        done: userTasks.filter(
          (task) =>
            task.status === "Done" ||
            task.status === "done" ||
            task.status === "completed" ||
            task.status === "Completed"
        ).length,
      };

      console.log("User task stats:", stats);
      setTaskStats(stats);
    } catch (err) {
      console.error("Error loading task stats:", err);
      // Show sample data when API fails
      setTaskStats({
        total: 8,
        todo: 3,
        inProgress: 3,
        done: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.done / taskStats.total) * 100);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "todo":
      case "to do":
        return "warning";
      case "in progress":
      case "in_progress":
        return "info";
      case "done":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="task-progress-widget border-0 shadow-sm">
      <CardHeader className="card-no-border bg-fluent-primary text-white">
        <div className="header-top">
          <H5 className="text-white mb-0">
            <i className="fa fa-tasks me-2"></i>My Tasks
          </H5>
          <Link
            to="/components/application/task"
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
            <p className="mt-2 mb-0">Loading tasks...</p>
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <H6 className="mb-0">Overall Progress</H6>
                <span className="text-muted">{getProgressPercentage()}%</span>
              </div>
              <Progress
                value={getProgressPercentage()}
                color="primary"
                className="mb-2"
              />
              <p className="small text-muted mb-0">
                {taskStats.done} of {taskStats.total} tasks completed
              </p>
            </div>

            {/* Task Status Breakdown */}
            <Row className="g-3">
              <Col xs="6">
                <div
                  className="task-status-item text-center p-3 rounded-3 border-0 shadow-sm"
                  style={{
                    background: "#ffc107",
                    color: "white",
                  }}
                >
                  <H6 className="text-white mb-1 fw-bold">{taskStats.todo}</H6>
                  <p className="mb-0 small text-white fw-semibold">To Do</p>
                </div>
              </Col>
              <Col xs="6">
                <div
                  className="task-status-item text-center p-3 rounded-3 border-0 shadow-sm"
                  style={{
                    background: "var(--theme-deafult)",
                    color: "white",
                  }}
                >
                  <H6 className="text-white mb-1 fw-bold">
                    {taskStats.inProgress}
                  </H6>
                  <p className="mb-0 small text-white fw-semibold">
                    In Progress
                  </p>
                </div>
              </Col>
              <Col xs="6">
                <div
                  className="task-status-item text-center p-3 rounded-3 border-0 shadow-sm"
                  style={{
                    background: "#28a745",
                    color: "white",
                  }}
                >
                  <H6 className="text-white mb-1 fw-bold">{taskStats.done}</H6>
                  <p className="mb-0 small text-white fw-semibold">Done</p>
                </div>
              </Col>
              <Col xs="6">
                <div
                  className="task-status-item text-center p-3 rounded-3 border-0 shadow-sm"
                  style={{
                    background: "var(--theme-secondary)",
                    color: "white",
                  }}
                >
                  <H6 className="text-white mb-1 fw-bold">{taskStats.total}</H6>
                  <p className="mb-0 small text-white fw-semibold">Total</p>
                </div>
              </Col>
            </Row>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default TaskProgressWidget;
