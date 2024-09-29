import React, { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Upload, X } from 'lucide-react'
import { logTaskActivity } from '@/lib/taskUtils'
import { logAttachmentActivity } from '@/lib/taskUtils'

interface Attachment {
  id: number
  task_id: number
  file_name: string
  file_url: string
}

interface AttachmentsProps {
  taskId: number
  userId: string  // Add this line
}

export default function Attachments({ taskId, userId }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId)

    if (error) {
      console.error('Error fetching attachments:', error)
    } else {
      setAttachments(data || [])
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(`${taskId}/${file.name}`, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(data.path)

      const { error: insertError } = await supabase
        .from('attachments')
        .insert({ task_id: taskId, file_name: file.name, file_url: publicUrl })

      if (insertError) throw insertError

      await logAttachmentActivity(taskId, userId, "Uploaded", file.name)
      fetchAttachments()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteAttachment = async (id: number, fileName: string) => {
    try {
      await supabase.storage
        .from('attachments')
        .remove([`${taskId}/${fileName}`])

      await supabase
        .from('attachments')
        .delete()
        .eq('id', id)

      await logAttachmentActivity(taskId, userId, "Deleted", fileName)
      fetchAttachments()
    } catch (error) {
      console.error('Error deleting attachment:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Paperclip className="mr-2 h-4 w-4" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button as="span" disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </label>
        </div>
        <ScrollArea className="h-[200px]">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center justify-between mb-2">
              <a 
                href={attachment.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {attachment.file_name}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAttachment(attachment.id, attachment.file_name)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}