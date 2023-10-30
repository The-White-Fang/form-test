import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, StatusBar as RNStatusbar } from 'react-native';
import { FormConfig } from './app/Forms/types';
import Form from './app/Forms';

const form: FormConfig = {
	formID: 1,
	fields: [
		{ type: 'text', isReuired: true, label: 'Name', name: 'name', placeholder: 'Enter your name', textType: 'name' },
		{ type: 'text', isReuired: true, label: 'Emil', name: 'email', placeholder: 'Enter your email', textType: 'emailAddress' },
		{ type: 'text', isReuired: true, label: 'Phone', name: 'phone', placeholder: 'Enter your phone', textType: 'telephoneNumber' },
		{
			type: 'radio',
			isReuired: true,
			label: 'Gender',
			name: 'gender',
			options: [
				{ label: 'Male', value: 'male' },
				{ label: 'Female', value: 'female' },
				{ label: 'Other', value: 'other' },
			],
		},
		{
			type: 'checkbox',
			isReuired: true,
			label: 'I accept all T&C',
			name: 'agree-tos',
			options: [{ label: 'I accept all T&C', value: 'agree-tos' }],
		},
		{
			type: 'checkbox',
			isReuired: true,
			label: 'Interests',
			name: 'interests',
			options: [
				{ label: 'Movies', value: 'movies' },
				{ label: 'Music', value: 'music' },
				{ label: 'Sports', value: 'sports' },
				{ label: 'Games', value: 'games' },
				{ label: 'Books', value: 'books' },
				{ label: 'Animes', value: 'animes' },
				{ label: 'Other', value: 'other' },
			],
		},
	],
};

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style='auto' />
			<View style={styles.content}>
				<Form config={form} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: RNStatusbar.currentHeight,
	},
	content: {
		padding: 10,
	},
});
