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
import { formatProfileDataForForm } from '../../utils/formatProfileDataForForm';

// Asumimos que recibimos los datos de la API para el selector
const ProfileCardHabilidades = ({ profileData, isEditing, allSkills, skillTypes }) => {
    // Obtener las funciones de RHF del FormProvider del componente padre
    const { control, register, formState: { errors }, setValue } = useFormContext();

    // Al entrar en modo edición, asegurarnos de que el campo 'habilidades' del formulario
    // contiene los IDs actuales del usuario para que el Autocomplete pueda preseleccionarlas.
    useEffect(() => {
        if (isEditing && profileData?.habilidades) {
            const formatted = formatProfileDataForForm(profileData);
            setValue('habilidades', formatted.habilidades);
        }
    }, [isEditing, profileData, setValue]);

    // En modo lectura mostraremos las habilidades como lista vertical.
    // Asumimos que profileData.habilidades devuelve un array de objetos con 'id' y 'nombre_habilidad'

    return (
        <Card sx={{ width: '100%' }}> {/* Para asegurar que ocupa el 50% del Grid item md={6} */}
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Habilidades y Experiencia</Typography>

                {/* MODO LECTURA: Usar Stack para organizar los datos */}
                {!isEditing && (
                    <Stack spacing={2}> {/* Espaciado vertical entre secciones */}
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Habilidades:</Typography>
                                {profileData?.habilidades && profileData.habilidades.length > 0 ? (
                                    <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                                        {profileData.habilidades.map((h, idx) => {
                                            // `h` puede ser un objeto {id, nombre_habilidad} o un ID (number/string)
                                            let skillObj = null;
                                            if (h && typeof h === 'object') {
                                                skillObj = h;
                                            } else {
                                                // Buscar en allSkills por id si disponemos de la lista completa
                                                skillObj = allSkills?.find(s => s.id === h) || null;
                                            }

                                            const label = skillObj ? (skillObj.nombre_habilidad || skillObj.nombre || String(h)) : String(h);
                                            const key = skillObj?.id ?? `habilidad-${String(h)}-${idx}`;

                                            return (
                                                <Typography component="li" key={key} variant="body1">{label}</Typography>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="body1">Aún no has agregado tus habilidades.</Typography>
                                )}
                            </Box>

                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Años de Estudio:</Typography>
                            <Typography variant="body1">
                                {profileData?.year || 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>
                )}

                {/* MODO EDICIÓN */}
                {isEditing && (
                    <Stack spacing={3} sx={{ mt: 1 }}>

                        {/* 1. Selector de Habilidades (Múltiple, Agrupado por Tipo) */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que quieres mostrar</Typography>

                            <Controller
                                name="habilidades" // Campo de RHF que guardará un array de IDs [1, 5, 10]
                                control={control}
                                render={({ field }) => {
                                    // Fuente de verdad: siempre usar field.value en edición
                                    const currentIdsRaw = Array.isArray(field.value) ? field.value : [];

                                    // Deduplicar IDs manteniendo orden (evitar chips duplicados y keys no únicas)
                                    const uniqueIdStrings = Array.from(new Set(currentIdsRaw.map(id => String(id))));

                                    // Mapear esos IDs únicos a objetos completos para Autocomplete.
                                    const selectedOptions = uniqueIdStrings.map(idStr => {
                                        // Buscar en allSkills primero (caso normal)
                                        const fromAll = allSkills?.find(s => String(s.id) === idStr || s.id == idStr);
                                        if (fromAll) return fromAll;
                                        // Devolver objeto mínimo
                                        return { id: idStr, nombre_habilidad: `Habilidad ${idStr}` };
                                    });

                                    return (
                                        <>
                                            <Autocomplete
                                                multiple
                                                options={(
                                                    allSkills ? 
                                                    [...allSkills].sort((a, b) => {
                                                        // Primero ordenar por grupo alfabéticamente
                                                        const groupA = a.nombre_tipo || 'Otras';
                                                        const groupB = b.nombre_tipo || 'Otras';
                                                        const groupCompare = groupA.localeCompare(groupB);
                                                        
                                                        // Si están en el mismo grupo, ordenar por nombre de habilidad
                                                        if (groupCompare === 0) {
                                                            const nameA = a.nombre_habilidad || a.nombre || '';
                                                            const nameB = b.nombre_habilidad || b.nombre || '';
                                                            return nameA.localeCompare(nameB);
                                                        }
                                                        
                                                        return groupCompare;
                                                    }) : 
                                                    []
                                                )}
                                                getOptionLabel={(option) => option.nombre_habilidad || option.nombre || ''}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={selectedOptions}

                                                // Cuando el valor cambia, lo mapeamos de vuelta a la lista de IDs para RHF
                                                onChange={(event, newValue) => {
                                                    // newValue puede contener objetos o valores primitivos
                                                    const ids = (newValue || []).map(v => (v && typeof v === 'object') ? (v.id ?? v.value ?? v.key) : v);
                                                    field.onChange(ids);
                                                }}

                                                // Agrupación por Tipo de Habilidad usando nombre_tipo directamente
                                                groupBy={(option) => option.nombre_tipo || 'Otras'}

                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Selecciona tus habilidades"
                                                        error={!!errors.habilidades}
                                                        helperText={errors.habilidades?.message}
                                                    />
                                                )}
                                                // Ocultar chips dentro del input; los mostraremos abajo
                                                renderTags={() => null}
                                            />

                                            {/* Lista apilada de habilidades seleccionadas con botón para eliminar */}
                                            <Stack spacing={1} sx={{ mt: 1 }}>
                                                {selectedOptions && selectedOptions.length > 0 ? (
                                                    selectedOptions.map((opt, idx) => {
                                                        const idVal = opt && typeof opt === 'object' ? (opt.id ?? opt.value ?? opt.key) : opt;
                                                        const label = opt && typeof opt === 'object'
                                                            ? (opt.nombre_habilidad || opt.nombre || opt.name || String(idVal))
                                                            : String(idVal);

                                                        return (
                                                            <Chip
                                                                key={idVal != null ? `skill-${idVal}` : `skill-${idx}`}
                                                                label={label}
                                                                                onDelete={() => {
                                                                                    // Eliminar usando únicamente el estado de RHF
                                                                                    const current = Array.isArray(field.value) ? field.value : [];
                                                                                    const updatedIds = current.filter(id => String(id) !== String(idVal));
                                                                                    field.onChange(updatedIds);
                                                                                }}
                                                            />
                                                        );
                                                    })
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">No hay habilidades seleccionadas.</Typography>
                                                )}
                                            </Stack>
                                        </>
                                    );
                                }}
                            />
                        </Box>

                        {/* 2. Campo Años de Estudio */}
                        {/* <TextField
                            fullWidth
                            label="Años de Estudio"
                            type="number"
                            InputLabelProps={{ shrink: true }}
                            {...register('year', { valueAsNumber: true })}
                            error={!!errors.year}
                            helperText={errors.year?.message}
                        /> */}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCardHabilidades;