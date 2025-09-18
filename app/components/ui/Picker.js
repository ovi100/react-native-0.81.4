import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { height } from '../../../utils';
import { edges } from '../../../utils/common';

/**
 * A customizable picker component with support for size, variant, icons, loading, and disabled states.
 *
 * @param {Object} props - Picker component props.
 * @param {Array} [props.options=[]] - Picker option {label: item, value: item} formate.
 * @param {() => void|null} [props.onSelect=null] - Function to call when the picker is pressed.
 * @param {object} [props.selectedValue] - Picker selected option as object.
 * @param {string} [props.placeholder='Select an option'] - Text to display inside the picker.
 * @param {'text'} [props.type=''] - Type of the picker.
 * @param {'square' | 'rounded'} [props.edge='rounded'] - Picker edge style.
 * @param {boolean} [props.enableSearch=false] - Whether the picker has a search box.
 * @param {boolean} [props.disabled=false] - Whether the picker is disabled.
 *
 * @returns {JSX.Element} A styled picker component.
 */

const modalContentHeight = height > 600 ? height * 0.58 : height * 0.48;

const renderPickerItem = ({ item, index, enableSearch, handleSelect }) => {
  const itemStyles = [styles.item];
  if (!enableSearch && index === 0) {
    itemStyles.push(styles.noTopBorder);
  }
  return (
    <TouchableOpacity
      style={itemStyles}
      onPress={() => handleSelect(item)}>
      <Text style={styles.text}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const Picker = ({
  options = [],
  onSelect = null,
  selectedValue,
  enableSearch = false,
  disabled = false,
  edge = 'rounded',
  type = '',
  placeholder = 'Select an option',
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelect = useCallback(item => {
    setVisible(false);
    onSelect(item);
  }, [onSelect]);

  const formattedData = useMemo(() => {
    return options.map(item =>
      typeof item === 'string' ? { label: item, value: item } : item,
    );
  }, [options]);

  const filteredData = useMemo(() => {
    if (!enableSearch || !search.trim()) return formattedData;

    return formattedData.filter(
      item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.value.toLowerCase().includes(search.toLowerCase()),
    );
  }, [enableSearch, search, formattedData]);

  const renderItem = ({ item, index }) =>
    renderPickerItem({ item, index, enableSearch, handleSelect });

  const Wrapper = disabled ? View : TouchableOpacity;

  // Dynamic styles based on props
  const buttonStyles = () => {
    return {
      borderWidth: type === 'text' ? 0 : 1,
      borderRadius: edges[edge],
      opacity: disabled ? 0.5 : 1,
      marginVertical: type === 'text' ? 0 : 8,
    };
  };

  return (
    <>
      <Wrapper
        style={[styles.button, buttonStyles()]}
        disabled={disabled}
        onPress={() => setVisible(true)}>
        <Text style={styles.selectedText} numberOfLines={1}>
          {selectedValue ? selectedValue.label : placeholder}
        </Text>
        <View
          style={[
            styles.icon,
            { transform: [{ rotate: visible ? '225deg' : '45deg' }] },
          ]}
        />
      </Wrapper>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            setVisible(false);
            setSearch('');
          }}
        >
          <View style={[styles.modalContent]}>
            {(filteredData.length > 0 || search) && (
              <>
                {enableSearch && (
                  <TextInput
                    style={[styles.searchInput, filteredData.length === 0 ? { borderBottomWidth: 1, borderBottomColor: '#eaeaea' } : { borderBottomWidth: 0 }]}
                    placeholder="search an option....."
                    placeholderTextColor="#ccc"
                    selectionColor="#000"
                    value={search}
                    onChangeText={setSearch}
                  />
                )}
                {filteredData.length === 0 && search && (
                  <View style={styles.emptyContent}>
                    <Text style={styles.emptyContentMessage}>
                      search for "{search}" not match any option!
                    </Text>
                  </View>
                )}
                {filteredData.length > 0 && (search || !search) && (
                  <FlatList
                    data={filteredData}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </>
            )}
            {filteredData.length === 0 && !search && (
              <View style={styles.emptyContent}>
                <Text style={styles.emptyContentMessage}>
                  No options is found!
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setVisible(false);
                setSearch('');
              }}>
              <Text style={styles.cancelText}>close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderColor: '#aaa',
  },
  selectedText: {
    fontSize: 15,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: modalContentHeight,
    padding: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  searchInput: {
    color: "#000",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 0,
    item: {
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderTopWidth: 1,
      borderTopColor: '#eaeaea',
    },
    noTopBorder: {
      borderTopWidth: 0,
    },
  },
  text: {
    color: '#333',
    fontWeight: '600',
  },
  icon: {
    width: 10,
    height: 10,
    borderColor: '#bdbdbd',
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  emptyContent: {
    padding: 15,
  },
  emptyContentMessage: {
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 10,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Picker;
