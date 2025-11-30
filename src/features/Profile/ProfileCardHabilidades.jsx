import React from 'react';
import { Card, CardContent, Typography, Box, Grid, TextField, Autocomplete, Chip } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

const ProfileCardHabilidades = ({ profileData, isEditing, allSkills, skillTypes }) => {
    // Obtener las funciones de RHF del FormProvider del componente padre
    const { control, register, formState: { errors } } = useFormContext();

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Habilidades y Experiencia</Typography>

                {/* MODO LECTURA */}
                {!isEditing && (
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Habilidades:</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {profileData?.habilidades || 'Aún no has agregado tus habilidades.'}
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 2 }}>
                            **Años de Estudio:** {profileData?.year || 'N/A'}
                        </Typography>
                    </Box>
                )}

                {/* MODO EDICIÓN */}
                {isEditing && (
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que quieres mostrar</Typography>

                            <Controller
                                name="habilidades" // El nombre del campo que RHF controlará
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        multiple
                                        options={allSkills} // La lista completa de habilidades
                                        getOptionLabel={(option) => option.nombre || ''} // Usar el campo 'nombre'
                                        isOptionEqualToValue={(option, value) => option.id === value.id} // Comparar por ID

                                        // Valor actual de la selección (array de objetos {id, nombre})
                                        value={allSkills.filter(skill => field.value.includes(skill.id))}

                                        // Cuando el usuario selecciona/deselecciona
                                        onChange={(event, newValue) => {
                                            // Mapear de vuelta a la lista de IDs para el formulario
                                            field.onChange(newValue.map(v => v.id));
                                        }}

                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Selecciona tus habilidades"
                                                error={!!errors.habilidades}
                                                helperText={errors.habilidades?.message}
                                            />
                                        )}
                                        renderGroup={(params) => ( // Usar el tipo de habilidad como grupo
                                            <li key={params.key}>
                                                <div style={{ padding: '8px 16px', fontWeight: 'bold' }}>{params.group}</div>
                                                <ul style={{ padding: 0 }}>{params.children}</ul>
                                            </li>
                                        )}
                                        // Agrupar por el Tipo de Habilidad (requiere una función)
                                        groupBy={(option) => skillTypes.find(type => type.id === option.tipo_id)?.nombre || 'Otras'}

                                        // Cómo se renderiza la selección
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    key={option.id}
                                                    label={option.nombre}
                                                    {...getTagProps({ index })}
                                                />
                                            ))
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        {/* <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Años de Estudio"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                // El valor debe ser parseado a número para la API
                                {...register('year', { valueAsNumber: true })}
                                error={!!errors.year}
                                helperText={errors.year?.message}
                            />
                        </Grid> */}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCardHabilidades;