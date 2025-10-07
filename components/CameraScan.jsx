import { Platform, TouchableOpacity } from 'react-native';
// import { startCameraScan } from '../utils/native';
import { ScanLine } from 'lucide-react-native';

const CameraScan = () => {
  const brand = Platform.constants?.Brand || 'Unknown';

  return (
    <>
      {brand.toLowerCase() !== 'sunmi' ? (
        <TouchableOpacity
          className="w-14 h-14 justify-center items-center absolute bottom-[70px] right-0 bg-blue-600 rounded-full p-2"
        // onPress={() => startCameraScan()}
        >
          <ScanLine size={6} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </>
  )
}

export default CameraScan;