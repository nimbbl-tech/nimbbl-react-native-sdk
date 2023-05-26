import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const Radio = (props) => {
  const { selected, onChange, label } = props;

  return (
    <TouchableOpacity
      onPress={onChange}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}>
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#000',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {selected && (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: '#000',
            }}
          />
        )}
      </View>
      <Text style={{ marginLeft: 8, fontSize: 16, lineHeight: 24 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Radio;
