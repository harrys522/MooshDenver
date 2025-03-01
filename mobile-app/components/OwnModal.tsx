import { View, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity, Modal } from 'react-native';


export const OwnModal = (
    { onClose, visible, children }
        :
        { onClose: () => void, visible: boolean, children: React.ReactNode, }
) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={() => { onClose() }}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <View style={style.modalOverlay}>
                <View style={style.modalContent}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const style = StyleSheet.create({
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, .7)',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        minWidth: 350,
    },
});
