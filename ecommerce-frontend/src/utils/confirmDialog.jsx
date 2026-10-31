import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AlertTriangle} from 'lucide-react';

// In-app replacement for window.confirm: returns a Promise<boolean>.
// Usage: if (!(await confirmDialog('Delete this item?'))) return;
function ConfirmModal({message, title, confirmText, cancelText, danger, onClose}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        const onKey = (e) => {
            if (e.key === 'Escape') onClose(false);
            if (e.key === 'Enter') onClose(true);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose(false)}/>
            <div role="dialog" aria-modal="true"
                 className={`relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transition-transform duration-150 ${visible ? 'scale-100' : 'scale-95'}`}>
                <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${danger ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                        <AlertTriangle size={22}/>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line break-words">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => onClose(false)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                        {cancelText}
                    </button>
                    <button type="button" autoFocus onClick={() => onClose(true)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function confirmDialog(message, options = {}) {
    const {
        title = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        danger = true,
    } = options;

    return new Promise((resolve) => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const root = createRoot(host);
        let done = false;
        const close = (result) => {
            if (done) return;
            done = true;
            resolve(result);
            setTimeout(() => {
                root.unmount();
                host.remove();
            }, 0);
        };
        root.render(
            <ConfirmModal message={message} title={title} confirmText={confirmText}
                          cancelText={cancelText} danger={danger} onClose={close}/>
        );
    });
}

export default confirmDialog;
