import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus, FaEnvelope, FaSms, FaUsers } from "react-icons/fa";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar';
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import SearchUsers from './SearchUsers';
import SearchUsersSms from './SearchUsersSms';
import SearchGroupMembers from './SearchGroupMembers';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';
import axios from 'axios'; // Ensure you have axios imported

const Sidebar = () => {
    const user = useSelector(state => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [allUser, setAllUser] = useState([]);
    const [allUserGroups, setAllUserGroups] = useState([]);
    const [openSearchUser, setOpenSearchUser] = useState(false);
    const [openGroupChat, setOpenGroupChat] = useState(false);
    const [isSearchGroupMembersVisible, setSearchGroupMembersVisible] = useState(false);
    const [openSearchUsers, setOpenSearchUsers] = useState(false);
    const [openSearchUsersSms, setOpenSearchUsersSms] = useState(false);
    const [groupCreated, setGroupCreated] = useState(false);


    const socketConnection = useSelector(state => state?.user?.socketConnection);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Use location to get the current path
    const [soundPlayed, setSoundPlayed] = useState(false); // Track if sound has already played

    const handleOpenGroupChat = () => {
        setOpenGroupChat(true); // Update state if needed for other UI effects
        navigate(`/Groups?${user._id}`); // Pass userId as a query parameter
    };
    const fetchUserGroups = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/user-groups?userId=${userId}`);
            setAllUserGroups(response.data.data);
        } catch (error) {
            console.error("Error fetching user groups:", error);
            toast.error("Failed to fetch user groups. Please try again.");
        }
    };
    const handleSearchGroupMembersToggle = () => {
        setSearchGroupMembersVisible((prev) => !prev); // Toggle visibility
    };
    
     // Load the notification sound
    const notificationSound = new Audio('/notification.mp3');

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id);

            socketConnection.on('conversation', (data) => {
                console.log('conversation', data);

                const conversationUserData = data.map((conversationUser, index) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser?.sender
                        };
                    }
                    else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        };
                    } else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        };
                    }
                });
                setAllUser(conversationUserData);
                
                // Handle the 'fetch-user-groups' event
                socketConnection.on('fetch-user-groups', (data) => {

                const groupData = data.map((groupConversation) => {
                    // Check if the group conversation has a message or any other data to process
                    return {
                    ...groupConversation,
                    groupName: groupConversation.groupName,
                    lastMessage: groupConversation.lastMessage,
                    lastMessageTimestamp: groupConversation.lastMessageTimestamp,
                    members: groupConversation.members,
                    };
                });

                // Handle any additional logic if needed after processing groupData
                console.log('Processed group data:', groupData);
                setAllUserGroups(groupData);
                const hasUnseenMessages = groupData.some(group => group.unseenMessages > 0);
                    if (hasUnseenMessages && !soundPlayed) {
                        // Play notification sound if there are unseen messages and sound hasn't been played yet
                        notificationSound.play();
                        setSoundPlayed(true); // Set soundPlayed to true after playing the sound

                        // Show a toast notification
                        toast.info("You have new group messages!", {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                
                });
                
                // Check for any unseen messages
                const hasUnseenMsg = conversationUserData.some(conv => Boolean(conv.unseenMsg));
                if (hasUnseenMsg && !soundPlayed) {  // Only play if sound hasn't played yet
                    notificationSound.play();
                    setSoundPlayed(true); // Set soundPlayed to true after playing the sound

                    toast.info("You have new messages!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
                });
                if(groupCreated)
                    {
                        fetchUserGroups(user._id);
                    }
        }
    }, [socketConnection, user, soundPlayed,groupCreated]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/email");
        localStorage.clear();
    };

    // Check if the current path starts with /Groups
    const isGroupPage = location.pathname.startsWith("/Groups");

    return (
        <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>
            <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between'>
                <div>
                <NavLink 
                        to="/"  // Make sure to specify a valid path here
                        className={({ isActive }) => `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`}
                        title="chat"
                        >
                        <IoChatbubbleEllipses size={20} />
                        </NavLink>



                    <div title='add friend' onClick={() => setOpenSearchUser(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <FaUserPlus size={20} />
                    </div>
                  
                    <div 
                        title="Group chat" 
                        onClick={handleOpenGroupChat} 
                        className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded" 
                        >
                        <FaUsers size={20} />
                        </div>

                    <div title='Send bulk email messages' onClick={() => setOpenSearchUsers(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <FaEnvelope size={20} />
                    </div>

                    <div title='Send bulk SMS messages' onClick={() => setOpenSearchUsersSms(true)} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                        <FaSms size={20} />
                    </div>
                </div>

                <div className='flex flex-col items-center'>
                    <button className='mx-auto' title={user?.name} onClick={() => setEditUserOpen(true)}>
                        <Avatar width={40} height={40} name={user?.name} imageUrl={user?.profile_pic} userId={user?._id} />
                    </button>
                    <button title='logout' className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' onClick={handleLogout}>
                        <span className='-ml-2'>
                            <BiLogOut size={20} />
                        </span>
                    </button>
                </div>
            </div>

            {/* Conditionally hide this component if path starts with /Groups */}
            {!isGroupPage && (
                <div className='w-full'>
                    <div className='h-16 flex items-center'>
                        <h2 className='text-xl font-bold p-4 text-slate-800'>Message</h2>
                    </div>
                    <div className='bg-slate-200 p-[0.5px]'></div>

                    <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                        {
                            allUser.length === 0 && (
                                <div className='mt-12'>
                                    <div className='flex justify-center items-center my-4 text-slate-500'>
                                        <FiArrowUpLeft size={50} />
                                    </div>
                                    <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                                </div>
                            )
                        }

                        {
                            allUser.map((conv, index) => {
                                return (
                                    <NavLink to={"/" + conv?.userDetails?._id} key={conv?._id} className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'>
                                        <div>
                                            <Avatar imageUrl={conv?.userDetails?.profile_pic} name={conv?.userDetails?.name} width={40} height={40} />
                                        </div>
                                        <div>
                                            <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                                            <div className='text-slate-500 text-xs flex items-center gap-1'>
                                                <div className='flex items-center gap-1'>
                                                    {conv?.lastMsg?.imageUrl && (
                                                        <div className='flex items-center gap-1'>
                                                            <span><FaImage /></span>
                                                            {!conv?.lastMsg?.text && <span>Image</span>}
                                                        </div>
                                                    )}
                                                    {conv?.lastMsg?.videoUrl && (
                                                        <div className='flex items-center gap-1'>
                                                            <span><FaVideo /></span>
                                                            {!conv?.lastMsg?.text && <span>Video</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                            </div>
                                        </div>
                                        {Boolean(conv?.unseenMsg) && (
                                            <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                        )}
                                    </NavLink>
                                );
                            })
                        }
                    </div>
                </div>
            )}

            {/* display group messages wrt users  */}
            {isGroupPage && (
    <div className='w-full'>
        <div className='h-16 flex items-center'>
            <h2 className='text-xl font-bold p-4 text-slate-800 inline-block'>Groups</h2>
            {/* "+" Button to create new group */}
            <button 
                className='bg-blue-500 text-white rounded-full p-2 ml-1 flex items-end  hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 transition-all duration-300 shadow-md'
                onClick={handleSearchGroupMembersToggle}
                title='Create New Group'
            > 
            

                <span className='text-lg font-bold'>+</span>
            </button>
        </div>
        <div className='bg-slate-200 p-[0.5px]'></div>

        <div className='h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
            {
                allUserGroups.length === 0 && (
                    <div className='mt-12'>
                        <div className='flex justify-center items-center my-4 text-slate-500'>
                            <FiArrowUpLeft size={50} />
                        </div>
                        <p className='text-lg text-center text-slate-400'>Create user Groups to start a conversation.</p>
                    </div>
                )
            }

{
    allUserGroups.map((group, index) => {
        return (
            <NavLink
                to={`/Groups/${user._id}/${group?._id}`}
                key={group?._id}
                className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'
            >
                <div>
                    <Avatar imageUrl={group?.profile_pic} name={group?.groupName} width={40} height={40} />
                </div>
                <div>
                    <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{group?.groupName}</h3>
                    <div className='text-slate-500 text-xs flex items-center gap-1'>
                        {group?.lastMessage?.imageUrl && (
                            <div className='flex items-center gap-1'>
                                <span><FaImage /></span>
                                {!group?.lastMessage?.text && <span>Image</span>}
                            </div>
                        )}
                        {group?.lastMessage?.videoUrl && (
                            <div className='flex items-center gap-1'>
                                <span><FaVideo /></span>
                                {!group?.lastMessage?.text && <span>Video</span>}
                            </div>
                        )}
                    </div>
                    <p className='text-ellipsis line-clamp-1'>{group?.lastMessage?.text}</p>
                </div>
                {Boolean(group?.unseenMessages) && (
                    <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{group?.unseenMessages}</p>
                )}
            </NavLink>
        );
    })
}

        </div>
    </div>
)}



            {/* Edit user details */}
            {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}

            {/* Search user */}
            {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
            {/* Search users */}
            {openSearchUsers && <SearchUsers onClose={() => setOpenSearchUsers(false)} />}
            {/* Search users for SMS */}
            {openSearchUsersSms && <SearchUsersSms onClose={() => setOpenSearchUsersSms(false)} />}
            {isSearchGroupMembersVisible && (
                       <div className='absolute top-0 left-0 w-full h-full bg-white z-50 p-4'>
                       <SearchGroupMembers 
                           onClose={() => setSearchGroupMembersVisible(false)} 
                           setGroupCreated={setGroupCreated}
                       />
                   </div>
                    )}
        </div>
    );
};

export default Sidebar;
