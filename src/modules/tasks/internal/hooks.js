import { useState, useCallback } from 'react';
import { useTaskContext } from './state';

/**
 * Hook for managing task form state
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} - Form state and handlers
 */
export const useTaskForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState({
    title: '',
    description: '',
    columnId: 'todo',
    ...initialValues,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!values.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      // Reset form on success if it's a new task
      if (!initialValues.id) {
        setValues({
          title: '',
          description: '',
          columnId: values.columnId, // Retain the same column
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, initialValues, onSubmit]);
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues,
  };
};

/**
 * Hook for managing task operations
 * @returns {Object} - Task operations
 */
export const useTaskOperations = () => {
  const {
    tasks,
    columns,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTaskContext();
  
  const getTasksByColumn = useCallback((columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return [];
    
    return column.taskIds
      .map(taskId => tasks.find(task => task.id === taskId))
      .filter(Boolean);
  }, [tasks, columns]);
  
  const handleCreateTask = useCallback((values) => {
    return addTask(values.title, values.description, values.columnId);
  }, [addTask]);
  
  const handleUpdateTask = useCallback((taskId, values) => {
    return updateTask(taskId, values);
  }, [updateTask]);
  
  const handleDeleteTask = useCallback((taskId) => {
    return deleteTask(taskId);
  }, [deleteTask]);
  
  const handleMoveTask = useCallback((taskId, sourceColumnId, destinationColumnId, destinationIndex) => {
    return moveTask(taskId, sourceColumnId, destinationColumnId, destinationIndex);
  }, [moveTask]);
  
  return {
    tasks,
    columns,
    getTasksByColumn,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleMoveTask,
  };
};