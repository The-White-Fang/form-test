import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CheckboxesFormField, FormConfig, FormField, MultiSelectFormField, RadioFormField, SelectFormField, TextFormField } from './types';

type FormProps = {
	config: FormConfig;
};

type BasicFieldProps = {
	next?: () => any;
	prev?: () => any;
};

type FieldProps = {
	field: FormField;
	value?: Value;
	onChange?: (value: Value) => any;
} & BasicFieldProps;

type Value = string | string[] | boolean | number | number[];

export default function Form({ config }: FormProps) {
	const [step, setStep] = useState(0);
	const [data, setData] = useState<{ [key: string]: Value }>({});

	useEffect(() => {
		const initialValue: { [key: string]: Value } = {};
		for (const field of config.fields) {
			if (field.type === 'checkbox' && field.options.length === 1) {
				initialValue[field.name] = !!field.options[0].isSelected;
				continue;
			}

			if (field.type === 'checkbox' || field.type === 'multiselect') {
				initialValue[field.name] = [];
				continue;
			}

			if (field.defaultValue) {
				initialValue[field.name] = field.isNumeric ? parseFloat(field.defaultValue) : NaN;
			}

			initialValue[field.name] = field.isNumeric ? NaN : '';
		}

		setData(initialValue);
	}, [config]);

	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			if (step === 0) return false;
			setStep((s) => s - 1);
			return true;
		});

		return sub.remove;
	}, [step]);

	const formView = useMemo(() => {
		const fields: FormField[] = [];

		for (const field of config.fields) {
			if (field.visible === undefined) {
				fields.push(field);
				continue;
			}

			let condition = field.visible;

			const loopCount = fields.length;

			for (let i = 0; i < loopCount; i++) {
				const f = fields[i],
					value = JSON.stringify(data[f.name]);

				condition = condition.replace(new RegExp(`\\$${f.name}`, 'ig'), value);
			}

			const shouldShow = (() => {
				try {
					return eval(condition);
				} catch (error) {
					console.log(error);
					return true;
				}
			})();

			if (shouldShow) fields.push(field);
		}

		return fields;
	}, [config, data]);

	const next = useCallback(() => setStep((s) => s + 1), []);
	const prev = useCallback(() => setStep((s) => s - 1), []);

	const handleChange = useCallback(
		(name: string, value: Value) => {
			setData((d) => ({ ...d, [name]: value }));
		},
		[config],
	);

	const submit = () => {};

	const hasNext = !!formView[step + 1],
		hasPrevious = !!formView[step - 1],
		showSubmit = formView.length === step + 1;

	return (
		<View style={{ flex: 1, padding: 10 }}>
			{formView.map((field, i) =>
				i === step ? <Field field={field} key={field.name} prev={prev} value={data[field.name]} onChange={(value) => handleChange(field.name, value)} /> : null,
			)}
			<View style={{ paddingTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
				<TouchableOpacity style={{ flexDirection: 'row' }} disabled={!hasPrevious} onPress={prev}>
					<Feather name='arrow-left' size={20} color={hasPrevious ? '#1d4ed8' : '#9ca3af'} />
					<Text style={{ color: hasPrevious ? '#1d4ed8' : '#9ca3af' }}>Back</Text>
				</TouchableOpacity>
				{!showSubmit && (
					<TouchableOpacity style={{ flexDirection: 'row' }} disabled={!hasNext} onPress={next}>
						<Text style={{ color: hasNext ? '#1d4ed8' : '#9ca3af' }}>Next</Text>
						<Feather name='arrow-right' size={20} color={hasNext ? '#1d4ed8' : '#9ca3af'} />
					</TouchableOpacity>
				)}
				{showSubmit && (
					<TouchableOpacity style={{ flexDirection: 'row' }} disabled={!hasNext} onPress={submit}>
						<Text style={{ color: '#1d4ed8' }}>Submit</Text>
						<Feather name='arrow-right' size={20} color={hasNext ? '#1d4ed8' : '#1d4ed8'} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}

function Field({ field, value, onChange, next }: FieldProps) {
	if (field.type === 'checkbox') {
		return <CheckField field={field} value={value as boolean | string[] | number[]} onChange={onChange} next={next} />;
	} else if (field.type === 'radio') {
		return <RadioField field={field} value={value as string | number} onChange={onChange} next={next} />;
	} else if (field.type === 'text') {
		return <TextField field={field} value={value as string | number} onChange={onChange} next={next} />;
	} else if (field.type === 'select') {
		return <SelectField field={field} value={value as string | number} onChange={onChange} next={next} />;
	} else if (field.type === 'multiselect') {
		return <MultiSelect field={field} value={value as string[] | number[]} onChange={onChange} next={next} />;
	}
}

function TextField({ field, value, onChange, next }: { field: TextFormField; value?: string | number; onChange?: (value: string) => any } & BasicFieldProps) {
	const [focused, setFocused] = useState(false);
	const animation = useSharedValue(0);

	const handleFocus = () => {
		setFocused(true);
		animation.value = withTiming(1, { duration: 200 });
	};

	const handleBlur = () => {
		setFocused(false);
		if (value) return;
		animation.value = withTiming(0, { duration: 200 });
	};

	const labelStyle = useAnimatedStyle(() => {
		return {
			color: interpolateColor(animation.value, [0, 1], ['#9ca3af', '#1d4ed8']),
			top: interpolate(animation.value, [0, 1], [12, -8]),
			fontSize: interpolate(animation.value, [0, 1], [14, 11]),
		};
	});

	if (field.isLong) {
		return (
			<View style={styles.textFieldContainerLong}>
				<TextInput
					style={styles.textFieldLongInput}
					placeholder={focused || value ? field.placeholder : ''}
					value={value?.toString() || ''}
					onChangeText={onChange}
					defaultValue={field.defaultValue}
					onFocus={handleFocus}
					onBlur={handleBlur}
					keyboardType={field.isNumeric ? 'numeric' : undefined}
					onSubmitEditing={next}
					multiline
					scrollEnabled
					numberOfLines={3}
					textContentType={field.textType}
				/>
			</View>
		);
	}

	return (
		<View style={styles.textFieldContainer}>
			<Animated.Text style={[styles.textFieldFloatingLabel, labelStyle]}>{field.label}</Animated.Text>
			<TextInput
				style={styles.textFieldInput}
				placeholder={focused || value ? field.placeholder : ''}
				value={value?.toString() || ''}
				onChangeText={onChange}
				defaultValue={field.defaultValue}
				onFocus={handleFocus}
				onBlur={handleBlur}
				keyboardType={field.isNumeric ? 'numeric' : undefined}
				onSubmitEditing={next}
				textContentType={field.textType}
			/>
		</View>
	);
}

function SelectField({ field, value, onChange, next }: { field: SelectFormField; value: string | number; onChange: (value: string | number) => any } & BasicFieldProps) {
	const [showModal, setShowModal] = useState(false);

	const toggle = () => setShowModal((s) => !s);

	const selected = useMemo(() => field.options.find((o) => o.value === value)?.label, [value]);

	return (
		<View>
			<Text>{field.label}</Text>
			<TouchableNativeFeedback onPress={toggle}>
				<View style={{ padding: 10, borderWidth: 1, borderColor: '#1d4ed8', borderRadius: 7, marginTop: 10 }}>
					<Text style={{ color: '#9ca3af' }}>{selected}</Text>
				</View>
			</TouchableNativeFeedback>
			<Modal visible={showModal} animationType='fade' transparent onRequestClose={toggle}>
				<KeyboardAvoidingView behavior='height' style={{ flex: 1, justifyContent: 'flex-end' }}>
					<TouchableWithoutFeedback onPress={toggle}>
						<View style={[{ backgroundColor: '#0002' }, StyleSheet.absoluteFill]} />
					</TouchableWithoutFeedback>
					<View
						style={{
							height: '50%',
							backgroundColor: '#fff',
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							elevation: 10,
							paddingTop: 30,
							paddingHorizontal: 20,
							paddingBottom: 20,
						}}
					>
						<FlatList
							data={field.options}
							keyExtractor={(o) => o.value}
							style={{ marginVertical: 10 }}
							renderItem={({ item }) => {
								const isSelected = value === item.value;
								return (
									<TouchableOpacity style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }} onPress={() => onChange?.(item.value)}>
										<Text>{item.label}</Text>
									</TouchableOpacity>
								);
							}}
						/>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

function CheckField({
	field,
	value,
	onChange,
	next,
}: { field: CheckboxesFormField; value?: boolean | string[] | number[]; onChange: (value: boolean | string[] | number[]) => any } & BasicFieldProps) {
	return (
		<View>
			<Text>{field.label}</Text>
			<View style={styles.optionContainer}>
				{field.options.map((option) => {
					const isSelected = value === true || (Array.isArray(value) && value.find((f) => f == option.value)),
						handleChange = () =>
							onChange?.(
								field.options.length
									? !isSelected
									: isSelected
									? ((value as string[] | number[]).filter((v) => v != option.value) as string[] | number[])
									: ([...(value as string[] | number[]), option.value] as string[] | number[]),
							);

					return (
						<TouchableOpacity key={option.value} style={styles.option} onPress={handleChange}>
							<Fontisto name={isSelected ? 'radio-btn-active' : 'radio-btn-passive'} size={18} color={isSelected ? '#1d4ed8' : '#9ca3af'} />
							<Text style={styles.optionText}>{option.label}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

function RadioField({ field, value, onChange, next }: { field: RadioFormField; value?: string | number; onChange?: (value: string | number) => any } & BasicFieldProps) {
	return (
		<View>
			<Text>{field.label}</Text>
			<View style={styles.optionContainer}>
				{field.options.map((option) => (
					<TouchableOpacity
						key={option.value}
						style={styles.option}
						onPress={() => {
							onChange?.(option.value);
							next?.();
						}}
					>
						<Fontisto name={value == option.value ? 'radio-btn-active' : 'radio-btn-passive'} size={18} color={value == option.value ? '#1d4ed8' : '#9ca3af'} />
						<Text style={styles.optionText}>{option.label}</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}

function MultiSelect({
	field,
	value,
	onChange,
	next,
}: { field: MultiSelectFormField; value: string[] | number[]; onChange: (value: string[] | number[]) => any } & BasicFieldProps) {
	const [search, setSearch] = useState('');
	const [showModal, setShowModal] = useState(false);

	const selected = useMemo(() => {
		const selected = [] as string[];

		for (let i = 0; i < field.options.length; i++) {
			const opt = field.options[i];

			if (value && value.find((v) => v == opt.value)) {
				selected.push(opt.label);
			}
		}

		return selected.length ? selected.join(', ') : field.placeholder || '';
	}, [field.options, value]);

	const options = useMemo(() => {
		return field.options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
	}, [field.options, search]);

	const toggle = () => setShowModal((s) => !s);

	const select = (option: MultiSelectFormField['options'][0]) => {
		setSearch('');
		if (value.find((v) => v === option.value)) {
			onChange?.(value.filter((v) => v !== option.value) as string[] | number[]);
			return;
		}
		onChange?.([...value, option.value] as string[] | number[]);
	};

	return (
		<View>
			<Text>{field.label}</Text>
			<TouchableNativeFeedback onPress={toggle}>
				<View style={{ padding: 10, borderWidth: 1, borderColor: '#1d4ed8', borderRadius: 7, marginTop: 10 }}>
					<Text style={{ color: '#9ca3af' }}>{selected}</Text>
				</View>
			</TouchableNativeFeedback>
			<Modal visible={showModal} animationType='fade' transparent onRequestClose={toggle}>
				<KeyboardAvoidingView behavior='height' style={{ flex: 1, justifyContent: 'flex-end' }}>
					<TouchableWithoutFeedback onPress={toggle}>
						<View style={[{ backgroundColor: '#0002' }, StyleSheet.absoluteFill]} />
					</TouchableWithoutFeedback>
					<View
						style={{
							height: '50%',
							backgroundColor: '#fff',
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							elevation: 10,
							paddingTop: 30,
							paddingHorizontal: 20,
							paddingBottom: 20,
						}}
					>
						<View style={{ borderColor: '#9ca3af', borderWidth: 1, padding: 5, borderRadius: 8 }}>
							<TextInput value={search} onChangeText={setSearch} placeholder='search' />
						</View>
						<FlatList
							data={options}
							keyExtractor={(o) => o.value}
							style={{ marginVertical: 10 }}
							renderItem={({ item }) => {
								const isSelected = value.find((v) => v == item.value);
								return (
									<TouchableOpacity style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }} onPress={() => select(item)}>
										<Feather name={isSelected ? 'check-square' : 'square'} size={20} color={isSelected ? '#16a34a' : '#9ca3af'} style={{ marginRight: 5 }} />
										<Text>{item.label}</Text>
									</TouchableOpacity>
								);
							}}
						/>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	textFieldContainer: {
		borderColor: '#1d4ed8',
		borderWidth: 1,
		borderRadius: 7,
		height: 45,
		paddingHorizontal: 5,
		justifyContent: 'center',
	},
	textFieldFloatingLabel: {
		position: 'absolute',
		left: 8,
		backgroundColor: 'white',
		paddingHorizontal: 3,
	},
	textFieldInput: {
		height: '100%',
		width: '100%',
	},
	textFieldContainerLong: {
		borderColor: '#1d4ed8',
		borderWidth: 1,
		borderRadius: 7,
		padding: 5,
		justifyContent: 'center',
		height: 72,
	},
	textFieldLongInput: {
		justifyContent: 'flex-start',
		textAlignVertical: 'top',
	},
	optionContainer: {
		padding: 5,
	},
	option: {
		flexDirection: 'row',
		marginVertical: 3,
	},
	optionText: {
		paddingLeft: 5,
	},
});
