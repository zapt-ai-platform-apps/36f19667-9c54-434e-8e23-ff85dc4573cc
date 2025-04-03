import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, pointerWithin, getFirstCollision } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import { FiPlus } from 'react-icons/fi';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import { useTaskContext } from '../internal/state';

const TaskBoard = () => {
  const { 
    tasks, 
    columns, 
    moveTask, 
    addColumn 
  } = useTaskContext();
  const [activeId, setActiveId] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);
  
  // Get tasks for each column
  const getColumnTasks = (columnId) => {
    return tasks.filter(task => task.columnId === columnId);
  };
  
  // Find the column containing a task
  const findColumnOfTask = (taskId) => {
    return columns.find(col => col.taskIds.includes(taskId));
  };
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    
    // If not a task (might be something else), return
    if (!activeTask) return;
    
    // Find source and destination columns
    const sourceColumn = columns.find(col => col.id === activeTask.columnId);
    
    // If over a task, find its column
    const overTask = tasks.find(task => task.id === overId);
    const overColumn = overTask 
      ? columns.find(col => col.id === overTask.columnId)
      : columns.find(col => col.id === overId); // If over a column directly
    
    if (!sourceColumn || !overColumn) return;
    
    // If over a different column
    if (sourceColumn.id !== overColumn.id) {
      const destinationIndex = overTask
        ? overColumn.taskIds.indexOf(overId)
        : overColumn.taskIds.length;
      
      moveTask(activeId, sourceColumn.id, overColumn.id, destinationIndex);
    }
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    
    // If not a task, return
    if (!activeTask) {
      setActiveId(null);
      return;
    }
    
    // Find source column
    const sourceColumn = columns.find(col => col.id === activeTask.columnId);
    
    // Find destination column and index
    const overTask = tasks.find(task => task.id === overId);
    const overColumn = overTask 
      ? columns.find(col => col.id === overTask.columnId)
      : columns.find(col => col.id === overId);
    
    if (!sourceColumn || !overColumn) {
      setActiveId(null);
      return;
    }
    
    // If dragging to a new column
    if (sourceColumn.id !== overColumn.id) {
      const destinationIndex = overTask
        ? overColumn.taskIds.indexOf(overId)
        : overColumn.taskIds.length;
      
      moveTask(activeId, sourceColumn.id, overColumn.id, destinationIndex);
    } 
    // If reordering within the same column
    else if (overTask && activeId !== overId) {
      const oldIndex = sourceColumn.taskIds.indexOf(activeId);
      const newIndex = sourceColumn.taskIds.indexOf(overId);
      
      // Update the order in the same column
      const newTaskIds = arrayMove(sourceColumn.taskIds, oldIndex, newIndex);
      const updatedColumn = { ...sourceColumn, taskIds: newTaskIds };
      
      // We don't have a direct action for this, so we simulate the move
      const destinationIndex = newIndex;
      moveTask(activeId, sourceColumn.id, sourceColumn.id, destinationIndex);
    }
    
    setActiveId(null);
  };
  
  const handleAddColumn = (e) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setShowNewColumnForm(false);
    }
  };
  
  // Find the active task for overlay
  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 px-6 pt-6">
        <h1 className="text-2xl font-bold gradient-text">Kanban Task Board</h1>
        <a 
          href="https://www.zapt.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-light-400 hover:text-light-300"
        >
          Made on ZAPT
        </a>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 h-full overflow-x-auto pb-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={getColumnTasks(column.id)}
              />
            ))}
            
            {/* Add New Column */}
            <div className="w-80 min-w-80 h-min glass-card flex flex-col items-center justify-center p-4">
              {showNewColumnForm ? (
                <form onSubmit={handleAddColumn} className="w-full">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column name"
                    className="form-input mb-3"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewColumnForm(false)}
                      className="btn btn-ghost cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary cursor-pointer"
                      disabled={!newColumnTitle.trim()}
                    >
                      Add Column
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewColumnForm(true)}
                  className="w-full h-24 flex items-center justify-center text-light-400 hover:text-primary-400 transition-colors cursor-pointer"
                >
                  <FiPlus className="mr-2" size={20} />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          </div>
          
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default TaskBoard;