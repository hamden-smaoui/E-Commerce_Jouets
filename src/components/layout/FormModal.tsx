'use client';

import React, { useState } from 'react';

// Define TypeScript interfaces for validation and field configuration
interface Validation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  title?: string;
  validate?: (value: any, allData: any) => string;
  step?: number;
}

interface Field<T> {
  name: keyof T;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  hint?: string;
  validation?: Validation;
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

// Define generic FormModalProps
interface FormModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field<T>[];
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  onSubmit: (data: T) => void;
  submitButtonText?: string;
}

const FormModal = <T extends {}>({
  isOpen,
  onClose,
  title,
  fields,
  formData,
  setFormData,
  onSubmit,
  submitButtonText = 'Submit',
}: FormModalProps<T>) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Validation function
  const validateField = (field: Field<T>, value: any, allData: T): string => {
    const { validation } = field;
    if (!validation) return '';

    const { required, min, max, minLength, maxLength, pattern, title, validate } = validation;

    if (required && (!value || (typeof value === 'string' && value.trim() === '')))
      return 'Ce champ est requis';
    if (min && Number(value) < min) return `Doit être supérieur ou égal à ${min}`;
    if (max && Number(value) > max) return `Doit être inférieur ou égal à ${max}`;
    if (minLength && value.length < minLength) return `Minimum ${minLength} caractères`;
    if (maxLength && value.length > maxLength) return `Maximum ${maxLength} caractères`;
    if (pattern && !new RegExp(pattern).test(value)) return title || 'Valeur invalide';
    if (validate && typeof validate === 'function') return validate(value, allData);

    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    const field = fields.find((f) => f.name === name);
    if (field?.validation) {
      const error = validateField(field, newValue, { ...formData, [name]: newValue });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // ✅ Fonction corrigée pour les champs personnalisés
  const handleCustomChange = (name: keyof T, value: any) => {
    console.log(`FormModal - Custom field ${String(name)} changed to:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    const field = fields.find((f) => f.name === name);
    if (field?.validation) {
      const error = validateField(field, value, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof T, string>> = {};

    fields.forEach((field) => {
      if (field.hidden) return;
      const value = formData[field.name] || ''; // ✅ Correction ici
      const error = validateField(field, value, formData);
      if (error) newErrors[field.name] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: Field<T>) => {
    if (field.hidden) return null;

    if (field.type === 'custom') {
      return (
        <div key={String(field.name)} className={field.className || ''}>
          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
          <div className="mt-1">
            {field.render?.({
              value: formData[field.name], // ✅ Passer seulement la valeur du champ
              onChange: (value: any) => handleCustomChange(field.name, value), // ✅ Fonction simplifiée
            })}
          </div>
          {field.hint && (
            <p className="validator-hint text-xs text-gray-500 mt-1">{field.hint}</p>
          )}
          {errors[field.name] && (
            <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={String(field.name)} className={field.className || ''}>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <input
          type={field.type || 'text'}
          name={String(field.name)}
          value={(formData[field.name] as any) || ''}
          onChange={handleInputChange}
          className={`input validator mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors[field.name] ? 'border-red-500' : ''
          }`}
          placeholder={field.placeholder}
          required={field.validation?.required}
          min={field.validation?.min}
          max={field.validation?.max}
          step={field.validation?.step}
          title={field.validation?.title}
          disabled={field.disabled || false}
        />
        {field.hint && (
          <p className="validator-hint text-xs text-gray-500 mt-1">{field.hint}</p>
        )}
        {errors[field.name] && (
          <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <div className="modal-header flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          {fields.map((field) => renderField(field))}
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              {submitButtonText}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Fermer
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default FormModal;