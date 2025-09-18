import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '..';

type StorageValue = string | number | boolean | object | any[];

/**
 * Check if value exists by key
 */
export const isStorageExist = async (key: string): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.some(item => item === key);
  } catch (error: any) {
    toast(error.message);
    return false;
  }
};

/**
 * Parse a stored string into its original type
 */
const parse = (value: string | null): StorageValue | null => {
  if (value === null) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'undefined' ? value : parsed;
  } catch {
    return value;
  }
};

/**
 * Set a value by key
 */
export const setStorage = async (key: string, value: StorageValue): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error: any) {
    toast(`[${key}]: ${error.message}`);
  }
};

/**
 * Get a value by key
 */
export const getStorage = async (key: string): Promise<StorageValue | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? parse(value) : null;
  } catch (error: any) {
    toast(`[${key}]: ${error.message}`);
    return null;
  }
};

/**
 * Get all stored key-value pairs
 */
export const getAllStorage = async (): Promise<Record<string, any>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    const result: Record<string, any> = {};
    stores.forEach(([key, value]) => {
      result[key] = parse(value);
    });
    return result;
  } catch (error: any) {
    toast(error.message);
    return {};
  }
};

/**
 * Remove an item by key
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error: any) {
    toast(`[${key}]: ${error.message}`);
  }
};

/**
 * Remove multiple keys
 */
export const multiRemove = async (keys: string[] = []): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error: any) {
    toast(error.message);
  }
};

/**
 * Remove all stored key-value pairs
 */
export const removeAll = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
  } catch (error: any) {
    toast(error.message);
  }
};
