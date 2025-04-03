/**
 * Creates a copy of the board data with the task moved from one column to another
 * @param {Object} boardData - Current board data
 * @param {string} taskId - ID of the task to move
 * @param {string} sourceColumnId - ID of the source column
 * @param {string} destinationColumnId - ID of the destination column
 * @param {number} destinationIndex - Index in the destination column
 * @returns {Object} - Updated board data
 */
export const moveTask = (
  boardData,
  taskId,
  sourceColumnId,
  destinationColumnId,
  destinationIndex
) => {
  const newBoardData = JSON.parse(JSON.stringify(boardData));
  
  // Find the task in the source column
  const sourceColumn = newBoardData.columns.find(col => col.id === sourceColumnId);
  if (!sourceColumn) return boardData;
  
  const taskIndex = sourceColumn.taskIds.findIndex(id => id === taskId);
  if (taskIndex === -1) return boardData;
  
  // Remove task from source column
  sourceColumn.taskIds.splice(taskIndex, 1);
  
  // Add task to destination column
  const destinationColumn = newBoardData.columns.find(col => col.id === destinationColumnId);
  if (!destinationColumn) return boardData;
  
  destinationColumn.taskIds.splice(destinationIndex, 0, taskId);
  
  // Update task's columnId
  const task = newBoardData.tasks.find(t => t.id === taskId);
  if (task) {
    task.columnId = destinationColumnId;
  }
  
  return newBoardData;
};