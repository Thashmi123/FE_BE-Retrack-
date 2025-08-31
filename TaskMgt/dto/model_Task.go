package dto

import "time"

type Task struct {
	TaskId          string    `json:"task_id"`
	Title           string    `json:"title" validate:"required"`
	Description     string    `json:"description"`
	DueDate         time.Time `json:"due_date"` // parsed from frontend
	Priority        string    `json:"priority"`
	Status          string    `json:"status"`
	AssignedToEmail string    `json:"assigned_to_email" validate:"required,email"`
	AssignedToName  string    `json:"assigned_to_name" validate:"required"`
	AssignedByEmail string    `json:"assigned_by_email" validate:"required,email"`
	AssignedByName  string    `json:"assigned_by_name" validate:"required"`
	Deleted         bool      `json:"deleted"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
