import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const TaskColumn = ({ column, tasks }) => {
  const [showForm, setShowForm] = useState(false);
  const taskIds = tasks.map(task => task.id);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  
  const handleAddTask = () => {
    setShowForm(true);
  };
  
  const handleFormSubmit = () => {
    setShowForm(false);
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
  };
  
  return (
    <div className="flex flex-col w-80 min-w-80 h-full glass-card mr-5 mb-5 overflow-hidden">
      {/* Column Header */}
      <div className={`p-3 flex justify-between items-center border-b border-dark-300`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
          <h2 className="font-semibold text-light-100">{column.title}</h2>
          <span className="text-sm text-light-400 bg-dark-300 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-light-400 hover:text-primary-500 transition-colors">
          <FiMoreVertical />
        </button>
      </div>
      
      {/* Task List */}
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <TaskCard 
              key={task.id}
              task={task}
              index={index}
            />
          ))}
        </SortableContext>
        
        {/* Add Task Form */}
        {showForm ? (
          <TaskForm 
            initialValues={{ columnId: column.id }} 
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-light-400 text-sm">
            <p className="mb-2">No tasks yet</p>
            <button 
              onClick={handleAddTask}
              className="btn btn-ghost cursor-pointer text-xs px-3 py-1"
            >
              Add a task
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddTask}
            className="w-full mt-2 py-2 px-3 flex items-center justify-center text-light-400 hover:text-primary-400 bg-dark-300 hover:bg-dark-200 rounded transition-colors cursor-pointer"
          >
            <FiPlus className="mr-1" />
            <span>Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;