import React from 'react';
import { useTaskContext } from '../internal/state';
import { useTaskForm } from '../internal/hooks';

const TaskForm = ({ initialValues = {}, onSubmit, onCancel, isEditing = false }) => {
  const { columns } = useTaskContext();
  
  const handleSubmitTask = (values) => {
    if (isEditing) {
      const { id } = initialValues;
      const { title, description, columnId } = values;
      const { updateTask } = useTaskContext();
      updateTask(id, { title, description, columnId });
    } else {
      const { addTask } = useTaskContext();
      addTask(values.title, values.description, values.columnId);
    }
    
    if (onSubmit) {
      onSubmit(values);
    }
  };
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useTaskForm(initialValues, handleSubmitTask);
  
  return (
    <form onSubmit={handleSubmit} className="glass-card p-3">
      <div className="mb-3">
        <label htmlFor="title" className="block text-sm font-medium text-light-100 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          className="form-input"
          placeholder="Task title"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>
      
      <div className="mb-3">
        <label htmlFor="description" className="block text-sm font-medium text-light-100 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          className="form-input min-h-[80px]"
          placeholder="Task description (optional)"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="columnId" className="block text-sm font-medium text-light-100 mb-1">
          Status
        </label>
        <select
          id="columnId"
          name="columnId"
          value={values.columnId}
          onChange={handleChange}
          className="form-input"
        >
          {columns.map(column => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;