import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import '../styles/main.scss';

interface SortableItemProps {
    id: number;
    content: string;
    onUpdate: (id: number, content: string) => void;
    onDelete: (id: number) => void;
}

export default function SortableItem({ id, content, onUpdate, onDelete }: SortableItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(content);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSave = () => {
        if (editValue.trim()) {
            onUpdate(id, editValue);
            setIsEditing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`sortable-item ${isDragging ? 'is-dragging' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="sortable-item-drag"
            >
                <GripVertical size={20} />
            </div>

            {isEditing ? (
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyPress={handleKeyPress}
                    className="form-input"
                    autoFocus
                />
            ) : (
                <span
                    onClick={() => setIsEditing(true)}
                    className="sortable-item-content"
                >
          {content}
                    <Edit2 size={14} className="edit-icon" />
        </span>
            )}

            <button
                onClick={() => onDelete(id)}
                className="sortable-item-delete"
                title="Удалить"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}