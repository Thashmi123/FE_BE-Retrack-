import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskService from '../../../Services/task.service';
import { UserProvider } from '../../../contexts/UserContext';

// Mock the TaskService
jest.mock('../../../Services/task.service');

// Mock the useUser hook
jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => ({
    user: { email: 'test@example.com' }
  })
}));

describe('TaskKanbanBoard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock the getAllTasks method to return a promise that resolves later
    TaskService.getAllTasks.mockResolvedValue({ Task: [] });
    
    render(
      <UserProvider>
        <TaskKanbanBoard />
      </UserProvider>
    );
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    // Mock the getAllTasks method to reject with an error
    TaskService.getAllTasks.mockRejectedValue(new Error('API Error'));
    
    render(
      <UserProvider>
        <TaskKanbanBoard />
      </UserProvider>
    );
    
    // Wait for the error message to appear
    expect(await screen.findByText('Error: API Error')).toBeInTheDocument();
  });

  test('renders task board with columns', async () => {
    // Mock the getAllTasks method to return sample data
    TaskService.getAllTasks.mockResolvedValue({
      Task: [
        {
          task_id: '1',
          title: 'Test Task',
          description: 'Test Description',
          due_date: '2023-12-31T00:00:00Z',
          priority: 'High',
          status: 'TO DO',
          assigned_to_name: 'John Doe',
          tags: ['Important']
        }
      ]
    });
    
    render(
      <UserProvider>
        <TaskKanbanBoard />
      </UserProvider>
    );
    
    // Wait for the board to load
    expect(await screen.findByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
