import { createContext } from 'react';
import { useAuth, useChallan, useDevice, usePicking } from '../hooks';

export const AppContext = createContext({});

const AppProvider = ({ children }) => {
  const authInfo = useAuth();
  const challanInfo = useChallan();
  // const createdInfo = useCreatedDocument();
  const deviceInfo = useDevice();
  // const manualInfo = useManual();
  const pickingInfo = usePicking();
  const contextValues = {
    authInfo,
    challanInfo,
    // createdInfo,
    deviceInfo,
    // manualInfo,
    pickingInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
