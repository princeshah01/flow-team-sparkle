
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({ isOpen, onClose, users }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDirectMessage, setIsDirectMessage] = useState(true);

  const createChatMutation = useMutation({
    mutationFn: async () => {
      if (isDirectMessage && selectedUsers.length !== 1) {
        throw new Error('Direct messages require exactly one other user');
      }
      if (!isDirectMessage && (!chatName.trim() || selectedUsers.length === 0)) {
        throw new Error('Group chats require a name and at least one other user');
      }

      // Create chatroom
      const { data: chatroom, error: chatroomError } = await supabase
        .from('chatrooms')
        .insert({
          name: isDirectMessage ? 'Direct Message' : chatName,
          is_direct: isDirectMessage,
          created_by: user!.id,
        })
        .select()
        .single();

      if (chatroomError) throw chatroomError;

      // Add members to chatroom
      const members = [
        { chatroom_id: chatroom.id, user_id: user!.id },
        ...selectedUsers.map(userId => ({ chatroom_id: chatroom.id, user_id: userId }))
      ];

      const { error: membersError } = await supabase
        .from('chatroom_members')
        .insert(members);

      if (membersError) throw membersError;

      return chatroom;
    },
    onSuccess: () => {
      toast({
        title: "Chat created successfully!",
        description: "You can now start messaging.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-chatrooms'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating chat:', error);
      toast({
        title: "Failed to create chat",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUserToggle = (userId: string) => {
    if (isDirectMessage) {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChatMutation.mutate();
  };

  const handleClose = () => {
    setChatName('');
    setSelectedUsers([]);
    setIsDirectMessage(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="directMessage"
              checked={isDirectMessage}
              onCheckedChange={(checked) => {
                setIsDirectMessage(checked as boolean);
                setSelectedUsers([]);
              }}
            />
            <Label htmlFor="directMessage">Direct Message</Label>
          </div>

          {!isDirectMessage && (
            <div>
              <Label htmlFor="chatName">Chat Name</Label>
              <Input
                id="chatName"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter chat name"
                required={!isDirectMessage}
              />
            </div>
          )}

          <div>
            <Label>Select Users</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 mt-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    onCheckedChange={() => handleUserToggle(u.id)}
                  />
                  <span className="text-sm">
                    {u.full_name || u.email}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createChatMutation.isPending || selectedUsers.length === 0}
              className="flex-1"
            >
              {createChatMutation.isPending ? 'Creating...' : 'Create Chat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
