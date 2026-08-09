export type DynamicFormType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'datetime-local';

export type FieldOption = {
  label: string;
  value: string | number;
};

type BaseField = {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

type InputField = BaseField & {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';
};

type TextareaField = BaseField & {
  type: 'textarea';
};

type SelectField = BaseField & {
  type: 'select';
  options: FieldOption[];
};

type CheckboxField = BaseField & {
  type: 'checkbox';
};

export type FieldConfig = InputField | TextareaField | SelectField | CheckboxField;
