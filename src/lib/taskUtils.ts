import { supabase } from '../app/lib/supabase'

interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string | null;
  is_complete?: boolean;
  list_id?: number | null;
  status?: 'To Do' | 'In Progress' | 'Done';
}

export async function logTaskActivity(taskId: number, userId: string, action: string, updates?: TaskUpdate) {
  let activityDescription = action;

  if (updates) {
    const updateDescriptions = [];
    if (updates.title !== undefined) updateDescriptions.push("title");
    if (updates.description !== undefined) updateDescriptions.push("description");
    if (updates.due_date !== undefined) updateDescriptions.push("due date");
    if (updates.status !== undefined) {
      activityDescription = `Changed status to ${updates.status}`;
    }
    if (updates.list_id !== undefined) updateDescriptions.push("list");

    if (updateDescriptions.length > 0 && !activityDescription) {
      activityDescription = `Updated task details: ${updateDescriptions.join(", ")}`;
    }
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({ task_id: taskId, user_id: userId, action: activityDescription })
    .select()

  if (error) {
    console.error('Error logging activity:', error)
  }

  return data ? data[0] : null
}

export async function logAttachmentActivity(taskId: number, userId: string, action: string, fileName: string) {
  const activityDescription = `${action} attachment: ${fileName}`;
  
  const { data, error } = await supabase
    .from('activities')
    .insert({ task_id: taskId, user_id: userId, action: activityDescription })
    .select()

  if (error) {
    console.error('Error logging attachment activity:', error)
  }

  return data ? data[0] : null
}

export async function logNoteActivity(taskId: number, userId: string, action: string) {
  const { data, error } = await supabase
    .from('activities')
    .insert({ task_id: taskId, user_id: userId, action })
    .select()

  if (error) {
    console.error('Error logging note activity:', error)
  }

  return data ? data[0] : null
}