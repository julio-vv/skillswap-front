import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useFormContext, Controller } from 'react-hook-form';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { formatProfileDataForForm } from '../../utils/formatProfileDataForForm';
import SortableChip from './components/SortableChip';

// Asumimos que recibimos los datos de la API para el selector
const ProfileCardHabilidades = ({ profileData, isEditing, allSkills, skillTypes }) => {
    // Obtener las funciones de RHF del FormProvider del componente padre
    const { control, register, formState: { errors }, setValue } = useFormContext();

    // Al entrar en modo edición, precargar ambos campos del formulario con los IDs actuales.
    useEffect(() => {
        if (isEditing && profileData) {
            const formatted = formatProfileDataForForm(profileData);
            const knows = formatted.habilidades_que_se_saben ?? [];
            const learns = formatted.habilidades_por_aprender ?? [];
            setValue('habilidades_que_se_saben', Array.isArray(knows) ? knows : []);
            setValue('habilidades_por_aprender', Array.isArray(learns) ? learns : []);
        }
    }, [isEditing, profileData, setValue]);


    return (
        <Card sx={{ width: '100%' }}> {/* Para asegurar que ocupa el 50% del Grid item md={6} */}
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Habilidades y Experiencia</Typography>

                {/* MODO LECTURA: Mostrar dos listas: saben y por aprender */}
                {!isEditing && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Habilidades que puedes enseñar</Typography>
                            {(() => {
                                const list = profileData?.habilidades_que_se_saben ?? [];
                                return list && list.length > 0 ? (
                                    <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                                        {list.map((h, idx) => {
                                            let skillObj = null;
                                            if (h && typeof h === 'object') {
                                                skillObj = h;
                                            } else {
                                                skillObj = allSkills?.find(s => s.id === h) || null;
                                            }
                                            const label = skillObj ? (skillObj.nombre_habilidad || skillObj.nombre || String(h)) : String(h);
                                            const key = skillObj?.id ?? `habilidad-saben-${String(h)}-${idx}`;
                                            return (
                                                <Typography component="li" key={key} variant="body1">{label}</Typography>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="body1">Aún no has agregado tus habilidades para enseñar.</Typography>
                                );
                            })()}
                        </Box>

                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Habilidades que quieres aprender</Typography>
                            {(() => {
                                const list = profileData?.habilidades_por_aprender ?? [];
                                return list && list.length > 0 ? (
                                    <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                                        {list.map((h, idx) => {
                                            let skillObj = null;
                                            if (h && typeof h === 'object') {
                                                skillObj = h;
                                            } else {
                                                skillObj = allSkills?.find(s => s.id === h) || null;
                                            }
                                            const label = skillObj ? (skillObj.nombre_habilidad || skillObj.nombre || String(h)) : String(h);
                                            const key = skillObj?.id ?? `habilidad-aprender-${String(h)}-${idx}`;
                                            return (
                                                <Typography component="li" key={key} variant="body1">{label}</Typography>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="body1">Aún no has agregado habilidades por aprender.</Typography>
                                );
                            })()}
                        </Box>
                    </Stack>
                )}

                {/* MODO EDICIÓN */}
                {isEditing && (
                    <Stack spacing={4} sx={{ mt: 1 }}>
                        {/* Selector: Habilidades que se saben (puede enseñar) */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que puedes enseñar</Typography>
                            <Controller
                                name="habilidades_que_se_saben"
                                control={control}
                                render={({ field }) => {
                                    const currentIdsRaw = Array.isArray(field.value) ? field.value : [];
                                    const uniqueIdStrings = Array.from(new Set(currentIdsRaw.map(id => String(id))));
                                    const selectedOptions = uniqueIdStrings.map(idStr => {
                                        const fromAll = allSkills?.find(s => String(s.id) === idStr || s.id == idStr);
                                        return fromAll || { id: idStr, nombre_habilidad: `Habilidad ${idStr}` };
                                    });
                                    return (
                                        <>
                                            <Autocomplete
                                                multiple
                                                options={(allSkills ? [...allSkills].sort((a, b) => {
                                                    const groupA = a.nombre_tipo || 'Otras';
                                                    const groupB = b.nombre_tipo || 'Otras';
                                                    const groupCompare = groupA.localeCompare(groupB);
                                                    if (groupCompare === 0) {
                                                        const nameA = a.nombre_habilidad || a.nombre || '';
                                                        const nameB = b.nombre_habilidad || b.nombre || '';
                                                        return nameA.localeCompare(nameB);
                                                    }
                                                    return groupCompare;
                                                }) : [])}
                                                getOptionLabel={(option) => option.nombre_habilidad || option.nombre || ''}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={selectedOptions}
                                                onChange={(event, newValue) => {
                                                    const ids = (newValue || []).map(v => (v && typeof v === 'object') ? (v.id ?? v.value ?? v.key) : v);
                                                    field.onChange(ids);
                                                }}
                                                groupBy={(option) => option.nombre_tipo || 'Otras'}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Selecciona habilidades que puedes enseñar"
                                                        error={!!errors.habilidades_que_se_saben}
                                                        helperText={errors.habilidades_que_se_saben?.message}
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
                                                        items={selectedOptions.map(opt => String(opt.id ?? opt.value ?? opt.key))}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                                            {selectedOptions.map((opt, idx) => {
                                                                const idVal = opt && typeof opt === 'object' ? (opt.id ?? opt.value ?? opt.key) : opt;
                                                                const label = opt && typeof opt === 'object'
                                                                    ? (opt.nombre_habilidad || opt.nombre || opt.name || String(idVal))
                                                                    : String(idVal);
                                                                return (
                                                                    <SortableChip
                                                                        key={idVal != null ? `skill-saben-${idVal}` : `skill-saben-${idx}`}
                                                                        id={String(idVal)}
                                                                        label={label}
                                                                        onDelete={() => {
                                                                            const current = Array.isArray(field.value) ? field.value : [];
                                                                            const updatedIds = current.filter(id => String(id) !== String(idVal));
                                                                            field.onChange(updatedIds);
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </Stack>
                                                    </SortableContext>
                                                </DndContext>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No hay habilidades seleccionadas.</Typography>
                                            )}
                                        </>
                                    );
                                }}
                            />
                        </Box>

                        {/* Selector: Habilidades por aprender */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que quieres aprender</Typography>
                            <Controller
                                name="habilidades_por_aprender"
                                control={control}
                                render={({ field }) => {
                                    const currentIdsRaw = Array.isArray(field.value) ? field.value : [];
                                    const uniqueIdStrings = Array.from(new Set(currentIdsRaw.map(id => String(id))));
                                    const selectedOptions = uniqueIdStrings.map(idStr => {
                                        const fromAll = allSkills?.find(s => String(s.id) === idStr || s.id == idStr);
                                        return fromAll || { id: idStr, nombre_habilidad: `Habilidad ${idStr}` };
                                    });
                                    return (
                                        <>
                                            <Autocomplete
                                                multiple
                                                options={(allSkills ? [...allSkills].sort((a, b) => {
                                                    const groupA = a.nombre_tipo || 'Otras';
                                                    const groupB = b.nombre_tipo || 'Otras';
                                                    const groupCompare = groupA.localeCompare(groupB);
                                                    if (groupCompare === 0) {
                                                        const nameA = a.nombre_habilidad || a.nombre || '';
                                                        const nameB = b.nombre_habilidad || b.nombre || '';
                                                        return nameA.localeCompare(nameB);
                                                    }
                                                    return groupCompare;
                                                }) : [])}
                                                getOptionLabel={(option) => option.nombre_habilidad || option.nombre || ''}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={selectedOptions}
                                                onChange={(event, newValue) => {
                                                    const ids = (newValue || []).map(v => (v && typeof v === 'object') ? (v.id ?? v.value ?? v.key) : v);
                                                    field.onChange(ids);
                                                }}
                                                groupBy={(option) => option.nombre_tipo || 'Otras'}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Selecciona habilidades por aprender"
                                                        error={!!errors.habilidades_por_aprender}
                                                        helperText={errors.habilidades_por_aprender?.message}
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
                                                        items={selectedOptions.map(opt => String(opt.id ?? opt.value ?? opt.key))}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                                            {selectedOptions.map((opt, idx) => {
                                                                const idVal = opt && typeof opt === 'object' ? (opt.id ?? opt.value ?? opt.key) : opt;
                                                                const label = opt && typeof opt === 'object'
                                                                    ? (opt.nombre_habilidad || opt.nombre || opt.name || String(idVal))
                                                                    : String(idVal);
                                                                return (
                                                                    <SortableChip
                                                                        key={idVal != null ? `skill-aprender-${idVal}` : `skill-aprender-${idx}`}
                                                                        id={String(idVal)}
                                                                        label={label}
                                                                        onDelete={() => {
                                                                            const current = Array.isArray(field.value) ? field.value : [];
                                                                            const updatedIds = current.filter(id => String(id) !== String(idVal));
                                                                            field.onChange(updatedIds);
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </Stack>
                                                    </SortableContext>
                                                </DndContext>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No hay habilidades seleccionadas.</Typography>
                                            )}
                                        </>
                                    );
                                }}
                            />
                        </Box>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCardHabilidades;