import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import { formatProfileDataForForm } from '../../utils/formatProfileDataForForm';
import SkillSelector from './components/SkillSelector';

const ProfileCardHabilidades = ({ profileData, isEditing, allSkills, skillTypes }) => {
    const { control, register, formState: { errors }, setValue } = useFormContext();

    // Precargar habilidades cuando entra en modo edición
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
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Habilidades y Experiencia</Typography>

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
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que puedes enseñar</Typography>
                            <SkillSelector
                                control={control}
                                fieldName="habilidades_que_se_saben"
                                label="Selecciona habilidades que puedes enseñar"
                                allSkills={allSkills}
                                errors={errors}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Habilidades que quieres aprender</Typography>
                            <SkillSelector
                                control={control}
                                fieldName="habilidades_por_aprender"
                                label="Selecciona habilidades por aprender"
                                allSkills={allSkills}
                                errors={errors}
                            />
                        </Box>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCardHabilidades;