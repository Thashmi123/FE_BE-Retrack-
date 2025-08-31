# Frontend Integration Examples for TaskMgt API

## Base URL Configuration

First, define the base URL for API requests:

```javascript
const API_BASE_URL = 'http://localhost:8888/TaskMgt/api';
```

## Common HTTP Client Setup

Here's a simple HTTP client setup using the Fetch API:

```javascript
// Simple HTTP client for API requests
class TaskMgtApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // For requests that don't return JSON (like file downloads)
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'DELETE' });
  }
}

// Initialize the API client
const apiClient = new TaskMgtApiClient(API_BASE_URL);
```

## API Integration Examples

### 1. Create a New Task

```javascript
async function createTask(taskData) {
  try {
    const response = await apiClient.post('/CreateTask', taskData);
    console.log('Task created successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
}

// Example usage:
const newTask = {
  title: 'Implement user authentication',
  description: 'Create login and registration functionality',
  due_date: '2023-12-31T23:59:59Z',
  priority: 'High',
  status: 'Pending',
  assigned_to_email: 'developer@example.com',
  assigned_to_name: 'John Developer',
  assigned_by_email: 'manager@example.com',
  assigned_by_name: 'Jane Manager'
};

// Call the function
createTask(newTask)
  .then(response => {
    console.log('Task ID:', response.task_id);
  })
  .catch(error => {
    // Handle error (show user-friendly message)
    alert('Failed to create task: ' + error.message);
  });
```

### 2. Get All Tasks

```javascript
async function getAllTasks(page = 1, size = 10, searchTerm = '') {
  try {
    const params = {
      page: page.toString(),
      size: size.toString()
    };
    
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    
    const response = await apiClient.get('/FindallTask', params);
    return response;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
}

// Example usage:
getAllTasks(1, 20, 'authentication')
  .then(response => {
    console.log(`Found ${response.Count} tasks`);
    console.log('Tasks:', response.Task);
    
    // Update UI with tasks
    displayTasks(response.Task);
  })
  .catch(error => {
    // Handle error
    alert('Failed to load tasks: ' + error.message);
  });

function displayTasks(tasks) {
  const taskListElement = document.getElementById('task-list');
  taskListElement.innerHTML = '';
  
  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p>Assigned to: ${task.assigned_to_name}</p>
      <p>Status: ${task.status}</p>
      <p>Due: ${new Date(task.due_date).toLocaleDateString()}</p>
    `;
    taskListElement.appendChild(taskElement);
  });
}
```

### 3. Change Task Status

```javascript
async function changeTaskStatus(taskId, newStatus) {
  try {
    const response = await apiClient.put('/ChangeTaskStatus', {
      task_id: taskId,
      new_status: newStatus
    });
    console.log('Task status updated successfully');
    return response;
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw error;
  }
}

// Example usage:
changeTaskStatus('TAS-001', 'In Progress')
  .then(() => {
    // Refresh task list or update UI
    alert('Task status updated successfully');
    // Optionally reload tasks
    getAllTasks();
  })
  .catch(error => {
    // Handle error
    alert('Failed to update task status: ' + error.message);
  });
```

### 4. Delete a Task

```javascript
async function deleteTask(taskId) {
  try {
    const response = await apiClient.delete('/DeleteTask', {
      taskId: taskId
    });
    console.log('Task deleted successfully');
    return response;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
}

// Example usage:
deleteTask('TAS-001')
  .then(() => {
    // Refresh task list or update UI
    alert('Task deleted successfully');
    // Optionally reload tasks
    getAllTasks();
  })
  .catch(error => {
    // Handle error
    alert('Failed to delete task: ' + error.message);
  });
```

### 5. Get a Specific Task

```javascript
async function getTaskById(taskId) {
  try {
    const response = await apiClient.get('/FindTask', {
      taskId: taskId
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch task:', error);
    throw error;
  }
}

// Example usage:
getTaskById('TAS-001')
  .then(task => {
    console.log('Task details:', task);
    // Update UI with task details
    displayTaskDetails(task);
  })
  .catch(error => {
    // Handle error
    if (error.message.includes('404')) {
      alert('Task not found');
    } else {
      alert('Failed to load task: ' + error.message);
    }
  });

function displayTaskDetails(task) {
  const taskDetailsElement = document.getElementById('task-details');
  taskDetailsElement.innerHTML = `
    <h2>${task.title}</h2>
    <p>${task.description}</p>
    <p><strong>Assigned to:</strong> ${task.assigned_to_name} (${task.assigned_to_email})</p>
    <p><strong>Assigned by:</strong> ${task.assigned_by_name} (${task.assigned_by_email})</p>
    <p><strong>Status:</strong> ${task.status}</p>
    <p><strong>Priority:</strong> ${task.priority}</p>
    <p><strong>Due date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
    <p><strong>Created:</strong> ${new Date(task.created_at).toLocaleDateString()}</p>
  `;
}
```

## Error Handling and Response Parsing

### Error Handling Strategy

```javascript
// Centralized error handling
class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Enhanced API client with better error handling
class EnhancedTaskMgtApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // For requests that don't return JSON
      if (response.status === 204) {
        return null;
      }
      
      // Try to parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error response
        data = { message: response.statusText || 'Unknown error' };
      }
      
      // Handle different response status codes
      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data.code
        );
      }
      
      return data;
    } catch (error) {
      // Re-throw our custom errors, or wrap other errors
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(
          error.message || 'Network error occurred',
          0,
          'NETWORK_ERROR'
        );
      }
    }
  }

  // ... (get, post, put, delete methods remain the same)
}

