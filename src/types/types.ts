export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  due_date?: string | null;
  list_id?: number | null;
  user_id: string;
  order?: number;
}

export interface TaskList {
  id: number;
  user_id: string;
  name: string;
}