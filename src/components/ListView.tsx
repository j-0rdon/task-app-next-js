import React, { useState } from 'react'
import { Task, TaskList } from '@/types/types'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"

interface ListViewProps {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onAddTask: (taskTitle: string) => void
  onDeleteTask: (taskId: number) => void
  onSelectTask: (taskId: number) => void
  lists: TaskList[]
}

export default function ListView({ tasks, onUpdateTask, onAddTask, onDeleteTask, onSelectTask, lists }: ListViewProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState('')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim()) {
      onAddTask(newTask.trim())
      setNewTask('')
      setShowNewTaskForm(false)
    }
  }

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTask(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddTask(e)
    } else if (e.key === 'Escape') {
      setShowNewTaskForm(false)
      setNewTask('')
    }
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button 
          onClick={() => setShowNewTaskForm(true)}
          className="mr-4"
          disabled={showNewTaskForm}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Task
        </Button>
        <h2 className="text-sm font-normal text-gray-500">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</h2>
      </div>
      {showNewTaskForm && (
        <form onSubmit={handleAddTask} className="flex items-center space-x-2 mb-4">
          <div className="flex-grow">
            <Textarea
              placeholder="Enter new task"
              value={newTask}
              onChange={handleNewTaskChange}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <Button type="submit" className="mr-2">Add</Button>
            <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
            <Checkbox
              checked={task.status === 'Done'}
              onCheckedChange={() => onUpdateTask({ ...task, status: task.status === 'Done' ? 'To Do' : 'Done' })}
            />
            <span
              className={`flex-1 ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''} cursor-pointer`}
              onClick={() => onSelectTask(task.id)}
            >
              {task.title}
            </span>
            <Select
              value={task.status}
              onValueChange={(value: 'To Do' | 'In Progress' | 'Done') => onUpdateTask({ ...task, status: value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] pl-3 text-left font-normal">
                  {task.due_date ? format(parseISO(task.due_date), 'PPP') : <span>Set due date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.due_date ? parseISO(task.due_date) : undefined}
                  onSelect={(date) => onUpdateTask({ ...task, due_date: date?.toISOString() || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}