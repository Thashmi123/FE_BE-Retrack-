import React, { Fragment, useContext, useState, useEffect } from "react";
import ReactToPrint from "react-to-print";
import { Printer, Filter } from "react-feather";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Input,
  Button,
  Row,
  Col,
} from "reactstrap";
import {
  CreatedByMe,
  Print,
  TodayTasks,
  DelayedTasks,
  UpcomingTasks,
  ThisWeekTask,
  ThisMonthTasks,
  AssignedToMe,
  MyTasks,
} from "../../../Constant";
import { H6, P } from "../../../AbstractElements";
import TaskService from "../../../Services/task.service";
import { useUser } from "../../../contexts/UserContext";

const EnhancedTaskList = ({ activeFilter = "all", tagFilter = "" }) => {
  const componentRef = React.useRef();
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    dueDateFrom: "",
    dueDateTo: "",
    createdDateFrom: "",
    createdDateTo: "",
    tag: "",
  });

  // Load tasks from the backend
  useEffect(() => {
    loadTasks();
  }, [tagFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getAllTasks({
        noPagination: true,
        tag: tagFilter || filters.tag || "",
      });
      setTasks(response.Task);
      setFilteredTasks(response.Task);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilter, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...tasks];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    switch (activeFilter) {
      case "createdByMe":
        filtered = filtered.filter(
          (task) => task.assigned_by_email === user?.email
        );
        break;
      case "today":
        const today = new Date().toISOString().split("T")[0];
        filtered = filtered.filter(
          (task) => task.due_date && task.due_date.split("T")[0] === today
        );
        break;
      case "delayed":
        filtered = filtered.filter((task) => {
          if (!task.due_date || task.status === "Completed") return false;
          const dueDate = new Date(task.due_date);
          return dueDate < now;
        });
        break;
      case "upcoming":
        filtered = filtered.filter((task) => {
          if (!task.due_date || task.status === "Completed") return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= now;
        });
        break;
      case "thisWeek":
        filtered = filtered.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        });
        break;
      case "thisMonth":
        filtered = filtered.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= startOfMonth && dueDate <= endOfMonth;
        });
        break;
      case "assignedToMe":
        filtered = filtered.filter(
          (task) => task.assigned_to_email === user?.email
        );
        break;
      case "myTasks":
        filtered = filtered.filter(
          (task) => task.assigned_to_email === user?.email
        );
        break;
      case "tag":
        if (tagFilter) {
          filtered = filtered.filter(
            (task) => task.tags && task.tags.includes(tagFilter)
          );
        }
        break;
      default:
        // Show all tasks
        break;
    }

    // Apply additional filters
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.dueDateFrom) {
      const fromDate = new Date(filters.dueDateFrom);
      filtered = filtered.filter((task) => new Date(task.due_date) >= fromDate);
    }

    if (filters.dueDateTo) {
      const toDate = new Date(filters.dueDateTo);
      filtered = filtered.filter((task) => new Date(task.due_date) <= toDate);
    }

    if (filters.createdDateFrom) {
      const fromDate = new Date(filters.createdDateFrom);
      filtered = filtered.filter(
        (task) => new Date(task.created_at) >= fromDate
      );
    }

    if (filters.createdDateTo) {
      const toDate = new Date(filters.createdDateTo);
      filtered = filtered.filter((task) => new Date(task.created_at) <= toDate);
    }

    // Apply tag filter from filters object if not using the special tag filter
    if (filters.tag && activeFilter !== "tag") {
      filtered = filtered.filter(
        (task) => task.tags && task.tags.includes(filters.tag)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: "",
      status: "",
      dueDateFrom: "",
      dueDateTo: "",
      createdDateFrom: "",
      createdDateTo: "",
    });
    setSearchTerm("");
    // setActiveFilter is not defined, so we'll just clear the filters
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "createdByMe":
        return CreatedByMe;
      case "today":
        return TodayTasks;
      case "delayed":
        return DelayedTasks;
      case "upcoming":
        return UpcomingTasks;
      case "thisWeek":
        return ThisWeekTask;
      case "thisMonth":
        return ThisMonthTasks;
      case "assignedToMe":
        return AssignedToMe;
      case "myTasks":
        return MyTasks;
      default:
        return "All Tasks";
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
      <Card className="mb-0">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <H6 attrH6={{ className: "mb-0 f-w-600" }}>{getFilterTitle()}</H6>
          <div className="d-flex align-items-center">
            <Button color="link" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="me-1" /> Filters
            </Button>
            <ReactToPrint
              trigger={() => (
                <a href="#javascript" className="ms-2">
                  <Printer className="me-1" />
                  {Print}
                </a>
              )}
              content={() => componentRef.current}
            />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {showFilters && (
            <div className="p-3 border-bottom">
              <Row>
                <Col md="3">
                  <Input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <Input
                    type="select"
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                  >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Input
                    type="select"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Input
                    type="select"
                    value={filters.tag}
                    onChange={(e) => handleFilterChange("tag", e.target.value)}
                  >
                    <option value="">All Tags</option>
                    <option value="Notification">Notification</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Business">Business</option>
                    <option value="Holidays">Holidays</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Input
                    type="date"
                    placeholder="Due Date From"
                    value={filters.dueDateFrom}
                    onChange={(e) =>
                      handleFilterChange("dueDateFrom", e.target.value)
                    }
                  />
                </Col>
                <Col md="1">
                  <Button color="secondary" onClick={clearFilters}>
                    Clear
                  </Button>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md="3">
                  <Input
                    type="date"
                    placeholder="Due Date To"
                    value={filters.dueDateTo}
                    onChange={(e) =>
                      handleFilterChange("dueDateTo", e.target.value)
                    }
                  />
                </Col>
                <Col md="3">
                  <Input
                    type="date"
                    placeholder="Created Date From"
                    value={filters.createdDateFrom}
                    onChange={(e) =>
                      handleFilterChange("createdDateFrom", e.target.value)
                    }
                  />
                </Col>
                <Col md="3">
                  <Input
                    type="date"
                    placeholder="Created Date To"
                    value={filters.createdDateTo}
                    onChange={(e) =>
                      handleFilterChange("createdDateTo", e.target.value)
                    }
                  />
                </Col>
              </Row>
            </div>
          )}
          <div className="taskadd">
            <div className="table-responsive">
              <Table ref={componentRef}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks && filteredTasks.length ? (
                    filteredTasks.map((task) => {
                      return (
                        <tr key={task.task_id}>
                          <td>
                            <H6 attrH6={{ className: "task_title_0" }}>
                              {task.title}
                            </H6>
                          </td>
                          <td>
                            <P attrPara={{ className: "task_desc_0" }}>
                              {task.description}
                            </P>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                task.priority === "High"
                                  ? "badge-danger"
                                  : task.priority === "Medium"
                                  ? "badge-warning"
                                  : "badge-success"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                task.status === "Completed"
                                  ? "badge-success"
                                  : task.status === "In Progress"
                                  ? "badge-warning"
                                  : "badge-primary"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td>
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{task.assigned_to_name}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="no-favourite text-center p-3">
                          <span>No tasks found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default EnhancedTaskList;
