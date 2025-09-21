import { createContext } from 'react';
import { useAuth, useDevice } from '../hooks';

export const AppContext = createContext({});

const AppProvider = ({ children }) => {
  const authInfo = useAuth();
  // const challanInfo = useChallanInfo();
  // const createdInfo = useCreatedDocument();
  const deviceInfo = useDevice();
  // const manualInfo = useManual();
  // const metadataInfo = useMetaData();
  // const pickingInfo = useDnPicking();
  const contextValues = {
    authInfo,
    // challanInfo,
    // createdInfo,
    deviceInfo,
    // manualInfo,
    // metadataInfo,
    // pickingInfo,
  };
  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
