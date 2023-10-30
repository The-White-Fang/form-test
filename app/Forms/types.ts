import { TextInputProps } from "react-native";

export type BasicFormField = {
	name: string;
	label: string;
	isReuired?: boolean | string;
	visible?: string;
	isNumeric?: boolean;
};

export type TextFormField = BasicFormField & {
	type: 'text';
	placeholder?: string;
	validator?: string;
	defaultValue?: string;
	prefill?: string;
	isLong?: boolean;
	textType?: TextInputProps['textContentType'] 
};

export type CheckFormFieldItem = {
	label: string;
	value: string;
	isSelected?: boolean | string;
	visible?: string;
};

export type CheckboxesFormField = BasicFormField & {
	type: 'checkbox';
	options: CheckFormFieldItem[];
};

export type SelectFormFieldItem = {
	label: string;
	value: string;
	visible?: string;
};

export type SelectFormField = BasicFormField & {
	type: 'select';
	options: SelectFormFieldItem[];
	defaultValue?: string;
};

export type MultiSelectFormField = BasicFormField & {
	type: 'multiselect';
	options: SelectFormFieldItem[];
};

export type RadioFormField = BasicFormField & {
	type: 'radio';
	options: SelectFormFieldItem[];
	defaultValue?: string;
};

export type FormField = TextFormField | CheckboxesFormField | SelectFormField | MultiSelectFormField | RadioFormField;

export type FormConfig = {
	formID: number;
	submit?: string;
	fields: FormField[];
};
