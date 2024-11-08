import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios';
import toast from 'react-hot-toast';

const PROVIDERS = {
  "AT&T": { "sms": "txt.att.net", "mms": "mms.att.net", "mms_support": true },
  "Boost Mobile": { "sms": "sms.myboostmobile.com", "mms": "myboostmobile.com", "mms_support": true },
  "C-Spire": { "sms": "cspire1.com", "mms_support": false },
  "Cricket Wireless": { "sms": "sms.cricketwireless.net", "mms": "mms.cricketwireless.net", "mms_support": true },
  "Consumer Cellular": { "sms": "mailmymobile.net", "mms_support": false },
  "Google Project Fi": { "sms": "msg.fi.google.com", "mms_support": true },
  "Metro PCS": { "sms": "mymetropcs.com", "mms_support": true },
  "Mint Mobile": { "sms": "mailmymobile.net", "mms_support": false },
  "Page Plus": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "Republic Wireless": { "sms": "text.republicwireless.com", "mms_support": false },
  "Sprint": { "sms": "messaging.sprintpcs.com", "mms": "pm.sprint.com", "mms_support": true },
  "Straight Talk": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "T-Mobile": { "sms": "tmomail.net", "mms_support": true },
  "Ting": { "sms": "message.ting.com", "mms_support": false },
  "Tracfone": { "sms": "", "mms": "mmst5.tracfone.com", "mms_support": true },
  "U.S. Cellular": { "sms": "email.uscc.net", "mms": "mms.uscc.net", "mms_support": true },
  "Verizon": { "sms": "vtext.com", "mms": "vzwpix.com", "mms_support": true },
  "Virgin Mobile": { "sms": "vmobl.com", "mms": "vmpix.com", "mms_support": true },
  "Xfinity Mobile": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
};

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    provider: "",
    profile_pic: "",
  });
  const [uploadPhoto, setUploadPhoto] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setUploadPhoto(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url,
    }));
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;

    try {
      const response = await axios.post(URL, data);
      console.log("response", response);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          phone: "",
          provider: "",
          profile_pic: "",
        });

        navigate('/email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    console.log('data', data);
  };

  return (
    <div className="mt-5">
      <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto">
        <h3>Welcome to Chat app!</h3>

        <form className="grid gap-4 mt-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name :</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div className='flex flex-col gap-1'>
                <label htmlFor='password'>Password :</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  placeholder='enter your password' 
                  className='bg-slate-100 px-2 py-1 focus:outline-primary'
                  value={data.password}
                  onChange={handleOnChange}
                  required
                />
              </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone">Phone :</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.phone}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="provider">Provider :</label>
            <select
              id="provider"
              name="provider"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.provider}
              onChange={handleOnChange}
              required
            >
              <option value="">Select provider</option>
              {Object.keys(PROVIDERS).map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile_pic">
              Photo :
              <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer">
                <p className="text-sm max-w-[300px] text-ellipsis line-clamp-1">
                  {uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"}
                </p>
                {uploadPhoto?.name && (
                  <button className="text-lg ml-2 hover:text-red-600" onClick={handleClearUploadPhoto}>
                    <IoClose />
                  </button>
                )}
              </div>
            </label>
            <input
              type="file"
              id="profile_pic"
              name="profile_pic"
              className="bg-slate-100 px-2 py-1 focus:outline-primary hidden"
              onChange={handleUploadPhoto}
            />
          </div>

          <button className="bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
            Register
          </button>
        </form>

        <p className="my-3 text-center">
          Already have an account? <Link to="/email" className="hover:text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
