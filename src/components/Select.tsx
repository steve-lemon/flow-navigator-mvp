import React from 'react';
import ReactSelect, { Props as SelectProps } from 'react-select';
import { cn } from '../utils';

export interface Option {
  value: string;
  label: string;
  [key: string]: any;
}

interface CustomSelectProps extends Omit<SelectProps<Option, false>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, options, placeholder, className, disabled, ...props }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <ReactSelect
      value={selectedOption}
      onChange={(option) => {
        if (option) onChange((option as Option).value);
      }}
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      classNames={{
        control: (state) =>
          cn(
            'glass-input !p-0 !min-h-[44px] flex cursor-pointer transition-all',
            state.isFocused ? '!ring-2 !ring-blue-500/50 !border-transparent' : '',
            disabled ? 'opacity-50 !cursor-not-allowed' : '',
            className
          ),
        valueContainer: () => '!px-4 !flex !items-center !gap-1 !flex-nowrap !overflow-hidden',
        input: () => '!m-0 !p-0 font-sans text-slate-800 dark:text-slate-200 !flex !items-center !leading-none',
        singleValue: () => '!m-0 !text-slate-800 dark:!text-slate-200 font-semibold text-sm !flex !items-center !leading-none !whitespace-nowrap !truncate !block',
        placeholder: () => '!m-0 !text-slate-400 dark:!text-slate-500 font-semibold text-sm !flex !items-center !leading-none !whitespace-nowrap !truncate !block',
        menu: () => 'glass-panel !mt-2 !rounded-2xl !p-1 !overflow-hidden z-50',
        menuList: () => 'no-scrollbar',
        option: (state) =>
          cn(
            '!cursor-pointer !rounded-xl !px-4 !py-2.5 !text-sm !font-semibold !transition-colors',
            state.isSelected
              ? '!bg-blue-500/10 !text-blue-600 dark:!text-blue-400'
              : state.isFocused
              ? '!bg-slate-100/50 dark:!bg-slate-800/50 !text-slate-800 dark:!text-slate-200'
              : '!bg-transparent !text-slate-600 dark:!text-slate-400'
          ),
        dropdownIndicator: () => '!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-300',
        indicatorSeparator: () => 'hidden',
      }}
      styles={{
        control: () => ({}),
        valueContainer: () => ({}),
        input: () => ({}),
        singleValue: () => ({}),
        placeholder: () => ({}),
        menu: () => ({}),
        menuList: () => ({}),
        option: () => ({}),
        dropdownIndicator: () => ({}),
        indicatorSeparator: () => ({}),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: 'transparent',
          neutral20: 'transparent',
          neutral30: 'transparent',
          neutral50: 'transparent',
          neutral80: 'transparent',
        },
      })}
      {...props}
    />
  );
}
