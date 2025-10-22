import { useState } from 'react';

const usePicking = () => {
  const [stoItems, setStoItems] = useState([]);
  const [filter, setFilter] = useState('');

  const pickingInfo = {
    stoItems,
    setStoItems,
    filter,
    setFilter,
  };

  return pickingInfo;
};

export default usePicking;
