# TaskMgt API Documentation for Frontend Integration

## Base URL
The base URL for all API endpoints is:
```
http://localhost:8888/TaskMgt/api
```

For production, replace `localhost:8888` with your actual server address.

## Authentication
No authentication is required for these API endpoints.

## Common Headers
All requests should include:
```
Content-Type: application/json
```

## API Endpoints

### 1. Create Task
- **Endpoint**: `POST /CreateTask`
- **Description**: Creates a new task and sends email notifications
- **Request Body**:
```json
{
  "title": "string (required)",
  "description": "string",
  "due_date": "ISO 8601 date string (required)",
  "priority": "string",
  "status": "string",
  "assigned_to_email": "string (required, email format)",
  "assigned_to_name": "string (required)",
  "assigned_by_email": "string (required, email format)",
  "assigned_by_name": "string (required)"
}
```
- **Response**:
```json
{
  "message": "Task created successfully",
  "task_id": "string"
}
```
- **Status Codes**:
  - 201: Task created successfully
  - 400: Bad request (validation errors)
  - 500: Internal server error

### 2. Update Task
- **Endpoint**: `PUT /UpdateTask`
- **Description**: Updates an existing task
- **Request Body**:
```json
{
  "task_id": "string (required)",
  "title": "string (required)",
  "description": "string",
  "due_date": "ISO 8601 date string",
  "priority": "string",
  "status": "string",
  "assigned_to_email": "string (required, email format)",
  "assigned_to_name": "string (required)",
  "assigned_by_email": "string (required, email format)",
  "assigned_by_name": "string (required)",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```
- **Response**:
```json
{
  "message": "success"
}
```
- **Status Codes**:
  - 200: Task updated successfully
  - 400: Bad request (validation errors)
  - 404: Task not found

### 3. Change Task Status
- **Endpoint**: `PUT /ChangeTaskStatus`
- **Description**: Changes the status of a task and sends email notifications
- **Request Body**:
```json
{
  "task_id": "string (required)",
  "new_status": "string (required)"
}
```
- **Response**:
```json
{
  "message": "success"
}
```
- **Status Codes**:
  - 200: Status changed successfully
  - 400: Bad request (validation errors)
  - 404: Task not found

### 4. Delete Task
- **Endpoint**: `DELETE /DeleteTask`
- **Description**: Deletes a task (soft delete)
- **Query Parameters**:
  - `taskId`: The ID of the task to delete
- **Response**:
```json
{
  "message": "success"
}
```
- **Status Codes**:
  - 200: Task deleted successfully
  - 400: Bad request
  - 404: Task not found

### 5. Find Task
- **Endpoint**: `GET /FindTask`
- **Description**: Retrieves a specific task by ID
- **Query Parameters**:
  - `taskId`: The ID of the task to retrieve
- **Response**:
```json
{
  "task_id": "string",
  "title": "string",
  "description": "string",
  "due_date": "ISO 8601 date string",
  "priority": "string",
  "status": "string",
  "assigned_to_email": "string",
  "assigned_to_name": "string",
  "assigned_by_email": "string",
  "assigned_by_name": "string",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```
- **Status Codes**:
  - 200: Task retrieved successfully
  - 400: Bad request
  - 404: Task not found

### 6. Find All Tasks
- **Endpoint**: `GET /FindallTask`
- **Description**: Retrieves all tasks with pagination and search
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `size`: Number of items per page (default: 10)
  - `searchTerm`: Search term to filter tasks
  - `noPagination`: Set to "true" to disable pagination
- **Response**:
```json
{
  "Count": "number",
  "Task": [
    {
      "task_id": "string",
      "title": "string",
      "description": "string",
      "due_date": "ISO 8601 date string",
      "priority": "string",
      "status": "string",
      "assigned_to_email": "string",
      "assigned_to_name": "string",
      "assigned_by_email": "string",
      "assigned_by_name": "string",
      "created_at": "ISO 8601 date string",
      "updated_at": "ISO 8601 date string"
    }
  ]
}
```
- **Status Codes**:
  - 202: Tasks retrieved successfully
  - 400: Bad request

### 7. Upload Task
- **Endpoint**: `POST /UploadTask`
- **Description**: Uploads a file related to a task
- **Request**: Multipart form data with file
- **Response**: Depends on implementation
- **Status Codes**: Depends on implementation

### 8. Download Task
- **Endpoint**: `GET /DownloadTask`
- **Description**: Downloads a file related to a task
- **Query Parameters**: Depends on implementation
- **Response**: File download
- **Status Codes**: Depends on implementation