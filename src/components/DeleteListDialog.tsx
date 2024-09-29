import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeleteListDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (action: 'move' | 'delete', targetListId?: number) => void
  lists: { id: number; name: string }[]
  currentListId: number
}

export function DeleteListDialog({ isOpen, onClose, onConfirm, lists, currentListId }: DeleteListDialogProps) {
  const [action, setAction] = useState<'move' | 'delete'>('move')
  const [targetListId, setTargetListId] = useState<number | undefined>(undefined)

  const handleConfirm = () => {
    onConfirm(action, action === 'move' ? targetListId : undefined)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete List</DialogTitle>
          <DialogDescription>
            This list contains tasks. What would you like to do with them?
          </DialogDescription>
        </DialogHeader>
        <Select onValueChange={(value) => setAction(value as 'move' | 'delete')} defaultValue="move">
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="move">Move tasks to another list</SelectItem>
            <SelectItem value="delete">Delete all tasks in this list</SelectItem>
          </SelectContent>
        </Select>
        {action === 'move' && (
          <Select onValueChange={(value) => setTargetListId(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select target list" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Tasks</SelectItem>
              {lists.filter(list => list.id !== currentListId).map(list => (
                <SelectItem key={list.id} value={list.id.toString()}>{list.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}