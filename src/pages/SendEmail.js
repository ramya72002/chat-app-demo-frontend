import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SendEmail.scss';

const SendEmail = ({ onBack }) => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation
  const selectedRecords = location.state?.selectedRecords || []; // Access selectedRecords
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSendEmail = async () => {
    if (!subject || !message) {
      setErrorMessage('Subject and message are required.');
      setShowPopup(true);
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Check if selectedRecords is empty
    if (selectedRecords.length === 0) {
      console.log("No records selected!");
      return;
    }

    // Map over selectedRecords to get the emails and names
    const bccEmails = selectedRecords.map(record => record.email).join(', ');
    const names = selectedRecords.map(record => record.name).join(', ');

    // Prepare the data dictionary
    const formData = {
      name: names,
      bcc: bccEmails,
      subject: subject,
      message: message,
      image: null, // initialize as null if no image is provided
    };

    // If an image is provided, convert it to base64 and add it to formData
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        formData.image = reader.result;

        // Send the API call after image is converted
        await sendEmailRequest(formData);
      };
    } else {
      // Send the API call directly if no image
      await sendEmailRequest(formData);
    }
  };

  // Helper function for API call
  const sendEmailRequest = async (formData) => {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/sendEmails`;
    console.log(URL);

    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      console.log("Server Response:", text);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Error sending email');
        } catch (e) {
          throw new Error('Server returned HTML error page');
        }
      }

      const data = JSON.parse(text);
      console.log("Parsed Response:", data);

      setSuccessMessage(data.message);
      setShowPopup(true);
    } catch (error) {
      setErrorMessage('Error sending email: ' + error.message);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const redirectToHome = () => {
    navigate('/'); // Redirect to root path
  };

  return (
    <div className="containerSendEmail">
      <h1 className="title">Send Email</h1>

      <label className="label">
        Subject:
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
          className="input"
        />
      </label>

      <label className="label">
        Message:
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          className="textarea"
        />
      </label>

      <label className="label">
        Upload Image (Optional):
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="input"
        />
      </label>

      <button onClick={handleSendEmail} disabled={loading} className="button">
        {loading ? 'Sending...' : 'Send Email'}
      </button>

      <button onClick={redirectToHome} className="backButton">Back</button>

      {showPopup && (
        <div className="popup">
          <div className="popupContent">
            {successMessage && <p className="successMessage">{successMessage}</p>}
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            <button onClick={redirectToHome} className="popupButton">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendEmail;
