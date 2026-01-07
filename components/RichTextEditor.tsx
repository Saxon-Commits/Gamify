import React, { useRef, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { compressImage } from '../src/utils/imageUtils';

// Expose Quill to window
(window as any).Quill = Quill;

import BlotFormatter from 'quill-blot-formatter';
Quill.register('modules/blotFormatter', BlotFormatter);

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const quillRef = useRef<ReactQuill>(null);

    // Custom Image Handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const compressedBase64 = await compressImage(file);
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection();
                    if (quill && range) {
                        quill.insertEmbed(range.index, 'image', compressedBase64);
                        quill.setSelection(range.index + 1);
                    }
                } catch (error) {
                    console.error('Image upload failed', error);
                }
            }
        };
    };

    // Custom Modules for Toolbar
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'font': [] }],
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        },
        blotFormatter: {}
    }), []);

    return (
        <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                className="flex-1 flex flex-col"
                placeholder="Unload your thoughts..."
            />
        </div>
    );
};
