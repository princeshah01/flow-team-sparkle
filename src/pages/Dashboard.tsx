
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name),
          created_by_profile:profiles!tasks_created_by_fkey(full_name),
          group:groups(name)
        `)
        .eq('assigned_to', user.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: groupTasks = [] } = useQuery({
    queryKey: ['group-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name),
          created_by_profile:profiles!tasks_created_by_fkey(full_name),
          group:groups(name)
        `)
        .not('assigned_to', 'eq', user.id)
        .eq('status', 'pending')
        .not('group_id', 'is', null)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => setShowTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3"
          size="sm"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">My Tasks</h2>
          <TaskList tasks={myTasks} showAssignee={false} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Group Tasks</h2>
          <TaskList tasks={groupTasks} showAssignee={true} />
        </div>
      </div>

      <TaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
      />
    </div>
  );
};

export default Dashboard;
