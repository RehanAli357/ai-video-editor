import { FieldConfig } from '@/components/common/form-inputs/type';

export const authFormFields: FieldConfig[] = [
  {
    name: 'username',
    type: 'text',
    placeholder: 'rehan_ali',
    label: 'Username',
  },
  {
    name: 'email',
    type: 'email',
    placeholder: 'rehan@example.com',
    label: 'Email',
  },
  {
    name: 'password',
    type: 'password',
    placeholder: 'Create a secure password',
    label: 'Password',
  },
];

export const loginFormFields: FieldConfig[] = [
  {
    name: 'username',
    type: 'text',
    placeholder: 'rehan_ali',
    label: 'Username',
  },
  {
    name: 'password',
    type: 'password',
    placeholder: 'Enter your password',
    label: 'Password',
  },
];
