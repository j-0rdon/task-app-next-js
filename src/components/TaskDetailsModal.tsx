import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import TaskDetails from './TaskDetails'
import { AnimatePresence, motion } from "framer-motion"

interface TaskDetailsModalProps {
  taskId: number
  userId: string
  isOpen: boolean
  onClose: () => void
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ taskId, userId, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(null)
    }
  }, [isOpen, taskId])

  const handleTaskDetailsLoaded = () => {
    setIsLoading(false)
  }

  const handleTaskDetailsError = (errorMessage: string) => {
    setError(errorMessage)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>View and edit task details</DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-red-500">{error}</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TaskDetails 
                taskId={taskId} 
                userId={userId} 
                onClose={onClose} 
                onLoaded={handleTaskDetailsLoaded}
                onError={handleTaskDetailsError}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
)

export default TaskDetailsModal