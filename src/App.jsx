import React from 'react';
import TaskBoard from '@/modules/tasks/ui/TaskBoard';
import { TaskProvider } from '@/modules/tasks/internal/state';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-100 text-light-100">
      <TaskProvider>
        <div className="h-full flex flex-col">
          <TaskBoard />
        </div>
      </TaskProvider>
      
      {/* Futuristic background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}