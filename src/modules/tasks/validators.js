/**
 * Validates a task object
 * @param {Object} task - Task to validate
 * @returns {boolean} - Whether the task is valid
 */
export const validateTask = (task) => {
  if (!task) return false;
  if (!task.id) return false;
  if (!task.title || task.title.trim() === '') return false;
  if (!task.columnId) return false;
  return true;
};

/**
 * Validates a column object
 * @param {Object} column - Column to validate
 * @returns {boolean} - Whether the column is valid
 */
export const validateColumn = (column) => {
  if (!column) return false;
  if (!column.id) return false;
  if (!column.title || column.title.trim() === '') return false;
  return true;
};