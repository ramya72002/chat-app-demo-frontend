import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Groups = ({ onClose }) => {
    const user = useSelector(state => state.user);
    const socketConnection = useSelector(state => state?.user?.socketConnection);
    const [groups, setGroups] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [soundPlayed, setSoundPlayed] = useState(false);

    const location = useLocation();
    const userId = new URLSearchParams(location.search).get('userId');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/user-groups?userId=${userId}`);
                setGroups(response.data.data || []);
            } catch (error) {
                console.error("Error fetching groups via API:", error);
            }
        };

        fetchGroups();

        if (socketConnection) {
            socketConnection.emit('message-page', userId);
            // socketConnection.emit('fetch-user-groups', userId);

            socketConnection.on('user-groups', (data) => {
                setGroups(Array.isArray(data) ? data : []);
            });

            socketConnection.on('groupCreated', () => {
                socketConnection.emit('fetch-user-groups', userId);
            });

            socketConnection.on('groupMessage', (newMsg) => {
                if (newMsg.groupId === selectedGroup?._id) {
                    setMessages(prevMessages => [...prevMessages, newMsg]);

                    if (newMsg.senderId._id !== user._id && !soundPlayed) {
                        new Audio('/notification.mp3').play();
                        setSoundPlayed(true);
                        toast.info("New message in group!", { position: "top-right", autoClose: 5000 });
                    }
                }
            });
        }

    }, [socketConnection, user._id, userId, selectedGroup, soundPlayed]);

    const handleGroupSelect = async (group) => {
        setSelectedGroup(group);
        setSoundPlayed(false);

        try {
            const response = await axios.get(`http://localhost:8080/api/group-messages?groupId=${group._id}`);
            setMessages(response.data.data);
        } catch (error) {
            console.error('Error fetching group messages:', error);
        }

        if (socketConnection) {
            socketConnection.emit('joinGroup', group._id);
        } else {
            console.error('Socket connection is not available.');
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedGroup) return;

        const messageData = {
            groupId: selectedGroup._id,
            senderId: userId,
            message: newMessage,
        };

        try {
            socketConnection.emit('sendGroupMessage', messageData);

            const response = await axios.post('http://localhost:8080/api/send-group-message', messageData);

            if (response.data.success) {
                setMessages((prevMessages) => [...prevMessages, response.data.data]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    return (
        <div className='flex h-screen'>
            {/* Group List Section */}
            <div className="group-chat-container p-6 bg-white shadow-lg rounded-l-lg w-1/4">
                <button onClick={onClose} className="close-button absolute top-4 right-4 text-lg font-bold text-gray-600">
                    &times;
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Group Chats</h2>

                <div className="groups-list">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <div
                                key={group._id}
                                onClick={() => handleGroupSelect(group)}
                                className={`group-item p-4 mb-3 cursor-pointer rounded-lg transition-colors duration-300 ease-in-out 
                                ${selectedGroup?._id === group._id ? 'bg-blue-200 text-blue-800' : 'bg-gray-50 hover:bg-blue-100'}`}
                            >
                                {group.groupName}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No groups available.</p>
                    )}
                </div>
            </div>

            {/* Messages Section */}
            <div className="messages-container flex-1 p-6 bg-gray-50 border-l border-gray-200">
                {selectedGroup ? (
                    <div className="messages-area bg-white border rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-xl text-gray-800 mb-4">{selectedGroup.groupName}</h3>
                        <div className="messages-list max-h-[400px] overflow-y-auto mb-4">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div key={msg._id} className="message-item mb-4 p-3 rounded-lg border">
                                        <strong className="text-blue-600">{msg.senderId.name}:</strong> <span>{msg.message}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No messages yet.</p>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="message-input flex items-center space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="border p-3 rounded-lg w-full shadow-md"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="send-button bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">Select a group to view messages.</p>
                )}
            </div>
        </div>
    );
};

export default Groups;
