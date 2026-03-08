'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  displayName: string;
  icon?: React.ReactNode;
}

interface DropdownSelectorProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium
          bg-bg-primary border border-accent-quaternary rounded-lg
          transition-all duration-200 hover:border-accent-secondary
          focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-20
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-accent-primary shadow-sm' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <div className="h-4 w-4 flex-shrink-0">
              {selectedOption.icon}
            </div>
          )}
          <span className={`truncate ${selectedOption ? 'text-text-primary' : 'text-gray-500'}`}>
            {selectedOption?.displayName || placeholder}
          </span>
        </div>
        
        {/* Chevron Icon */}
        <svg
          className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-primary border border-accent-quaternary rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="py-1" role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`
                  w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-left
                  transition-colors duration-150 hover:bg-accent-primary/5
                  ${
                    selectedValue === option.value
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-primary'
                  }
                `}
                role="option"
                aria-selected={selectedValue === option.value}
              >
                {option.icon && (
                  <div className="h-4 w-4 flex-shrink-0">
                    {option.icon}
                  </div>
                )}
                <span className="truncate">{option.displayName}</span>
                {selectedValue === option.value && (
                  <svg
                    className="h-4 w-4 ml-auto text-accent-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownSelector; 