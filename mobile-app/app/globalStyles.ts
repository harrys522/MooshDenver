import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        marginTop: 40, // Offset for the status bar, though this should be handled by SafeAreaView!
        padding: 100,
    },
    header: {
        padding: 20,
        backgroundColor: '#0D1B2A',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 20,
    },
    profileItem: {
        padding: 30,
        borderRadius: 10,
        margin: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    profileText: {
        fontSize: 18,
        color: '#333',
    },
    button: {
        backgroundColor: '#0D1B2A',
        padding: 15,
        margin: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 15,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
    },

    searchInput: {
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
});
