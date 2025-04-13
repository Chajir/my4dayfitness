import React, { useState } from 'react';

const App = () => {
  const [message, setMessage] = useState('Your Fitness App is Working!');

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center text-2xl font-bold'>
      {message}
    </div>
  );
};

export default App;
