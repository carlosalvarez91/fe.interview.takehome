import type { OptionGroup } from '../types';

const CODE_LABELS: Record<string, string> = {
  seating_type: 'Seating Type',
  food_package: 'Food Package',
  date_flex_window_days: 'Date Flexibility',
  catering_license_tier: 'Catering License Tier',
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  seating_type: {
    open: 'Open seating',
    reserved: 'Reserved seating',
  },
  food_package: {
    none: 'No food',
    light: 'Light refreshments',
    full: 'Full catering',
  },
  date_flex_window_days: {
    '0': 'No flexibility',
    '7': '1-week window',
    '30': '1-month window',
  },
};

function formatCode(code: string): string {
  return code
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getGroupLabel(code: string): string {
  return CODE_LABELS[code] ?? formatCode(code);
}

function getValueLabel(code: string, value: string): string {
  return VALUE_LABELS[code]?.[value] ?? formatCode(value);
}

interface Props {
  group: OptionGroup;
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}

export default function OptionGroupField({ group, selectedValue, onChange }: Props) {
  const label = getGroupLabel(group.code);

  if (group.values.length === 1) {
    const onlyValue = group.values[0];
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {group.description && (
            <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ml-4 shrink-0">
          {getValueLabel(group.code, onlyValue)}
        </span>
      </div>
    );
  }

  const groupName = `option-${group.code}`;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-900 mb-1.5">
        {label}
        {group.required ? (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        ) : (
          <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
        )}
      </legend>
      {group.description && (
        <p className="text-xs text-gray-400 mb-2">{group.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {group.values.map((value) => {
          const valueLabel = getValueLabel(group.code, value);
          const isSelected = selectedValue === value;
          const id = `${groupName}-${value}`;

          return (
            <label
              key={value}
              htmlFor={id}
              className={[
                'cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all select-none',
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/30',
              ].join(' ')}
            >
              <input
                type="radio"
                id={id}
                name={groupName}
                value={value}
                checked={isSelected}
                onChange={() => onChange(value)}
                className="sr-only"
              />
              {valueLabel}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
