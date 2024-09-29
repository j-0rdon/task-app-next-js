import React, { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send } from 'lucide-react'
import { logNoteActivity } from '@/lib/taskUtils'

interface Note {
  id: number
  task_id: number
  user_id: string
  content: string
  created_at: string
}

interface NotesProps {
  taskId: number
  userId: string  // Add this line
}

export default function Notes({ taskId, userId }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [taskId])

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
    } else {
      setNotes(data || [])
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    const { data, error } = await supabase
      .from('notes')
      .insert({ task_id: taskId, content: newNote.trim() })

    if (error) {
      console.error('Error adding note:', error)
    } else {
      await logNoteActivity(taskId, userId, 'Added a new note')
      setNewNote('')
      fetchNotes()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-4 w-4" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="mb-2"
          />
          <Button onClick={addNote}>
            <Send className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
        <ScrollArea className="h-[200px]">
          {notes.map(note => (
            <div key={note.id} className="mb-4 last:mb-0">
              <p className="text-sm">{note.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}