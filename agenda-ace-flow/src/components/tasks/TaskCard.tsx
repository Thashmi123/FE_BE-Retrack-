import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  meetingTitle?: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, completed: boolean) => void;
  onEdit?: () => void;
}

export function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="default">Medium Priority</Badge>;
      case "low":
        return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  const getPriorityIcon = () => {
    if (task.priority === "high") {
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";

  return (
    <Card className={`shadow-card hover:shadow-elevated transition-all duration-300 ${
      task.status === "completed" ? "opacity-75" : ""
    } ${isOverdue ? "border-destructive/50" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={(checked) => 
                onStatusChange?.(task.id, checked as boolean)
              }
              className="mt-1"
            />
            <div className="space-y-2 flex-1">
              <CardTitle className={`text-lg ${
                task.status === "completed" ? "line-through text-muted-foreground" : ""
              }`}>
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getPriorityIcon()}
                {getPriorityBadge()}
                {isOverdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? "text-destructive" : ""}>
              Due {task.dueDate}
            </span>
          </div>
        </div>
        
        {task.meetingTitle && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>From: {task.meetingTitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}