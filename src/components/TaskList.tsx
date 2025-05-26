
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: 'normal' | 'high';
  assigned_to_profile?: { full_name: string } | null;
  group?: { name: string } | null;
}

interface TaskListProps {
  tasks: Task[];
  showAssignee?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, showAssignee = false }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-lg p-4 border-l-4 shadow-sm ${
            task.priority === 'high' 
              ? 'border-l-red-500' 
              : 'border-l-blue-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                    </span>
                  </div>
                )}
                
                {showAssignee && task.assigned_to_profile && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{task.assigned_to_profile.full_name}</span>
                  </div>
                )}
                
                {task.group && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {task.group.name}
                  </span>
                )}
              </div>
            </div>
            
            {task.priority === 'high' && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                High
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
