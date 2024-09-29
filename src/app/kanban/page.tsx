'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Kanban from '@/components/Kanban'
import { Task } from '@/types/types'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, UserCircle } from 'lucide-react'

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchTasks(user.id)
      } else {
        router.push('/signin')
      }
    }
    getUser()
  }, [router, supabase])

  const fetchTasks = async (userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
    
    if (error) console.error('Error fetching tasks:', error)
    else setTasks(data || [])
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id)

    if (error) console.error('Error updating task:', error)
    else setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
  }

  const handleAddTask = async (taskTitle: string) => {
    const newTask = {
      title: taskTitle,
      user_id: user.id,
      status: 'To Do'
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()

    if (error) console.error('Error adding task:', error)
    else if (data) setTasks([...tasks, data[0]])
  }

  const handleSelectTask = (taskId: number) => {
    // Implement task selection logic here
    console.log('Selected task:', taskId)
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 p-6 bg-card border-r">
        <nav className="space-y-2 mb-6">
          <Link href="/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/kanban" className="flex items-center space-x-2 text-foreground hover:text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <span>Kanban</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-2 text-foreground hover:text-primary">
            <UserCircle className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Kanban Board</h1>
        <Kanban
          userId={user.id}
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onAddTask={handleAddTask}
          onSelectTask={handleSelectTask}
        />
      </main>
    </div>
  )
}