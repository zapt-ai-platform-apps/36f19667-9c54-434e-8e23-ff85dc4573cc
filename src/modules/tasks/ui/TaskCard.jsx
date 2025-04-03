import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiEdit2, FiTrash2, FiAlignLeft } from 'react-icons/fi';
import TaskForm from './TaskForm';
import { useTaskContext } from '../internal/state';

const TaskCard = ({ task, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteTask } = useTaskContext();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleDelete = () => {
    deleteTask(task.id);
  };
  
  const handleFormClose = () => {
    setIsEditing(false);
  };
  
  const handleFormSubmit = (values) => {
    // Form submission is handled by TaskForm component
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="mb-3 p-1">
        <TaskForm 
          initialValues={task} 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormClose}
          isEditing
        />
      </div>
    );
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="glass-card p-3 mb-3 hover:shadow-xl transition-all duration-200 border-l-4 border-r-0 border-t-0 border-b-0 cursor-grab active:cursor-grabbing"
      data-testid="task-card"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-light-100">{task.title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleEdit}
            className="text-light-400 hover:text-primary-400 p-1 rounded transition-colors duration-200 cursor-pointer"
            aria-label="Edit task"
          >
            <FiEdit2 size={14} />
          </button>
          <button 
            onClick={handleDelete}
            className="text-light-400 hover:text-red-500 p-1 rounded transition-colors duration-200 cursor-pointer"
            aria-label="Delete task"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <div className="mt-2 text-light-300 text-sm">
          <div className="flex items-center text-xs text-light-400 mb-1">
            <FiAlignLeft size={12} className="mr-1" />
            <span>Description</span>
          </div>
          <p className="text-sm">{task.description}</p>
        </div>
      )}
      
      <div className="mt-3 flex justify-between items-center">
        <div className="text-xs text-light-400">
          ID: {task.id.slice(0, 5)}...
        </div>
        <div 
          className="text-xs px-2 py-1 rounded-full bg-dark-300"
          {...listeners}
        >
          <span role="img" aria-label="drag handle">≡</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;