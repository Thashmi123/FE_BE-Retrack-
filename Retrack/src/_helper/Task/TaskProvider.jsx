import React, { useEffect, useState } from 'react';
import Context from './index';
import TaskService from '../../Services/task.service';

const TaskProvider = (props) => {
    const [allTask, setAllTask] = useState([]);
    const [newTask, setNewTask] = useState([]);

    const getTask = async (filters = {}) => {
        try {
            // Use TaskService with proper query parameters
            const defaultFilters = {
                page: '1',
                size: '10',
                searchTerm: '',
                createdBy: '',
                assignedTo: '',
                status: '',
                priority: '',
                dueDateFrom: '',
                dueDateTo: '',
                createdDateFrom: '',
                createdDateTo: '',
                tag: '',
                noPagination: true // Get all tasks by default
            };

            const mergedFilters = { ...defaultFilters, ...filters };
            const response = await TaskService.getAllTasks(mergedFilters);
            
            // Transform backend data to match frontend structure
            const transformedTasks = response.Task.map(task => ({
                id: task.task_id,
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                due_date: task.due_date,
                priority: task.priority,
                status: task.status,
                assigned_to_email: task.assigned_to_email,
                assigned_to_name: task.assigned_to_name,
                assigned_by_email: task.assigned_by_email,
                assigned_by_name: task.assigned_by_name,
                tags: task.tags || [],
                created_at: task.created_at,
                updated_at: task.updated_at
            }));
            setAllTask(transformedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Set empty array on error to prevent UI crashes
            setAllTask([]);
        }
    };

    useEffect(() => {
        getTask();
    }, [setAllTask, setNewTask]);

    const AddNewTask = async (data) => {
        try {
            // Transform frontend data to match backend structure
            const taskData = {
                title: data.title,
                description: data.desc,
                due_date: data.due_date ? new Date(data.due_date).toISOString() : new Date().toISOString(),
                priority: data.priority || "Medium",
                status: data.status || "Pending",
                assigned_to_email: data.assigned_to_email || "user@example.com",
                assigned_to_name: data.assigned_to_name || "User",
                assigned_by_email: data.assigned_by_email || "admin@example.com",
                assigned_by_name: data.assigned_by_name || "Admin",
                tags: data.tags || [] // Include tags if provided
            };

            await TaskService.createTask(taskData);
            // Refresh tasks after successful creation
            getTask();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const RemoveTask = async (id) => {
        try {
            await TaskService.deleteTask(id);
            // Refresh tasks after successful deletion
            getTask();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const UpdateTask = async (taskData) => {
        try {
            // Transform frontend data to match backend structure
            const backendTaskData = {
                task_id: taskData.task_id,
                title: taskData.title,
                description: taskData.description,
                due_date: taskData.due_date,
                priority: taskData.priority,
                status: taskData.status,
                assigned_to_email: taskData.assigned_to_email,
                assigned_to_name: taskData.assigned_to_name,
                assigned_by_email: taskData.assigned_by_email,
                assigned_by_name: taskData.assigned_by_name,
                tags: taskData.tags || [],
                deleted: taskData.deleted,
                created_at: taskData.created_at,
                updated_at: new Date().toISOString()
            };

            await TaskService.updateTask(backendTaskData);
            // Refresh tasks after successful update
            getTask();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <Context.Provider
            value={{
                ...props,
                allTask,
                newTask,
                getTask, // Expose getTask function for filtering
                AddNewTask: AddNewTask,
                RemoveTask: RemoveTask,
                UpdateTask: UpdateTask
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default TaskProvider;