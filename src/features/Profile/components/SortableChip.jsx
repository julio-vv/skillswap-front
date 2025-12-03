import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Chip sortable con drag & drop
 * Wrapper de MUI Chip para integración con dnd-kit
 */
const SortableChip = ({ id, label, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                touchAction: 'none', // Previene scroll en móviles al arrastrar
            }}
        >
            {/* Indicador de arrastre */}
            <Box
                {...attributes}
                {...listeners}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    color: 'text.secondary',
                    '&:active': {
                        cursor: 'grabbing',
                    },
                }}
            >
                <DragIndicatorIcon fontSize="small" />
            </Box>

            {/* Chip de MUI */}
            <Chip
                label={label}
                onDelete={onDelete}
                sx={{ flex: 1 }}
            />
        </Box>
    );
};

export default SortableChip;
