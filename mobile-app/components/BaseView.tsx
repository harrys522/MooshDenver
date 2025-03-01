import { styles } from "@/app/globalStyles";
import React from "react"
import { RefreshControlProps, SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native';

export const BaseView = (
    { refreshControl, children }: { children: React.ReactNode, refreshControl?: React.ReactElement<RefreshControlProps> | undefined }
) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView nestedScrollEnabled={true}
                refreshControl={refreshControl}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    )
}
