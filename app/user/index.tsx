import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>user</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
});

export default UserScreen;