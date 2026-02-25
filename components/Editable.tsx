import React, { useRef, useState } from 'react';
import { useDesign } from '../context/DesignContext';

interface EditableTextProps {
    id: string;
    defaultValue: string;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
    onSave?: (newValue: string) => void;
    editing?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ id, defaultValue, className = "", multiline = false, placeholder = "", onSave, editing }) => {
    const { isEditing: globalEditing, edits, updateEdit } = useDesign();
    // Use the `editing` prop if provided, otherwise fallback to global editing state.
    // NOTE: If the parent passes `editing={local || global}`, this prop will control the mode.
    const isEditMode = editing !== undefined ? editing : globalEditing;
    
    const value = edits[id] || defaultValue;
    const [lastCommittedValue, setLastCommittedValue] = useState(value);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (onSave && newValue !== lastCommittedValue) {
            onSave(newValue);
            setLastCommittedValue(newValue);
        }
    };

    if (isEditMode) {
        if (multiline) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => updateEdit(id, e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={4}
                    className={`w-full bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400 font-display text-sm min-h-[100px] resize-y ${className}`}
                />
            );
        }
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => updateEdit(id, e.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300 dark:border-yellow-700 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-yellow-400 min-w-[50px] ${className}`}
            />
        );
    }

    return (
        <span className={`${className} ${multiline ? 'whitespace-pre-wrap block' : ''}`}>
            {value || <span className="text-gray-400 italic">未填写</span>}
        </span>
    );
};

interface EditableImageProps {
    id: string;
    src?: string;
    alt: string;
    className?: string;
    children?: React.ReactNode; // Fallback if no src/image (e.g. SVG)
    onSave?: (newSrc: string) => void;
    editing?: boolean;
}

export const EditableImage: React.FC<EditableImageProps> = ({ id, src, alt, className = "", children, onSave, editing }) => {
    const { isEditing: globalEditing, edits, updateEdit } = useDesign();
    const isEditMode = editing !== undefined ? editing : globalEditing;
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const savedImage = edits[id];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                updateEdit(id, result);
                if (onSave) onSave(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const displayContent = () => {
        if (savedImage) {
            return <img src={savedImage} alt={alt} className={`w-full h-full object-cover ${className}`} />;
        }
        if (src) {
            return <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} />;
        }
        return children;
    };

    return (
        <div className={`relative group ${className}`}>
            {displayContent()}
            
            {isEditMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded border-2 border-yellow-400 border-dashed z-20">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        更换图片
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
};