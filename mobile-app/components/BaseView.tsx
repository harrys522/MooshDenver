import { styles } from "@/app/globalStyles";
import React from "react"
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native';

export const BaseView = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView nestedScrollEnabled={true}>
                {children}
            </ScrollView>
        </SafeAreaView>
    )
}
