import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller } from 'react-hook-form';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableChip from './SortableChip';

/**
 * Selector reutilizable para habilidades con drag & drop
 */
const SkillSelector = ({ 
    control, 
    fieldName, 
    label, 
    allSkills, 
    errors 
}) => {
    // Memoizar opciones ordenadas por tipo y nombre
    const sortedSkills = useMemo(() => {
        if (!allSkills) return [];
        
        return [...allSkills].sort((a, b) => {
            const groupA = a.nombre_tipo || 'Otras';
            const groupB = b.nombre_tipo || 'Otras';
            const groupCompare = groupA.localeCompare(groupB);
            
            if (groupCompare === 0) {
                const nameA = a.nombre_habilidad || a.nombre || '';
                const nameB = b.nombre_habilidad || b.nombre || '';
                return nameA.localeCompare(nameB);
            }
            
            return groupCompare;
        });
    }, [allSkills]);

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => {
                const currentIdsRaw = Array.isArray(field.value) ? field.value : [];
                const uniqueIdStrings = Array.from(new Set(currentIdsRaw.map(id => String(id))));
                
                const selectedOptions = uniqueIdStrings.map(idStr => {
                    const fromAll = allSkills?.find(s => String(s.id) === idStr);
                    if (!fromAll) {
                        console.warn(`Habilidad con ID ${idStr} no encontrada en el listado`);
                        return { id: idStr, nombre_habilidad: `[ID: ${idStr}]` };
                    }
                    return fromAll;
                });

                return (
                    <>
                        <Autocomplete
                            multiple
                            options={sortedSkills}
                            getOptionLabel={(option) => option.nombre_habilidad || option.nombre || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={selectedOptions}
                            onChange={(event, newValue) => {
                                const ids = (newValue || []).map(v => v.id);
                                field.onChange(ids);
                            }}
                            groupBy={(option) => option.nombre_tipo || 'Otras'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={label}
                                    error={!!errors[fieldName]}
                                    helperText={errors[fieldName]?.message}
                                />
                            )}
                            renderTags={() => null}
                        />
                        
                        {selectedOptions && selectedOptions.length > 0 ? (
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={({ active, over }) => {
                                    if (!over || active.id === over.id) return;
                                    const current = Array.isArray(field.value) ? field.value : [];
                                    const oldIndex = current.findIndex(id => String(id) === String(active.id));
                                    const newIndex = current.findIndex(id => String(id) === String(over.id));
                                    
                                    if (oldIndex !== -1 && newIndex !== -1) {
                                        const reordered = arrayMove(current, oldIndex, newIndex);
                                        field.onChange(reordered);
                                    }
                                }}
                            >
                                <SortableContext
                                    items={selectedOptions.map(opt => String(opt.id))}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                        {selectedOptions.map((opt) => (
                                            <SortableChip
                                                key={`skill-${opt.id}`}
                                                id={String(opt.id)}
                                                label={opt.nombre_habilidad || opt.nombre}
                                                onDelete={() => {
                                                    const current = Array.isArray(field.value) ? field.value : [];
                                                    const updatedIds = current.filter(id => String(id) !== String(opt.id));
                                                    field.onChange(updatedIds);
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No hay habilidades seleccionadas.
                            </Typography>
                        )}
                    </>
                );
            }}
        />
    );
};

export default SkillSelector;
