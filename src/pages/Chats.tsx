
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const Chats = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Chat functionality coming soon!<br />
            You'll be able to communicate with your team here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chats;
