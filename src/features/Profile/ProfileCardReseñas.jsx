import React from 'react';
import { Card, CardContent, Typography, Box, Rating } from '@mui/material';

const ProfileCardReseñas = ({ profileData }) => {
    // Si tu API aún no tiene reseñas, puedes simular datos aquí
    const averageRating = 4.5;
    const reviewCount = 12;

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Valoraciones y Reseñas
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="h4" component="span" sx={{ mr: 1 }}>
                        {averageRating}
                    </Typography>
                    <Rating
                        value={averageRating}
                        precision={0.5}
                        readOnly
                    />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Basado en {reviewCount} reseñas.
                </Typography>

                {/* Aquí iría el listado de las reseñas */}
                <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        [Futuro listado de comentarios y valoraciones]
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfileCardReseñas;