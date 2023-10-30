import { BackHandler, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckboxesFormField, FormConfig, FormField, MultiSelectFormField, RadioFormField, SelectFormField, TextFormField } from './types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';

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
				initialValue[field.name] = field.options[0].isSelected;
				continue;
			}

			if (field.type === 'checkbox' || field.type === 'multiselect') {
				initialValue[field.name] = [];
				continue;
			}

			if (field.defaultValue) {
				initialValue[field.name] = field.isNumeric ? parseFloat(field.defaultValue) : NaN;
			}

			data[field.name] = field.isNumeric ? NaN : '';
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

	const showSubmit = formView.length === step + 1;

	const handleChange = useCallback(
		(name: string, value: Value) => {
			setData((d) => ({ ...d, [name]: value }));
		},
		[config],
	);

	return (
		<View>
			{formView.map((field, i) =>
				i === step ? (
					<Field
						field={field}
						key={field.name}
						next={showSubmit ? undefined : next}
						prev={prev}
						value={data[field.name]}
						onChange={(value) => handleChange(field.name, value)}
					/>
				) : null,
			)}
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
		return <SelectField field={field} />;
	} else if (field.type === 'multiselect') {
		return <MultiSelect field={field} />;
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

function SelectField({ field }: { field: SelectFormField }) {
	return <View></View>;
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
					const isSelected = value === true || (Array.isArray(value) && value.find((f) => f == option.value));

					return (
						<TouchableOpacity
							key={option.value}
							style={styles.option}
							onPress={() => {
								onChange?.(
									field.options.length
										? !isSelected
										: isSelected
										? ((value as string[] | number[]).filter((v) => v != option.value) as string[] | number[])
										: ([...(value as string[] | number[]), option.value] as string[] | number[]),
								);
							}}
						>
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

function MultiSelect({ field }: { field: MultiSelectFormField }) {
	return <View></View>;
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
