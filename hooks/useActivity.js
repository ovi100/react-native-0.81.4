import { API_URL } from '@env';
import { useState } from 'react';

const useActivity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createActivity = async (userId, type, activity) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + 'activity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user: userId, type, activity}),
      });

      if (response.ok) {
        const responseData = await response.json();
      } else {
        setError('There is a problem with the server!');
      }
    } catch (error) {
      setError('There is a problem with the server!');
    } finally {
      setLoading(false);
    }
  };

  return {createActivity, loading, error};
};

export default useActivity;
