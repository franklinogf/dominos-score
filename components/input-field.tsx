import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  error?: string;
  placeholder?: string;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  transform?: {
    input?: (value: any) => string;
    output?: (text: string) => any;
  };
  autoFocus?: boolean;
}

export function InputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  error,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  className,
  labelClassName,
  inputClassName,
  errorClassName,
  disabled = false,
  onChangeText,
  transform,
  autoFocus = false,
}: InputFieldProps<TFieldValues, TName>) {
  return (
    <View className={className}>
      {label && <Label className={labelClassName}>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            value={
              transform?.input
                ? transform.input(value)
                : value?.toString() || ''
            }
            onChangeText={(text) => {
              const transformedValue = transform?.output
                ? transform.output(text)
                : text;
              onChange(transformedValue);
              onChangeText?.(text);
            }}
            autoFocus={autoFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={!disabled}
            className={inputClassName}
          />
        )}
      />
      {error && (
        <Text
          className={`text-destructive text-sm mt-1.5 ${errorClassName || ''}`}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
