import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Trash2, Check, X } from 'lucide-react';
import { Task } from '../types';

const TaskManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Load tasks
  useEffect(() => {
    const saved = localStorage.getItem('study-timer-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save tasks
  const saveTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('study-timer-tasks', JSON.stringify(updated));
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now()
    };
    saveTasks([...tasks, task]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col items-end pointer-events-none">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-[1.5rem] backdrop-blur-[30px] border border-white/20 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
      >
        <ListTodo size={24} />
      </button>

      {/* Drawer */}
      <div className={`pointer-events-auto mt-4 w-80 backdrop-blur-[40px] bg-black/40 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 origin-top-right flex flex-col ${isOpen ? 'opacity-100 scale-100 max-h-[600px]' : 'opacity-0 scale-90 max-h-0 pointer-events-none'}`}>
        
        <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-medium text-lg mb-4 text-right">المهام اليومية</h2>
            
            <div className="flex gap-2">
                <button 
                    onClick={addTask}
                    disabled={!newTaskText}
                    className="p-3 bg-white text-black rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                    <Plus size={20} />
                </button>
                <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="إضافة مهمة جديدة..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm text-right focus:outline-none focus:bg-white/10 placeholder:text-white/30"
                    dir="rtl"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
            {tasks.length === 0 && (
                <div className="text-center text-white/30 py-8 text-sm">لا توجد مهام حالياً</div>
            )}
            
            {tasks.sort((a, b) => b.createdAt - a.createdAt).map(task => (
                <div key={task.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                    
                    <div 
                        className="flex items-center gap-3 cursor-pointer flex-1 justify-end"
                        onClick={() => toggleTask(task.id)}
                    >
                        <span className={`text-sm transition-all text-right ${task.completed ? 'text-white/30 line-through' : 'text-white'}`}>
                            {task.text}
                        </span>
                        <div className={`w-6 h-6 rounded-full border border-white/30 flex items-center justify-center transition-all ${task.completed ? 'bg-white border-white' : 'bg-transparent'}`}>
                            {task.completed && <Check size={14} className="text-black" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;