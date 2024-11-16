import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';
import { IoMdSend } from "react-icons/io";
import moment from 'moment';

const GroupMessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(state => state?.user?.socketConnection);
  const user = useSelector(state => state?.user);
  const [dataUser, setDataUser] = useState({
    groupName: ""
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(prev => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage(prev => ({
      ...prev,
      imageUrl: uploadPhoto.url
    }));
  };

  const handleClearUploadImage = () => {
    setMessage(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage(prev => ({
      ...prev,
      videoUrl: uploadPhoto.url
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage(prev => ({
      ...prev,
      videoUrl: ""
    }));
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('group-message-page', params.userId, params.groupId);

      socketConnection.on('group-name', (data) => {
        console.log("Group name received:", data.groupName);
        setDataUser(data);
      });

      socketConnection.on('group-message-user', (data) => {
        console.log('Group Message data1:', data);
        setAllMessage(data);
      });

       
    }
  }, [socketConnection, params?.userId, params?.groupId]); // Trigger re-run when groupId changes

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      text: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
        if (socketConnection) {
            // Emit to multiple users in the group (e.g., group members)
            socketConnection.emit('new group message', {
                senderId: user?._id,
                groupId: params.groupId,  // Add the group ID
                text: message.text,
                imageUrl: message.imageUrl,
                videoUrl: message.videoUrl,
                msgByUserId: user?._id
            });
            setMessage({
                text: "",
                imageUrl: "",
                videoUrl: ""
            });
        }
    }
};


  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className="bg-no-repeat bg-cover">
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>{dataUser?.groupName}</div>
        </div>
      </header>

      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}
            >
              <div className="w-full relative">
                {msg?.imageUrl && <img src={msg?.imageUrl} className="w-full h-full object-scale-down" />}
                {msg?.videoUrl && <video src={msg.videoUrl} className="w-full h-full object-scale-down" controls />}
              </div>
              <h1>{msg.msgByName}</h1>
              <p className="px-2">{msg.text}</p>
              <p className="text-xs ml-auto w-fit">{moment(msg.createdAt).format("hh:mm")}</p>
            </div>
          ))}
        </div>

        {/* Upload Image Display */}
        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600" onClick={handleClearUploadImage}>
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <img src={message.imageUrl} alt="UploadImage" className="aspect-square w-full h-full max-w-sm m-2 object-scale-down" />
            </div>
          </div>
        )}

        {/* Upload Video Display */}
        {message.videoUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600" onClick={handleClearUploadVideo}>
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <video src={message.videoUrl} className="aspect-square w-full h-full max-w-sm m-2 object-scale-down" controls muted autoPlay />
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <button onClick={handleUploadImageVideoOpen} className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white">
            <FaPlus size={20} />
          </button>

          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
              <form>
                <label htmlFor="uploadImage" className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer">
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label htmlFor="uploadVideo" className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer">
                  <div className="text-purple-500">
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>

                <input type="file" id="uploadImage" onChange={handleUploadImage} className="hidden" />
                <input type="file" id="uploadVideo" onChange={handleUploadVideo} className="hidden" />
              </form>
            </div>
          )}
        </div>

        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
                  <input
                    type='text'
                    placeholder='Type here message...'
                    className='py-1 px-4 outline-none w-full h-full'
                    value={message.text}
                    onChange={handleOnChange}
                  />
                  <button className='text-primary hover:text-secondary'>
                      <IoMdSend size={28}/>
                  </button>
              </form>
              
      </section>
    </div>
  );
};

export default GroupMessagePage;
