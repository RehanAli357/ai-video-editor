import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LucideIcon } from 'lucide-react';
import { FieldConfig } from './type';
import { useEffect, useMemo } from 'react';

const normalizeFormValue = (fieldType: string, value: unknown) => {
  if (typeof value !== 'string' || !value) return value;

  if (fieldType === 'datetime-local') {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  if (fieldType === 'date') {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return value;
};

const normalizeFormValues = (
  values: Record<string, unknown> | undefined,
  fields: FieldConfig[]
) => {
  if (!values) return values;

  return fields.reduce(
    (acc, field) => {
      if (field.name in values) {
        acc[field.name] = normalizeFormValue(field.type, values[field.name]);
      }
      return acc;
    },
    { ...values }
  );
};

type DynamicFormProps<TSchema extends z.ZodObject<Record<string, z.ZodTypeAny>>> = {
  fields: FieldConfig[];
  onSubmit: (data: z.infer<TSchema>) => Promise<void>;
  schema: TSchema;
  btnText?: string;
  Icon?: LucideIcon;
  formValues?: Record<string, unknown>;
  buttonInline?: boolean;
};

const DynamicForm = <TSchema extends z.ZodObject<Record<string, z.ZodTypeAny>>>({
  fields,
  onSubmit,
  schema,
  btnText,
  Icon,
  formValues,
  buttonInline = true,
}: DynamicFormProps<TSchema>) => {
  const normalizedFormValues = useMemo<Record<string, unknown> | undefined>(
    () => normalizeFormValues(formValues, fields),
    [formValues, fields]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: normalizedFormValues,
  });

  useEffect(() => {
    if (normalizedFormValues) {
      reset(normalizedFormValues);
    }
  }, [normalizedFormValues, reset]);

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className="border border-void bg-surface px-4 py-3 rounded-lg min-h-[110px] focus:outline-none focus:ring-2 focus:ring-synth"
          />
        );

      case 'select':
        return (
          <select
            {...register(field.name)}
            className="border border-void bg-surface px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-synth"
            defaultValue=""
          >
            <option value="" disabled>
              {field.placeholder || 'Select option'}
            </option>

            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              {...register(field.name)}
              type="checkbox"
              disabled={field.disabled}
              className="h-4 w-4"
            />
            {field.label}
          </label>
        );

      default:
        return (
          <input
            {...register(field.name)}
            type={field.type}
            disabled={field.disabled}
            placeholder={field.placeholder}
            className="border border-void bg-surface px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-synth"
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data as z.infer<TSchema>))}
      className="flex flex-wrap gap-5 my-4 items-end"
    >
      {fields.map((field) => (
        <div
          key={field.name}
          className={`${
            field.type === 'checkbox' ? 'flex items-center' : 'flex flex-col min-w-[220px] flex-1'
          }`}
        >
          {field.type !== 'checkbox' && field.label && (
            <label className="text-sm font-medium mb-1 text-gray-700">{field.label}</label>
          )}

          {renderField(field)}

          {errors[field.name] && (
            <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message as string}</p>
          )}
        </div>
      ))}

      {buttonInline ? (
        <div className="min-w-45">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-synth hover:bg-synth-dim text-white rounded-lg font-medium transition"
          >
            {Icon && <Icon size={16} />}
            {btnText || 'Submit'}
          </button>
        </div>
      ) : (
        <div className="w-full">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-synth hover:bg-synth-dim text-white rounded-lg font-medium transition"
          >
            {Icon && <Icon size={16} />}
            {btnText || 'Submit'}
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;
