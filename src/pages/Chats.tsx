
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, Users } from 'lucide-react';
import ChatRoom from '@/components/ChatRoom';
import CreateChatModal from '@/components/CreateChatModal';

const Chats = () => {
  const { user } = useAuth();
  const [selectedChatroom, setSelectedChatroom] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all users for potential chat creation
  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user's chatrooms
  const { data: chatrooms = [] } = useQuery({
    queryKey: ['user-chatrooms', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('chatroom_members')
        .select(`
          chatroom:chatrooms(
            id,
            name,
            is_direct,
            created_at,
            chatroom_members(
              user_id,
              profiles(full_name, email)
            )
          )
        `)
        .eq('user_id', user.id);
      return data?.map(item => item.chatroom).filter(Boolean) || [];
    },
    enabled: !!user?.id,
  });

  if (selectedChatroom) {
    return (
      <ChatRoom 
        chatroomId={selectedChatroom} 
        onBack={() => setSelectedChatroom(null)} 
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3"
          size="sm"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {chatrooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              No chats yet!<br />
              Start a conversation with someone.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chatrooms.map((chatroom) => {
            const otherMembers = chatroom.chatroom_members?.filter(
              member => member.user_id !== user?.id
            ) || [];
            
            const displayName = chatroom.is_direct 
              ? otherMembers[0]?.profiles?.full_name || otherMembers[0]?.profiles?.email || 'Unknown User'
              : chatroom.name;

            return (
              <Card 
                key={chatroom.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedChatroom(chatroom.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      {chatroom.is_direct ? (
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Users className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{displayName}</h3>
                      <p className="text-sm text-gray-500">
                        {chatroom.is_direct ? 'Direct message' : `${chatroom.chatroom_members?.length || 0} members`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateChatModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        users={users}
      />
    </div>
  );
};

export default Chats;
