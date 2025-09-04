import axios from 'axios';
import AuthService from './auth.service';

// TaskMGT API base URL
const API_BASE_URL = 'http://localhost:8888/TaskMgt/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class TaskService {
  // Set authorization header for API requests
  setAuthHeader() {
    const token = AuthService.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  // Get all tasks with filtering options
  async getAllTasks(filters = {}) {
    try {
      this.setAuthHeader();
      
      const params = {
        page: filters.page || '1',
        size: filters.size || '10',
        searchTerm: filters.searchTerm || '',
        createdBy: filters.createdBy || '',
        assignedTo: filters.assignedTo || '',
        status: filters.status || '',
        priority: filters.priority || '',
        dueDateFrom: filters.dueDateFrom || '',
        dueDateTo: filters.dueDateTo || '',
        createdDateFrom: filters.createdDateFrom || '',
        createdDateTo: filters.createdDateTo || '',
        tag: filters.tag || '',
        noPagination: filters.noPagination ? 'true' : 'false'
      };

      const response = await apiClient.get('/FindallTask', { params });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Get a specific task by ID
  async getTaskById(taskId) {
    try {
      this.setAuthHeader();
      const response = await apiClient.get('/FindTask', { params: { taskId } });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Create a new task
  async createTask(taskData) {
    try {
      this.setAuthHeader();
      const response = await apiClient.post('/CreateTask', taskData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Update an existing task
  async updateTask(taskData) {
    try {
      this.setAuthHeader();
      const response = await apiClient.put('/UpdateTask', taskData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Change task status
  async changeTaskStatus(taskId, status) {
    try {
      this.setAuthHeader();
      const response = await apiClient.put('/ChangeTaskStatus', {
        task_id: taskId,
        new_status: status
      });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Add tags to a task
  async addTagsToTask(taskId, tags) {
    try {
      this.setAuthHeader();
      // First get the task
      const taskResponse = await this.getTaskById(taskId);
      const task = taskResponse.Task;
      
      // Add new tags to existing tags
      const updatedTags = [...new Set([...(task.tags || []), ...tags])];
      
      // Update the task with new tags
      const updatedTask = { ...task, tags: updatedTags };
      const response = await this.updateTask(updatedTask);
      return response;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Remove tags from a task
  async removeTagsFromTask(taskId, tagsToRemove) {
    try {
      this.setAuthHeader();
      // First get the task
      const taskResponse = await this.getTaskById(taskId);
      const task = taskResponse.Task;
      
      // Remove specified tags
      const updatedTags = (task.tags || []).filter(tag => !tagsToRemove.includes(tag));
      
      // Update the task with new tags
      const updatedTask = { ...task, tags: updatedTags };
      const response = await this.updateTask(updatedTask);
      return response;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      this.setAuthHeader();
      const response = await apiClient.delete('/DeleteTask', { params: { taskId } });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw { message: 'Network error - please check your connection' };
      }
      throw error.response.data;
    }
  }
}

// Export singleton instance
export default new TaskService();