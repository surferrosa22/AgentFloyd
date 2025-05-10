'use client';

import { useState } from 'react';
import { useChat } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function ChatSidebar() {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    switchChat, 
    updateChatTitle, 
    deleteChat 
  } = useChat();
  
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Sort chats by updatedAt (newest first)
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  
  const handleNewChat = () => {
    createNewChat();
  };
  
  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };
  
  const saveTitle = (chatId: string) => {
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };
  
  const cancelEditing = () => {
    setEditingChatId(null);
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden bg-black/30 backdrop-blur-lg border-r border-white/5">
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {sortedChats.map((chat) => (
          <div 
            key={chat.id} 
            className={cn(
              "group flex items-center justify-between rounded-lg p-2 text-sm transition-colors",
              currentChatId === chat.id 
                ? "bg-primary/20 text-primary" 
                : "hover:bg-white/5 text-white/70"
            )}
          >
            {editingChatId === chat.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle(chat.id);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  className="flex-1 bg-black/20 px-2 py-1 rounded text-white outline-none border border-white/10 focus:ring-1 focus:ring-primary/50"
                  ref={(input) => input?.focus()}
                />
                <Button variant="ghost" size="icon" onClick={() => saveTitle(chat.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => switchChat(chat.id)}
                  className="flex flex-1 items-center gap-2 overflow-hidden text-left"
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                  
                  <span className="ml-auto text-xs opacity-50">
                    {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                  </span>
                </button>
                
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTitle(chat.id, chat.title);
                    }}
                    className="h-7 w-7"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 