import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserCircle, PlusCircle, Settings, LogOut } from 'lucide-react'
import { TaskList } from '@/types/types'
import { Input } from "@/components/ui/input"

interface SidebarProps {
  lists: TaskList[]
  onAddList: (name: string) => void
  handleLogout: () => void
}

export default function Sidebar({ lists, onAddList, handleLogout }: SidebarProps) {
  const router = useRouter()
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState('')

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault()
    if (newListName.trim()) {
      onAddList(newListName.trim())
      setNewListName('')
      setShowNewListForm(false)
    }
  }

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col h-full">
      <div className="flex-grow">
        <h2 className="text-lg font-semibold mb-4">Task Manager</h2>
        {/* Add any other sidebar content here */}
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Lists</h3>
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-2">
            {lists.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lists created yet</p>
            ) : (
              lists.map(list => (
                <div key={list.id} className="text-sm">
                  {list.name}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {showNewListForm ? (
          <form onSubmit={handleAddList} className="mt-2">
            <Input
              type="text"
              placeholder="New list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button type="submit" size="sm">Add</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewListForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowNewListForm(true)} className="mt-2 w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            New List
          </Button>
        )}
      </div>
      <div className="mt-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="h-5 w-5 mr-2" />
              Profile
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}