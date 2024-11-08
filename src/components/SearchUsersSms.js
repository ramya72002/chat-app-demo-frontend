import React, { useEffect, useState } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast';
import axios from 'axios';

const SearchUsers = ({ onClose }) => {
    const [searchUsers, setSearchUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();

    const handleSearchUsers = async () => {
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/search-users`;
        try {
            setLoading(true);
            const response = await axios.post(URL, { search });
            setLoading(false);
            setSearchUsers(response.data.data);
            console.log("usersdata", response.data.data);

            setSelectedUsers([]);
            setSelectAll(false);
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    useEffect(() => {
        handleSearchUsers();
    }, [search]);

    const handleSelectUser = (user) => {
        setSelectedUsers((prevSelectedUsers) => {
            if (prevSelectedUsers.some(u => u.email === user.email)) {
                return prevSelectedUsers.filter(u => u.email !== user.email);
            } else {
                return [...prevSelectedUsers, { 
                    name: user.name, 
                    email: user.email,
                    phone: user.phone,
                    provider: user.provider 
                }];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(searchUsers.map(user => ({
                name: user.name, 
                email: user.email,
                phone: user.phone,
                provider: user.provider
            })));
        }
        setSelectAll(!selectAll);
    };

    const handleNext = async () => {
        try {
            const sendSmsData = selectedUsers.map(user => ({
                phone: user.phone,
                provider: user.provider
            }));
            console.log("Selected Users Data:", sendSmsData);

            const response = await axios.post('/api/sendSms', sendSmsData);
            console.log("SMS sent successfully", response.data);

            navigate('/sendSms', { state: { selectedRecords: selectedUsers } });
        } catch (error) {
            toast.error("Error sending SMS: " + error?.message);
        }
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
            <div className='w-full max-w-lg mx-auto mt-10'>
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

                <div className='bg-white mt-2 w-full p-4 rounded h-full max-h-[70vh] overflow-scroll'>
                    {searchUsers.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>No user found!</p>
                    )}
                    {loading && <Loading />}
                    {searchUsers.length !== 0 && !loading && (
                        <>
                            <div className='flex items-center mb-2'>
                                <input
                                    type='checkbox'
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                                <label className='ml-2'>Select All</label>
                            </div>
                            {searchUsers.map(user => (
                                <div key={user._id} className='flex items-center mb-2'>
                                    <input
                                        type='checkbox'
                                        checked={selectedUsers.some(u => u.email === user.email)}
                                        onChange={() => handleSelectUser(user)}
                                    />
                                    <UserSearchCard user={user} onClose={onClose} />
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className='mt-4 text-center'>
                    <button
                        className='bg-blue-500 text-white px-4 py-2 rounded'
                        onClick={handleNext}
                        disabled={selectedUsers.length === 0}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
                <button>
                    <IoClose />
                </button>
            </div>
        </div>
    );
};

export default SearchUsers;
