import React, { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity } from 'lucide-react'

interface ActivityItem {
  id: number
  task_id: number
  user_id: string
  action: string
  created_at: string
}

export default function ActivityFeed({ taskId }: { taskId: number }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    fetchActivities()

    const channel = supabase
      .channel(`public:activities:task_id=eq.${taskId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activities', 
          filter: `task_id=eq.${taskId}` 
        }, 
        (payload) => {
          setActivities(currentActivities => [payload.new as ActivityItem, ...currentActivities])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId])

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(50)  // Limit the number of activities fetched

    if (error) {
      console.error('Error fetching activities:', error)
    } else {
      setActivities(data || [])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-4 w-4" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {activities.map(activity => (
            <div key={activity.id} className="mb-4 last:mb-0">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}