import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path if needed (usually ../../convex/_generated/api)
import { FileText, Trash2, Clock, Calendar } from 'lucide-react';

interface ProjectArchiveProps {
    projectId: string;
    onEditDocument: (doc: any) => void;
}

export const ProjectArchive: React.FC<ProjectArchiveProps> = ({ projectId, onEditDocument }) => {
    // Assuming api is accessible here. If not, we might need to fix import paths.
    // Path: /Users/saxon/Dev Projects/Gamify/convex/_generated/api.ts
    // Current file: /Users/saxon/Dev Projects/Gamify/components/project/ProjectArchive.tsx
    // Relative path: ../../convex/_generated/api  CORRECT.

    // However, TypeScript might complain if we don't handle null/loading states.
    // For now, simple loading state.

    const documents = useQuery(api.documents.getProjectDocuments, { projectId });
    const deleteDocument = useMutation(api.documents.deleteDocument);

    if (documents === undefined) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <FileText size={32} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No Documents Yet</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                    Use the 'New Document' tool in the Overview tab to start writing specifications or notes.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {documents.map((doc) => (
                <div
                    key={doc._id}
                    className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all hover:bg-slate-800 relative"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                            <FileText size={20} />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this document?')) {
                                    deleteDocument({ id: doc._id });
                                }
                            }}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="Delete Document"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <h4
                        onClick={() => onEditDocument(doc)}
                        className="text-white font-bold text-lg mb-2 cursor-pointer hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                        {doc.title || 'Untitled Document'}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800/50">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            {doc.type}
                        </span>
                    </div>

                    {/* Full card click area */}
                    <div
                        className="absolute inset-0 z-0 cursor-pointer"
                        onClick={() => onEditDocument(doc)}
                    />
                    {/* Prevent delete button overlap */}
                    <div className="absolute top-4 right-4 w-8 h-8 z-10 pointer-events-none" />
                    {/* Actually delete button is z-20 implicity if later in DOM? No.
                        Let's just use stopPropagation on button.
                    */}
                </div>
            ))}
        </div>
    );
};
