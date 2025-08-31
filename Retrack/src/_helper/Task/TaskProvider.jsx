import React, { useEffect, useState } from 'react';
import Context from './index';
import axios from 'axios';
import { TaskApi } from '../../api';

const TaskProvider = (props) => {
    const [allTask, setAllTask] = useState([]);
    const [newTask, setNewTask] = useState([]);

    const getTask = async () => {
        try {
            const response = await axios.get(`${TaskApi}/FindallTask`);
            // Transform backend data to match frontend structure
            const transformedTasks = response.data.Task.map(task => ({
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
                created_at: task.created_at,
                updated_at: task.updated_at
            }));
            setAllTask(transformedTasks);
        } catch (error) {
            console.log('error', error);
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
                due_date: new Date().toISOString(), // Default to current date
                priority: "Medium", // Default priority
                status: "Pending", // Default status
                assigned_to_email: "user@example.com", // Default email
                assigned_to_name: "User", // Default name
                assigned_by_email: "admin@example.com", // Default email
                assigned_by_name: "Admin" // Default name
            };

            const response = await axios.post(`${TaskApi}/CreateTask`, taskData);
            if (response.status === 201) {
                // Refresh tasks after successful creation
                getTask();
            }
        } catch (error) {
            console.log('error creating task', error);
        }
    };

    const RemoveTask = async (id) => {
        try {
            await axios.delete(`${TaskApi}/DeleteTask?taskId=${id}`);
            // Refresh tasks after successful deletion
            getTask();
        } catch (error) {
            console.log('error deleting task', error);
        }
    };

    const UpdateTask = async (taskData) => {
        try {
            await axios.put(`${TaskApi}/UpdateTask`, taskData);
            // Refresh tasks after successful update
            getTask();
        } catch (error) {
            console.log('error updating task', error);
        }
    };

    return (
        <Context.Provider
            value={{
                ...props,
                allTask,
                newTask,
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