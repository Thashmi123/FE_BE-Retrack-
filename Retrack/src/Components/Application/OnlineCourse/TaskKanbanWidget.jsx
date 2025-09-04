import React, { Fragment, useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import TaskService from "../../../Services/task.service";
import { useUser } from "../../../contexts/UserContext";

const TaskKanbanWidget = () => {
  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Load task counts from the backend
  useEffect(() => {
    loadTaskCounts();
  }, []);

  const loadTaskCounts = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getAllTasks({
        noPagination: true,
        assignedTo: user?.email || "",
      });

      // Count tasks by status
      const todoCount = response.Task.filter(
        (task) => task.status === "To Do"
      ).length;
      const inProgressCount = response.Task.filter(
        (task) => task.status === "IN PROGRESS"
      ).length;
      const doneCount = response.Task.filter(
        (task) => task.status === "DONE"
      ).length;

      setTaskCounts({
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
      });
    } catch (err) {
      setError(err.message || "Failed to load task counts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <H5>My Tasks</H5>
        </CardHeader>
        <CardBody>
          <div>Loading...</div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <H5>My Tasks</H5>
        </CardHeader>
        <CardBody>
          <div className="alert alert-danger">Error: {error}</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <H5>My Tasks</H5>
        </CardHeader>
        <CardBody>
          <div className="kanban-widget">
            <div className="kanban-widget-row">
              <div className="kanban-widget-column">
                <div className="kanban-widget-header bg-primary text-white">
                  <h6>To Do</h6>
                </div>
                <div className="kanban-widget-count">
                  <h3>{taskCounts.todo}</h3>
                </div>
              </div>
              <div className="kanban-widget-column">
                <div className="kanban-widget-header bg-warning text-white">
                  <h6>In Progress</h6>
                </div>
                <div className="kanban-widget-count">
                  <h3>{taskCounts.inProgress}</h3>
                </div>
              </div>
              <div className="kanban-widget-column">
                <div className="kanban-widget-header bg-success text-white">
                  <h6>Done</h6>
                </div>
                <div className="kanban-widget-count">
                  <h3>{taskCounts.done}</h3>
                </div>
              </div>
            </div>
            <div className="kanban-widget-footer mt-3">
              <a
                href="/components/application/kanbanboard"
                className="btn btn-primary btn-sm"
              >
                View Board
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      <style jsx>{`
        .kanban-widget-row {
          display: flex;
          justify-content: space-between;
        }

        .kanban-widget-column {
          flex: 1;
          text-align: center;
          margin: 0 5px;
        }

        .kanban-widget-header {
          padding: 10px;
          border-radius: 5px;
        }

        .kanban-widget-count {
          padding: 15px 0;
        }

        .kanban-widget-count h3 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }

        .kanban-widget-footer {
          text-align: center;
        }
      `}</style>
    </Fragment>
  );
};

export default TaskKanbanWidget;
