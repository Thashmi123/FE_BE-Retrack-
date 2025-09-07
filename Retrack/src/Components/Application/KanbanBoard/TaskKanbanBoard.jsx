import React, { Fragment, useState, useEffect } from "react";
import Board, { moveCard } from "@asseinfo/react-kanban";
import { Card, CardHeader, CardBody } from "reactstrap";
import { H5, H6, LI, P, UL } from "../../../AbstractElements";
import TaskService from "../../../Services/task.service";
import { useUser } from "../../../contexts/UserContext";

const TaskKanbanBoard = () => {
  const [board, setBoard] = useState({
    columns: [
      {
        id: 1,
        title: "Pending",
        cards: [],
      },
      {
        id: 2,
        title: "In Progress",
        cards: [],
      },
      {
        id: 3,
        title: "Completed",
        cards: [],
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Load tasks from the backend
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getAllTasks({ noPagination: true });

      // Group tasks by status
      const todoTasks = response.Task.filter(
        (task) => task.status === "Pending"
      );
      const inProgressTasks = response.Task.filter(
        (task) => task.status === "In Progress"
      );
      const doneTasks = response.Task.filter(
        (task) => task.status === "Completed"
      );

      // Transform tasks to kanban cards
      const todoCards = todoTasks.map((task) => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        date: new Date(task.due_date).toLocaleDateString(),
        priority: task.priority,
        status: task.status,
        assignedTo: task.assigned_to_name,
        tags: task.tags || [],
      }));

      const inProgressCards = inProgressTasks.map((task) => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        date: new Date(task.due_date).toLocaleDateString(),
        priority: task.priority,
        status: task.status,
        assignedTo: task.assigned_to_name,
        tags: task.tags || [],
      }));

      const doneCards = doneTasks.map((task) => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        date: new Date(task.due_date).toLocaleDateString(),
        priority: task.priority,
        status: task.status,
        assignedTo: task.assigned_to_name,
        tags: task.tags || [],
      }));

      setBoard({
        columns: [
          {
            id: 1,
            title: "Pending",
            cards: todoCards,
          },
          {
            id: 2,
            title: "In Progress",
            cards: inProgressCards,
          },
          {
            id: 3,
            title: "Completed",
            cards: doneCards,
          },
        ],
      });
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Handle card drag and drop
  const handleCardMove = async (card, source, destination) => {
    try {
      // Update the board state first for immediate feedback
      const updatedBoard = moveCard(board, source, destination);
      setBoard(updatedBoard);

      // Determine the new status based on the destination column
      let newStatus = "";
      if (destination.toColumnId === 1) newStatus = "Pending";
      else if (destination.toColumnId === 2) newStatus = "In Progress";
      else if (destination.toColumnId === 3) newStatus = "Completed";

      // Update the task status in the backend
      if (newStatus && card.status !== newStatus) {
        await TaskService.changeTaskStatus(card.id, newStatus);
      }
    } catch (err) {
      // Revert the board state if the backend update fails
      loadTasks(); // Reload tasks to restore the correct state
      setError(err.message || "Failed to update task status");
    }
  };

  // Render a card
  const renderCard = (card) => (
    <div className="kanban-item" key={card.id}>
      <div className="kanban-box">
        <div className="d-flex justify-content-between">
          <span className="date">{card.date}</span>
          <span className={`badge ${getPriorityClass(card.priority)} f-right`}>
            {card.priority}
          </span>
        </div>
        <H6>{card.title}</H6>
        <P attrPara={{ className: "mb-2" }}>{card.description}</P>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="text-muted f-12">
            Assigned to: {card.assignedTo}
          </span>
        </div>
        {card.tags && card.tags.length > 0 && (
          <div className="mt-2">
            {card.tags.map((tag, index) => (
              <span key={index} className="badge badge-light me-1">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="d-flex mt-3">
          <UL attrUL={{ className: "simple-list list flex-row" }}>
            <LI attrLI={{ className: "border-0" }}>
              <i className="fa fa-comments-o"></i> 0
            </LI>
            <LI attrLI={{ className: "border-0" }}>
              <i className="fa fa-paperclip"></i> 0
            </LI>
          </UL>
        </div>
      </div>
    </div>
  );

  // Get priority class for styling
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-danger";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-success";
      default:
        return "badge-primary";
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <H5>Task Board</H5>
        </CardHeader>
        <CardBody className="kanban-block">
          <div className="kanban-container">
            <main className="kanban-drag">
              <Board
                allowAddCard={{ on: "top" }}
                onCardDragEnd={handleCardMove}
                renderCard={renderCard}
              >
                {board}
              </Board>
            </main>
          </div>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default TaskKanbanBoard;