// Usage with enhanced error handling
const enhancedApiClient = new EnhancedTaskMgtApiClient(API_BASE_URL);

async function handleApiCall(apiCall, successMessage = 'Operation successful') {
  try {
    const result = await apiCall();
    
    // Show success message
    console.log(successMessage);
    
    return result;
  } catch (error) {
    // Handle different types of errors
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          alert('Invalid request data. Please check your input.');
          break;
        case 404:
          alert('Requested resource not found.');
          break;
        case 500:
          alert('Server error. Please try again later.');
          break;
        default:
          alert(`Error: ${error.message}`);
      }
    } else {
      // Network or other unexpected errors
      alert('Network error. Please check your connection and try again.');
    }
    
    // Re-throw error for further handling if needed
    throw error;
  }
}

// Example usage with enhanced error handling:
handleApiCall(
  () => createTask(newTask),
  'Task created successfully!'
)
.then(response => {
  console.log('Task ID:', response.task_id);
})
.catch(error => {
  // Error already handled in handleApiCall, but you can do additional handling here if needed
  console.error('API call failed:', error);
});
```

## Best Practices for Frontend Integration

### 1. State Management

```javascript
// Simple state management for tasks
class TaskStore {
  constructor() {
    this.tasks = [];
    this.loading = false;
    this.error = null;
  }

  setLoading(loading) {
    this.loading = loading;
  }

  setError(error) {
    this.error = error;
  }

  setTasks(tasks) {
    this.tasks = tasks;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  updateTask(updatedTask) {
    const index = this.tasks.findIndex(task => task.task_id === updatedTask.task_id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
    }
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(task => task.task_id !== taskId);
  }
}

const taskStore = new TaskStore();
```

### 2. Loading States and User Feedback

```javascript
// Function to update UI based on loading state
function updateLoadingState(loading) {
  const loaderElement = document.getElementById('loader');
  const taskFormElement = document.getElementById('task-form');
  
  if (loading) {
    loaderElement.style.display = 'block';
    taskFormElement.style.opacity = '0.5';
    taskFormElement.disabled = true;
  } else {
    loaderElement.style.display = 'none';
    taskFormElement.style.opacity = '1';
    taskFormElement.disabled = false;
  }
}

// Usage in API calls
async function createTaskWithLoading(taskData) {
  updateLoadingState(true);
  
  try {
    const response = await apiClient.post('/CreateTask', taskData);
    
    // Update store and UI
    taskStore.addTask({ ...taskData, task_id: response.task_id });
    
    // Show success message
    alert('Task created successfully!');
    
    // Reset form
    document.getElementById('task-form').reset();
    
    return response;
  } catch (error) {
    // Error handling
    alert('Failed to create task: ' + error.message);
    throw error;
  } finally {
    updateLoadingState(false);
  }
}
```

### 3. Form Validation

```javascript
// Client-side validation before API calls
function validateTaskData(taskData) {
  const errors = [];
  
  if (!taskData.title || taskData.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!taskData.assigned_to_email || !isValidEmail(taskData.assigned_to_email)) {
    errors.push('Valid assignee email is required');
  }
  
  if (!taskData.assigned_to_name || taskData.assigned_to_name.trim() === '') {
    errors.push('Assignee name is required');
  }
  
  if (!taskData.assigned_by_email || !isValidEmail(taskData.assigned_by_email)) {
    errors.push('Valid assigner email is required');
  }
  
  if (!taskData.assigned_by_name || taskData.assigned_by_name.trim() === '') {
    errors.push('Assigner name is required');
  }
  
  if (!taskData.due_date) {
    errors.push('Due date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Usage in form submission
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const taskData = {
    title: formData.get('title'),
    description: formData.get('description'),
    due_date: formData.get('due_date'),
    priority: formData.get('priority'),
    status: formData.get('status') || 'Pending',
    assigned_to_email: formData.get('assigned_to_email'),
    assigned_to_name: formData.get('assigned_to_name'),
    assigned_by_email: formData.get('assigned_by_email'),
    assigned_by_name: formData.get('assigned_by_name')
  };
  
  // Validate data
  const validation = validateTaskData(taskData);
  if (!validation.isValid) {
    alert('Validation errors:\n' + validation.errors.join('\n'));
    return;
  }
  
  // Proceed with API call
  await createTaskWithLoading(taskData);
});
```

This documentation provides comprehensive examples for integrating the TaskMgt API with a frontend application. The examples use modern JavaScript practices and include error handling, loading states, and form validation.