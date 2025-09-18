import React, { useState } from 'react';
import IntranetLayout from '../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../components/security/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Users,
  User,
  Clock,
  Filter,
  MoreVertical,
  Reply,
  Forward,
  Archive,
  Trash2
} from 'lucide-react';

interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    avatar?: string;
  };
  to: string[];
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'direct' | 'group' | 'announcement';
  attachments?: { name: string; url: string }[];
}

interface Thread {
  id: string;
  participants: { id: string; name: string; avatar?: string }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'direct' | 'group';
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  });
  const [showNewMessage, setShowNewMessage] = useState(false);
  
  // Empty arrays - no fake data
  const [messages] = useState<Message[]>([]);
  const [threads] = useState<Thread[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement message sending
    console.log('Sending message:', newMessage);
    setNewMessage({ to: '', subject: '', content: '' });
    setShowNewMessage(false);
  };

  const tabs = [
    { id: 'inbox', label: 'Inbox', count: 0 },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'archived', label: 'Archived', count: 0 },
    { id: 'drafts', label: 'Drafts', count: 0 }
  ];

  return (
    <ProtectedRoute>
      <IntranetLayout title="Messages">
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } flex-1 py-2 px-1 border-b-2 font-medium text-sm flex items-center justify-center space-x-1`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === 'inbox' ? "You don't have any messages yet." : 
                     activeTab === 'sent' ? "You haven't sent any messages." :
                     activeTab === 'archived' ? "No archived messages." : 
                     "No draft messages."}
                  </p>
                  {activeTab === 'inbox' && (
                    <button
                      onClick={() => setShowNewMessage(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Send Your First Message
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !message.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{message.from.name}</p>
                            <p className="text-xs text-gray-500">{message.timestamp}</p>
                          </div>
                        </div>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{message.subject}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <>
                {/* Message Thread Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Message Thread</h3>
                      <p className="text-sm text-gray-500">Conversation with team</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Reply className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Forward className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Archive className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Message thread would be displayed here */}
                  <div className="text-center text-gray-500 mt-8">
                    Select a message to view the conversation
                  </div>
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <textarea
                      rows={2}
                      placeholder="Type your reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Welcome to Messages
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Stay connected with your team. Send direct messages, create group chats, and receive important announcements.
                  </p>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start a Conversation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">New Message</h3>
                  <button
                    onClick={() => setShowNewMessage(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <input
                      type="text"
                      value={newMessage.to}
                      onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter recipient name or email..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Message subject..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your message..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewMessage(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </IntranetLayout>
    </ProtectedRoute>
  );
}