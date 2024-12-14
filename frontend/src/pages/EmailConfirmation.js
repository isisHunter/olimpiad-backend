import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Убедитесь, что React Router установлен
import API from './api';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await API.get(`confirm-email/${token}/`);
        setMessage(response.data.message);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка подтверждения email.');
        setMessage('');
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ConfirmEmail;
