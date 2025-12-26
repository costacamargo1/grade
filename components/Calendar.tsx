// components/Calendar.tsx
'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  setCurrentDate: (date: Date) => void;
}

export default function Calendar({ currentDate, onDateSelect, setCurrentDate }: CalendarProps) {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = [];
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(year, month, i));
  }
  
  const startingDayIndex = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg border w-80">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100">
          <ChevronLeft size={20} />
        </button>
        <div className="text-sm font-bold text-slate-900">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-500">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map(date => (
          <button
            key={date.toString()}
            onClick={() => onDateSelect(date)}
            className={`
              p-2 text-sm rounded-full text-center font-medium
              ${isToday(date) ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
