import { createContext, useReducer, useContext, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { eventBus } from '../../core/events';
import { events } from '../events';

// Initial state
const initialColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-accent-blue', taskIds: [] },
  { id: 'inprogress', title: 'In Progress', color: 'bg-accent-purple', taskIds: [] },
  { id: 'review', title: 'Review', color: 'bg-accent-orange', taskIds: [] },
  { id: 'done', title: 'Done', color: 'bg-accent-green', taskIds: [] },
];

const initialTasks = [];

const initialState = {
  tasks: initialTasks,
  columns: initialColumns,
  isLoading: false,
  error: null,
};

// Action types
const actionTypes = {
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK',
  ADD_COLUMN: 'ADD_COLUMN',
  UPDATE_COLUMN: 'UPDATE_COLUMN',
  DELETE_COLUMN: 'DELETE_COLUMN',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_BOARD: 'LOAD_BOARD',
};

// Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TASK: {
      const { task } = action.payload;
      const updatedColumns = state.columns.map(col => {
        if (col.id === task.columnId) {
          return {
            ...col,
            taskIds: [...col.taskIds, task.id],
          };
        }
        return col;
      });
      
      return {
        ...state,
        tasks: [...state.tasks, task],
        columns: updatedColumns,
      };
    }
    
    case actionTypes.UPDATE_TASK: {
      const { taskId, updatedTask } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        ),
      };
    }
    
    case actionTypes.DELETE_TASK: {
      const { taskId } = action.payload;
      const taskToDelete = state.tasks.find(task => task.id === taskId);
      
      if (!taskToDelete) return state;
      
      const updatedColumns = state.columns.map(col => {
        if (col.id === taskToDelete.columnId) {
          return {
            ...col,
            taskIds: col.taskIds.filter(id => id !== taskId),
          };
        }
        return col;
      });
      
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
        columns: updatedColumns,
      };
    }
    
    case actionTypes.MOVE_TASK: {
      const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = action.payload;
      
      const updatedColumns = state.columns.map(col => {
        // Remove from source column
        if (col.id === sourceColumnId) {
          return {
            ...col,
            taskIds: col.taskIds.filter(id => id !== taskId),
          };
        }
        
        // Add to destination column
        if (col.id === destinationColumnId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(destinationIndex, 0, taskId);
          return {
            ...col,
            taskIds: newTaskIds,
          };
        }
        
        return col;
      });
      
      const updatedTasks = state.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            columnId: destinationColumnId,
          };
        }
        return task;
      });
      
      return {
        ...state,
        columns: updatedColumns,
        tasks: updatedTasks,
      };
    }
    
    case actionTypes.ADD_COLUMN: {
      const { column } = action.payload;
      return {
        ...state,
        columns: [...state.columns, column],
      };
    }
    
    case actionTypes.UPDATE_COLUMN: {
      const { columnId, updatedColumn } = action.payload;
      return {
        ...state,
        columns: state.columns.map(col => 
          col.id === columnId ? { ...col, ...updatedColumn } : col
        ),
      };
    }
    
    case actionTypes.DELETE_COLUMN: {
      const { columnId } = action.payload;
      const columnToDelete = state.columns.find(col => col.id === columnId);
      
      if (!columnToDelete) return state;
      
      // Delete all tasks in this column
      const updatedTasks = state.tasks.filter(task => task.columnId !== columnId);
      
      return {
        ...state,
        columns: state.columns.filter(col => col.id !== columnId),
        tasks: updatedTasks,
      };
    }
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
      
    case actionTypes.LOAD_BOARD:
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
};

// Context
const TaskContext = createContext();

// Provider
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedBoard = localStorage.getItem('kanbanBoard');
    if (savedBoard) {
      try {
        const parsedBoard = JSON.parse(savedBoard);
        dispatch({
          type: actionTypes.LOAD_BOARD,
          payload: parsedBoard,
        });
        console.log('Loaded board from localStorage:', parsedBoard);
      } catch (error) {
        console.error('Error loading board from localStorage:', error);
      }
    }
  }, []);
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('kanbanBoard', JSON.stringify({
      tasks: state.tasks,
      columns: state.columns,
    }));
  }, [state.tasks, state.columns]);
  
  // Actions
  const addTask = (title, description, columnId) => {
    const newTask = {
      id: nanoid(),
      title,
      description,
      columnId,
      createdAt: new Date().toISOString(),
    };
    
    dispatch({
      type: actionTypes.ADD_TASK,
      payload: { task: newTask },
    });
    
    eventBus.publish(events.TASK_CREATED, newTask);
    return newTask;
  };
  
  const updateTask = (taskId, updatedTask) => {
    dispatch({
      type: actionTypes.UPDATE_TASK,
      payload: { taskId, updatedTask },
    });
    
    eventBus.publish(events.TASK_UPDATED, { id: taskId, ...updatedTask });
    return { id: taskId, ...updatedTask };
  };
  
  const deleteTask = (taskId) => {
    dispatch({
      type: actionTypes.DELETE_TASK,
      payload: { taskId },
    });
    
    eventBus.publish(events.TASK_DELETED, { id: taskId });
  };
  
  const moveTask = (taskId, sourceColumnId, destinationColumnId, destinationIndex) => {
    dispatch({
      type: actionTypes.MOVE_TASK,
      payload: { taskId, sourceColumnId, destinationColumnId, destinationIndex },
    });
    
    eventBus.publish(events.TASK_MOVED, {
      id: taskId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex,
    });
  };
  
  const addColumn = (title, color = 'bg-accent-blue') => {
    const newColumn = {
      id: nanoid(),
      title,
      color,
      taskIds: [],
    };
    
    dispatch({
      type: actionTypes.ADD_COLUMN,
      payload: { column: newColumn },
    });
    
    eventBus.publish(events.COLUMN_CREATED, newColumn);
    return newColumn;
  };
  
  const updateColumn = (columnId, updatedColumn) => {
    dispatch({
      type: actionTypes.UPDATE_COLUMN,
      payload: { columnId, updatedColumn },
    });
    
    eventBus.publish(events.COLUMN_UPDATED, { id: columnId, ...updatedColumn });
    return { id: columnId, ...updatedColumn };
  };
  
  const deleteColumn = (columnId) => {
    dispatch({
      type: actionTypes.DELETE_COLUMN,
      payload: { columnId },
    });
    
    eventBus.publish(events.COLUMN_DELETED, { id: columnId });
  };
  
  return (
    <TaskContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addColumn,
        updateColumn,
        deleteColumn,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};