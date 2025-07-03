import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Navbar: React.FC = () => {
    return (
        <SafeAreaView className="bg-primary-100">
            <View className="flex-row items-center justify-between px-4 py-2">
                <TouchableOpacity>
                    <img src="../../assets/icons/Home.png" alt="" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <img src="../../assets/icons/Create.png" alt="" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <img src="../../assets/icons/Profile.png" alt="" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Navbar;

