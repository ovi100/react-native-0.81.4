import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '../utils';
import { uploadFile } from '../server';
import { API_URL } from '../app-config';
import useImagePicker from './useImagePicker';

const defaultChallan = {
  challanNum: '',
  challanDate: { date: null, text: '' },
  vatAmount: '',
  image: '',
};

const useChallan = () => {
  const [challanModal, setChallanModal] = useState(false);
  const [grnModal, setGrnModal] = useState(false);
  const [challans, setChallans] = useState([]);
  const [isEditingIndex, setIsEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [enableGrnReview, setEnableGrnReview] = useState(false);
  const { takePhoto, reTakePhoto, removePhoto, image, setImage } =
    useImagePicker();

  const { reset } = useForm({
    defaultValues: defaultChallan,
  });

  const formatDateText = text => {
    let textDate = text.replace(/\D/g, '');

    if (textDate.length > 2 && textDate[2] !== '/') {
      textDate = textDate.slice(0, 2) + '/' + textDate.slice(2);
    }
    if (textDate.length > 5 && textDate[5] !== '/') {
      textDate = textDate.slice(0, 5) + '/' + textDate.slice(5);
    }

    return textDate.slice(0, 8);
  };

  const uploadImage = async (file, path) => {
    const URL = API_URL + 'api/service/upload-image';
    let url = '';
    await uploadFile({
      uploadUrl: URL,
      file: file,
      path: path,
      onProgress: setIsUploading,
      onSuccess: result => {
        if (result.success) {
          url = result.data.url;
        } else {
          toast(result.message);
        }
      },
      onError: error => {
        toast(error.message);
      },
    });
    return url;
  };

  const editChallan = (index, route = 'form') => {
    setIsEditingIndex(index);
    route === 'grn' && setChallanModal(true);
  };

  const deleteChallan = index => {
    setChallans(prev => prev.filter((_, i) => i !== index));
    if (isEditingIndex === index) {
      resetChallan();
    }
    if (challans.length === 1) {
      setGrnModal(false);
      setEnableGrnReview(false);
    }
    toast('Challan deleted successfully');
  };

  const resetChallan = () => {
    reset(defaultChallan);
    setIsEditingIndex(null);
  };

  const handleSkip = () => {
    resetChallan();
    setEnableGrnReview(true);
    setChallanModal(false);
  };

  const validateVatAmount = (value, emptyAmount) => {
    if (!/^(?!0[01])\d+(\.\d+)?$/.test(value)) {
      return 'Invalid VAT amount';
    }
    if (emptyAmount && value === 0) {
      return true;
    }

    if (!emptyAmount && value <= 0) {
      return 'VAT amount must be greater than 0';
    }

    return true;
  };

  const validateChallanDate = (value) => {
    const today = new Date().toISOString().slice(0, 10);
    const [cy] = today.split("-").map(Number);
    const [day, month, year] = value.split("/").map(Number);
    const daysInMonth = new Date(year + 2000, month, 0).getDate();

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(new Date().getDate() - 90);
    const [tm, td, ty] = ninetyDaysAgo
      .toLocaleDateString("en-uk")
      .split("/")
      .map(Number);
    const thresholdDate = `${td > 10 ? td : `0${td}`
      }/${tm > 10 ? tm : `0${tm}`}/${ty - 2000}`;

    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(value)) {
      return "Invalid date format";
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return "Invalid date format";
    }

    if (ninetyDaysAgo >= new Date(year + 2000, month - 1, day)) {
      return `Date should be between ${thresholdDate} or today`;
    }

    if (month < 1 || month > 12) {
      return "Month must be between 01 to 12";
    }

    if (day < 1 || day > daysInMonth) {
      return `Day must be between 01 to ${daysInMonth}`;
    }

    if (year > cy % 100) {
      return `Maximum year must be ${cy}`;
    }

    return true;
  };

  const challanInfo = {
    challans,
    setChallans,
    challanModal,
    setChallanModal,
    deleteChallan,
    editChallan,
    enableGrnReview,
    formatDateText,
    grnModal,
    setGrnModal,
    handleSkip,
    isEditingIndex,
    setIsEditingIndex,
    isUploading,
    setEnableGrnReview,
    uploadImage,
    resetChallan,
    validateChallanDate,
    validateVatAmount,
    takePhoto,
    reTakePhoto,
    removePhoto,
    image,
    setImage
  };

  return challanInfo;
};

export default useChallan;
