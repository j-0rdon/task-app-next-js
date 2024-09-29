import React, { useState, useRef } from 'react'
import { Task } from '@/types/types'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, X, CalendarIcon } from 'lucide-react'
import { format, parseISO } from "date-fns"

interface KanbanProps {
  userId: string  // Add this line
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onAddTask: (taskTitle: string) => void
  onSelectTask: (taskId: number) => void
}

export default function Kanban({ userId, tasks, onUpdateTask, onAddTask, onSelectTask }: KanbanProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState('')
  const newTaskInputRef = useRef<HTMLTextAreaElement>(null)

  const onDragStart = (event: React.DragEvent, taskId: number) => {
    event.dataTransfer.setData('text/plain', taskId.toString())
    setIsDragging(true)
  }

  const onDragEnd = () => {
    setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (isDragging) {
      event.currentTarget.classList.add('bg-gray-200')
    }
  }

  const onDragLeave = (event: React.DragEvent) => {
    event.currentTarget.classList.remove('bg-gray-200')
  }

  const onDrop = async (event: React.DragEvent, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    event.preventDefault()
    event.currentTarget.classList.remove('bg-gray-200')
    const taskId = parseInt(event.dataTransfer.getData('text/plain'), 10)
    const updatedTask = tasks.find(task => task.id === taskId)
    
    if (updatedTask && updatedTask.status !== newStatus) {
      onUpdateTask({ ...updatedTask, status: newStatus })
    }
    setIsDragging(false)
  }

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

  const columns: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done']

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
              ref={newTaskInputRef}
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
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      )}
      <div className="flex space-x-4">
        {columns.map(column => (
          <div
            key={column}
            className="flex-1 p-4 rounded-lg transition-colors duration-200"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column)}
          >
            <h3 className="text-lg font-semibold mb-4">{column}</h3>
            <div className="space-y-2">
              {tasks
                .filter(task => task.status === column)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(task => (
                  <div
                    key={task.id}
                    data-task-id={task.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => onSelectTask(task.id)}
                    className={`p-3 bg-white rounded shadow cursor-grab active:cursor-grabbing ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}
                  >
                    <div>{task.title}</div>
                    {task.due_date && (
                      <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(parseISO(task.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}