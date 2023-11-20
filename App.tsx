import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, StatusBar as RNStatusbar } from 'react-native';
import { FormConfig } from './app/Forms/types';
import Form from './app/Forms';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const form: FormConfig = {
	formID: 1,
	fields: [
		{
			type: 'multiselect',
			isReuired: true,
			label: 'Skills',
			name: 'skills',
			placeholder: 'Enter your skills',
			options: [
				{ label: 'ReactJS', value: 'reactjs' },
				{ label: 'MonogoDB', value: 'mongo' },
				{ label: 'NodeJS', value: 'node' },
				{ label: 'ExpressJS', value: 'express' },
				{ label: 'Python', value: 'python' },
				{ label: 'Java', value: 'java' },
				{ label: 'C#', value: 'c#' },
				{ label: 'C++', value: 'cpp' },
				{ label: 'PHP', value: 'php' },
				{ label: 'Ruby', value: 'ruby' },
				{ label: 'Swift', value: 'swift' },
				{ label: 'Kotlin', value: 'kotlin' },
				{ label: 'Go', value: 'go' },
				{ label: 'Scala', value: 'scala' },
				{ label: 'Perl', value: 'perl' },
				{ label: 'Lua', value: 'lua' },
				{ label: 'MySQL', value: 'mysql' },
				{ label: 'PostgreSQL', value: 'postgresql' },
				{ label: 'SQL', value: 'sql' },
				{ label: 'NoSQL', value: 'nosql' },
				{ label: 'Redis', value: 'redis' },
				{ label: 'Typescript', value: 'typescript' },
				{ label: 'Javascript', value: 'javascript' },
				{ label: 'REST', value: 'rest' },
				{ label: 'GraphQL', value: 'graphql' },
				{ label: 'Docker', value: 'docker' },
				{ label: 'Kubernetes', value: 'kubernetes' },
				{ label: 'AWS', value: 'aws' },
				{ label: 'Azure', value: 'azure' },
				{ label: 'GCP', value: 'gcp' },
				{ label: 'Firebase', value: 'firebase' },
			],
		},
		{ type: 'text', isReuired: true, label: 'Name', name: 'name', placeholder: 'Enter your name', textType: 'name' },
		{ type: 'text', isReuired: true, label: 'Email', name: 'email', placeholder: 'Enter your email', textType: 'emailAddress' },
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
			<GestureHandlerRootView style={{ flex: 1 }}>
				<StatusBar style='auto' />
				<View style={styles.content}>
					<Form config={form} />
				</View>
			</GestureHandlerRootView>
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
		flex: 1,
	},
});
