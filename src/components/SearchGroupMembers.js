import React, { useEffect, useState } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast';
import axios from 'axios';

const SearchGroupMembers = ({ onClose, setGroupCreated}) => {
    const [searchGroupMembers, setSearchGroupMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [groupName, setGroupName] = useState(""); // New state for group name
    const navigate = useNavigate();

    const handleSearchGroupMembers = async () => {
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/search-user`;
        try {
            setLoading(true);
            const response = await axios.post(URL, { search });
            setLoading(false);
            setSearchGroupMembers(response.data.data);
            setSelectedUsers([]);
            setSelectAll(false);
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    useEffect(() => {
        handleSearchGroupMembers();
    }, [search]);

    const handleSelectUser = (user) => {
        setSelectedUsers((prevSelectedUsers) => {
            if (prevSelectedUsers.some(u => u.email === user.email)) {
                return prevSelectedUsers.filter(u => u.email !== user.email);
            } else {
                return [...prevSelectedUsers, user._id];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(searchGroupMembers.map(user => user._id));
        }
        setSelectAll(!selectAll);
    };

    const handleCreateGroup = async () => {
        if (!groupName) {
            toast.error("Please enter a group name");
            return;
        }
    
        const groupData = {
            groupName,
            members: selectedUsers,
        };
    
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/create-group`;
        try {
            const response = await axios.post(URL, groupData);
            if (response.data.success) {
                toast.success("Group created successfully!");
                setGroupCreated(true);
                setTimeout(() => setGroupCreated(false), 1000); // Reset after 3 seconds
                onClose();
            } else {
                toast.error(response.data.message || "Failed to create group");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create group");
        }
    };
    

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
            <div className='w-full max-w-lg mx-auto mt-10'>
                {/* Group Name Input */}
                <div className='bg-white rounded mb-4 p-2 flex items-center'>
    <input
        type='text'
        placeholder='Enter group name'
        className='w-full outline-none py-2 px-4 rounded border mr-2'
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
    />
    <button
        className={`bg-blue-500 text-white px-4 py-2 rounded ${
            selectedUsers.length === 0 || !groupName ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleCreateGroup}
        disabled={selectedUsers.length === 0 || !groupName}
    >
        Create Group
    </button>
                </div>


                {/* Search Box */}
                <div className='bg-white rounded h-14 overflow-hidden flex'>
                    <input 
                        type='text'
                        placeholder='Search user by name, email...'
                        className='w-full outline-none py-1 h-full px-4'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline size={25} />
                    </div>
                </div>

                {/* User List */}
                <div className='bg-white mt-2 w-full p-4 rounded h-full max-h-[70vh] overflow-scroll'>
                    {searchGroupMembers.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>No user found!</p>
                    )}
                    {loading && <Loading />}
                    {searchGroupMembers.length !== 0 && !loading && (
                        <>
                            <div className='flex items-center mb-2'>
                                <input
                                    type='checkbox'
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                                <label className='ml-2'>Select All</label>
                            </div>
                            {searchGroupMembers.map(user => (
                                <div key={user._id} className='flex items-center mb-2'>
                                    <input
                                        type='checkbox'
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => handleSelectUser(user)}
                                    />
                                    <UserSearchCard user={user} onClose={onClose} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
                
            </div>
      

            {/* Close Button */}
            <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
                <button>
                    <IoClose />
                </button>
            </div>
           
        </div>
    );
};

export default SearchGroupMembers;
