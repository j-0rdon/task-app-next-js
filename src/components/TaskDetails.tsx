import React, { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X, Calendar as CalendarIcon, Edit, Check } from 'lucide-react'
import ActivityFeed from './ActivityFeed'
import Attachments from './Attachments'
import Notes from './Notes'
import { logTaskActivity } from '@/lib/taskUtils'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isValid, parseISO } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TaskDetailsProps {
  taskId: number
  userId: string
  onClose: () => void
  onLoaded?: () => void
  onError?: (error: string) => void
  onTaskUpdate?: (updatedTask: Task) => void  // Add this line
}

interface Task {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  list_id: number | null;
  description: string;
  due_date: string | null;
  status: 'To Do' | 'In Progress' | 'Done';
}

export default function TaskDetails({ taskId, userId, onClose, onLoaded, onError, onTaskUpdate }: TaskDetailsProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempEditValue, setTempEditValue] = useState<string>('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  useEffect(() => {
    fetchTaskDetails()
  }, [taskId])

  const fetchTaskDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (error) throw error

      setTask(data)
      if (onLoaded) {
        onLoaded()
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
      if (onError) {
        onError('Failed to load task details. Please try again.')
      }
    }
  }

  const updateTask = async (updates: Partial<Task>) => {
    if (!task) return

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()

    if (error) {
      console.error('Error updating task:', error)
    } else if (data) {
      const updatedTask = { ...task, ...updates }
      setTask(updatedTask)
      await logTaskActivity(taskId, userId, "", updates)
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask)  // Call this function when task is updated
      }
    }
  }

  const startEditing = (field: string, value: string) => {
    setEditingField(field)
    setTempEditValue(value)
  }

  const saveEdit = async (field: string) => {
    if (!task) return

    const updates = { [field]: tempEditValue }
    await updateTask(updates)
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempEditValue('')
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      updateTask({ due_date: date.toISOString() })
    } else {
      updateTask({ due_date: null })
    }
  }

  const handleStatusChange = (newStatus: 'To Do' | 'In Progress' | 'Done') => {
    updateTask({ status: newStatus })
  }

  if (!task) return null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {editingField === 'title' ? (
            <div className="flex items-center">
              <Input 
                value={tempEditValue} 
                onChange={(e) => setTempEditValue(e.target.value)}
                className="mr-2"
              />
              <Button size="sm" onClick={() => saveEdit('title')}><Check className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center">
              {task.title}
              <Button size="sm" variant="ghost" onClick={() => startEditing('title', task.title)}>
                <Edit className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          {editingField === 'description' ? (
            <div className="flex flex-col space-y-2">
              <Textarea 
                id="description"
                value={tempEditValue} 
                onChange={(e) => setTempEditValue(e.target.value)}
              />
              <div>
                <Button size="sm" onClick={() => saveEdit('description')} className="mr-2">Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <p className="flex-grow">{task.description || 'No description'}</p>
              <Button size="sm" variant="ghost" onClick={() => startEditing('description', task.description || '')}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" /> Due Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {task.due_date && isValid(parseISO(task.due_date)) 
                  ? format(parseISO(task.due_date), 'PPP')
                  : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={task.due_date ? parseISO(task.due_date) : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={task.status} onValueChange={(value: 'To Do' | 'In Progress' | 'Done') => updateTask({ status: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ActivityFeed taskId={taskId} />
        <Attachments taskId={taskId} userId={userId} />
        <Notes taskId={taskId} userId={userId} />
      </CardContent>
    </Card>
  )
}