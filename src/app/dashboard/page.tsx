'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  PlusCircle,
  X,
  Trash2,
  ClipboardList,
  CalendarIcon,
  LayoutDashboard,
  Columns,
  Filter,
  ChevronDown,
  MoreVertical,
  Edit,
  Save,
} from 'lucide-react'
import TaskDetails from '@/components/TaskDetails'
import { format, isValid, parseISO } from "date-fns"
import { logTaskActivity } from '@/lib/taskUtils'
import { DeleteListDialog } from '@/components/DeleteListDialog'
import { Task, TaskList } from '@/types/types'
import Sidebar from '@/components/Sidebar'
import Kanban from '@/components/Kanban'
import ListView from '@/components/ListView'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([])
  const [newTask, setNewTask] = useState('')
  const [newList, setNewList] = useState('')
  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [editingListName, setEditingListName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [activeListId, setActiveListId] = useState<number | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [deleteListId, setDeleteListId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [filterListId, setFilterListId] = useState<number | null>(null)
  const [isListPopoverOpen, setIsListPopoverOpen] = useState(false)
  const [isEditingListName, setIsEditingListName] = useState(false)
  const [editedListName, setEditedListName] = useState('')
  const [defaultView, setDefaultView] = useState<'list' | 'kanban'>('list') // You might want to load this from user preferences
  const router = useRouter()
  const newTaskInputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchLists(user.id)
        await fetchTasks(user.id)
      } else {
        router.push('/signin')
      }
      setIsLoading(false)
    }
    getUser()
  }, [router])

  const fetchLists = async (userId: string) => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true })
    
    if (error) console.error('Error fetching lists:', error)
    else setLists(data || [])
  }

  const fetchTasks = async (userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching tasks:', error)
    else setTasks(data || [])
  }

  const handleAddTasks = async () => {
    const taskLines = newTask.split('\n').filter(line => line.trim() !== '')
    const newTasks: Task[] = []

    for (const line of taskLines) {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ 
          title: line.trim(), 
          user_id: user.id, 
          status: 'To Do', 
          list_id: filterListId || null // Use null if no list is selected
        })
        .select()

      if (error) {
        console.error('Error adding task:', error)
      } else if (data) {
        newTasks.push(data[0])
      }
    }

    setTasks(prevTasks => [...newTasks, ...prevTasks])
    setNewTask('')
    setShowNewTaskForm(false)
  }

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task status:', error)
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
      await logTaskActivity(taskId, user.id, "", { status: newStatus })
    }
  }

  const deleteTask = async (id: number) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting task:', error)
    } else {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
    }
  }

  const handleAddList = async (name: string) => {
    if (user) {
      const { data, error } = await supabase
        .from('lists')
        .insert({ name: name, user_id: user.id })
        .select()

      if (error) {
        console.error('Error adding list:', error)
      } else if (data) {
        setLists([...lists, data[0]])
        setActiveListId(data[0].id)
      }
    }
  }

  const handleDeleteList = async (id: number) => {
    const { data: tasksInList } = await supabase
      .from('tasks')
      .select('id')
      .eq('list_id', id)

    if (tasksInList && tasksInList.length > 0) {
      setDeleteListId(id)
    } else {
      await deleteList(id)
    }
  }

  const confirmDeleteList = async (action: 'move' | 'delete', targetListId?: number) => {
    if (!deleteListId) return

    if (action === 'move') {
      await supabase
        .from('tasks')
        .update({ list_id: targetListId || null })
        .eq('list_id', deleteListId)
      
      // Load the target list after moving tasks
      setFilterListId(targetListId || null)
    } else {
      await supabase
        .from('tasks')
        .delete()
        .eq('list_id', deleteListId)
      
      // Load 'All Tasks' after deleting tasks
      setFilterListId(null)
    }

    await deleteList(deleteListId)
    setDeleteListId(null)

    // Refresh tasks after list deletion
    await fetchTasks(user.id)
  }

  const deleteList = async (id: number) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting list:', error)
    } else {
      setLists(prevLists => prevLists.filter(list => list.id !== id))
      if (filterListId === id) {
        setFilterListId(null)
      }
    }
  }

  const startEditingList = (list: TaskList) => {
    setEditingListId(list.id)
    setEditingListName(list.name)
  }

  const saveEditingList = async () => {
    if (editingListId && editingListName.trim()) {
      const { error } = await supabase
        .from('lists')
        .update({ name: editingListName.trim() })
        .eq('id', editingListId)

      if (error) {
        console.error('Error updating list:', error)
      } else {
        setLists(prevLists =>
          prevLists.map(list =>
            list.id === editingListId ? { ...list, name: editingListName.trim() } : list
          )
        )
        setEditingListId(null)
        setEditingListName('')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddTasks()
    } else if (e.key === 'Escape') {
      setShowNewTaskForm(false)
      setNewTask('')
    }
  }

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTask(e.target.value)
  }

  const openNewTaskForm = () => {
    setShowNewTaskForm(true)
    setNewTask('')
    setTimeout(() => {
      if (newTaskInputRef.current) {
        newTaskInputRef.current.focus()
      }
    }, 0)
  }

  const updateTaskList = async (taskId: number, newListId: number | null) => {
    const { error } = await supabase
      .from('tasks')
      .update({ list_id: newListId })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task list:', error)
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, list_id: newListId } : task
        )
      )
    }
  }

  const updateTaskStatus = async (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task status:', error)
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
      await logTaskActivity(taskId, user.id, "", { status: newStatus })
    }
  }

  const updateTaskDueDate = async (taskId: number, newDueDate: Date | null) => {
    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDueDate?.toISOString() || null })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task due date:', error)
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, due_date: newDueDate?.toISOString() || null } : task
        )
      )
      await logTaskActivity(taskId, user.id, "", { due_date: newDueDate?.toISOString() || null })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }

  const filteredTasks = tasks.filter(task => 
    filterListId === null || task.list_id === filterListId
  )

  const handleListSelect = (listId: number | null) => {
    setFilterListId(listId)
    setSelectedTaskId(null) // Close task details view
    setIsListPopoverOpen(false) // Close the popover
    if (viewMode === 'kanban') {
      // Refresh Kanban view with new filter
      setViewMode('list')
      setTimeout(() => setViewMode('kanban'), 0)
    }
  }

  const getPageTitle = () => {
    if (filterListId === null) {
      return 'All Tasks'
    }
    const filterList = lists.find(list => list.id === filterListId)
    return filterList ? filterList.name : 'Filtered Tasks'
  }

  const handleViewModeChange = (mode: 'list' | 'kanban') => {
    setViewMode(mode)
    setSelectedTaskId(null) // Close task details view
  }

  const handleRenameList = () => {
    setIsEditingListName(true)
    setEditedListName(lists.find(l => l.id === filterListId)?.name || '')
  }

  const saveRenamedList = async () => {
    if (filterListId && editedListName.trim()) {
      const { error } = await supabase
        .from('lists')
        .update({ name: editedListName.trim() })
        .eq('id', filterListId)

      if (error) {
        console.error('Error updating list name:', error)
      } else {
        setLists(prevLists =>
          prevLists.map(list =>
            list.id === filterListId ? { ...list, name: editedListName.trim() } : list
          )
        )
        setIsEditingListName(false)
      }
    }
  }

  const updateTask = async (updatedTask: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )
    }
  }

  const handleAddTask = async (taskTitle: string) => {
    const newTask = {
      title: taskTitle,
      user_id: user.id,
      status: 'To Do',
      list_id: filterListId || null
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()

    if (error) {
      console.error('Error adding task:', error)
    } else if (data) {
      setTasks(prevTasks => [data[0], ...prevTasks])
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        lists={lists}
        onAddList={handleAddList}
        handleLogout={handleLogout}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          {isEditingListName && filterListId ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editedListName}
                onChange={(e) => setEditedListName(e.target.value)}
                className="text-3xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <Button onClick={saveRenamedList} variant="ghost" size="sm">
                <Save className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          )}
          <div className="flex space-x-2 items-center">
            <Popover open={isListPopoverOpen} onOpenChange={setIsListPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {filterListId === null ? 'All Tasks' : lists.find(l => l.id === filterListId)?.name}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleListSelect(null)}
                >
                  All Tasks
                </Button>
                {lists.map(list => (
                  <Button
                    key={list.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleListSelect(list.id)}
                  >
                    {list.name}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              onClick={() => handleViewModeChange('list')}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              List View
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
              onClick={() => handleViewModeChange('kanban')}
            >
              <Columns className="h-5 w-5 mr-2" />
              Kanban View
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                {filterListId !== null && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleRenameList}>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename List
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleDeleteList(filterListId)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete List
                    </Button>
                  </>
                )}
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowNewListForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New List
                </Button>
                {/* Removed the "Set as Default" option */}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {selectedTaskId ? (
          <TaskDetails 
            taskId={selectedTaskId} 
            userId={user.id}
            onClose={() => setSelectedTaskId(null)}
            onTaskUpdate={updateTask}
          />
        ) : viewMode === 'kanban' ? (
          <Kanban 
                          tasks={filteredTasks}
                          onUpdateTask={updateTask}
                          onAddTask={handleAddTask}
                          onSelectTask={setSelectedTaskId} userId={''}          />
        ) : (
          <ListView
            tasks={filteredTasks}
            onUpdateTask={updateTask}
            onAddTask={handleAddTask}
            onDeleteTask={deleteTask}
            onSelectTask={setSelectedTaskId}
            lists={lists}
          />
        )}
      </main>
      <DeleteListDialog
        isOpen={deleteListId !== null}
        onClose={() => setDeleteListId(null)}
        onConfirm={confirmDeleteList}
        lists={lists}
        currentListId={deleteListId || 0}
      />
    </div>
  )
}