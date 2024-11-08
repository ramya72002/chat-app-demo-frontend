import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom for navigation
import './SendSms.scss';

const SendSms = ({ selectedRecords }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const BATCH_SIZE = 5; // Set batch size to control the number of SMS per request

  const handleSendSMS = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const providerGroups = {};
    selectedRecords.forEach(record => {
      if (!providerGroups[record.provider]) {
        providerGroups[record.provider] = [];
      }
      providerGroups[record.provider].push(record.phone);
    });

    try {
      for (const provider in providerGroups) {
        const numbers = providerGroups[provider];

        // Break numbers into batches
        for (let i = 0; i < numbers.length; i += BATCH_SIZE) {
          const batch = numbers.slice(i, i + BATCH_SIZE);

          // Retry logic for each batch
          let attempts = 0;
          const maxAttempts = 3;
          while (attempts < maxAttempts) {
            try {
              const response = await fetch('/api/send_sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  numbers: batch,
                  message: message,
                  provider: provider,
                }),
              });

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send SMS');
              }

              break; // Exit retry loop on success
            } catch (error) {
              attempts += 1;
              if (attempts === maxAttempts) {
                throw new Error(`Failed to send SMS to batch: ${batch.join(', ')} after ${maxAttempts} attempts`);
              }
            }
          }
        }
      }
      setSuccessMessage('SMS sent successfully to all providers!');
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowPopup(true);
    }
  };

  const redirectToHome = () => {
    navigate('/'); // Redirect to the root path
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    redirectToHome();
  };

  return (
    <div className="containerSendEmail">
      <h1 className="title">Send SMS</h1>

      <label className="label">
        Message:
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          className="textarea"
        />
      </label>

      <button onClick={handleSendSMS} disabled={loading} className="button">
        {loading ? 'Sending...' : 'Send SMS'}
      </button>

      <button onClick={redirectToHome} className="backButton">Back</button>

      {showPopup && (
        <div className="popup">
          <div className="popupContent">
            {successMessage && <p className="successMessage">{successMessage}</p>}
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            <button onClick={handleClosePopup} className="popupButton">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendSms;
