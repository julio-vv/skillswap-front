import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../api/axiosInstance';
import { VALORACIONES } from '../../constants/apiEndpoints';
import { useAuth } from '../Auth/AuthContext';

// Determinar el tamaño de la tarjeta según la longitud del comentario
const getCardSize = (comentario) => {
    if (!comentario || comentario.length === 0) return 4; // Pequeña (1/3)
    if (comentario.length <= 100) return 4; // Pequeña (1/3)
    if (comentario.length <= 200) return 6; // Mediana (1/2)
    return 12; // Grande (full)
};

// Componente para un item de valoración como tarjeta
const ReviewItem = ({ review, isOwnReview, onEdit, onDelete, evaluadorInfo }) => {
    const cardSize = getCardSize(review.comentario);
    
    // Manejar caso donde el backend no devuelve el evaluador
    const nombreCompleto = evaluadorInfo 
        ? `${evaluadorInfo.nombre} ${evaluadorInfo.apellido}`.trim()
        : (review.evaluador ? `Usuario #${review.evaluador}` : 'Usuario anónimo');
    
    const avatarSrc = evaluadorInfo?.media || null;
    const inicial = nombreCompleto.charAt(0).toUpperCase();
    
    return (
        <Grid size={{ xs: 12, sm: cardSize }}>
            <Card 
                sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'box-shadow 0.3s',
                    '&:hover': isOwnReview ? { boxShadow: 3 } : {}
                }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header con avatar y nombre */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                        <Avatar 
                            src={avatarSrc} 
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                        >
                            {inicial}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                {nombreCompleto}
                            </Typography>
                        </Box>
                        {isOwnReview && (
                            <Stack direction="row" spacing={0.5}>
                                <IconButton size="small" onClick={() => onEdit(review)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => onDelete(review.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        )}
                    </Stack>

                    {/* Rating */}
                    <Rating value={review.puntuacion} readOnly size="small" sx={{ mb: 1 }} />

                    {/* Comentario */}
                    {review.comentario && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                                wordBreak: 'break-word',
                                lineHeight: 1.6
                            }}
                        >
                            {review.comentario}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

// Formulario simple para crear/editar valoración propia
const ReviewEditor = ({ initialValue, onCancel, onSubmit }) => {
    const [puntuacion, setPuntuacion] = useState(initialValue?.puntuacion || 0);
    const [comentario, setComentario] = useState(initialValue?.comentario || '');

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="body2">Tu valoración:</Typography>
                <Rating value={puntuacion} onChange={(_, v) => setPuntuacion(v || 0)} />
            </Stack>
            <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Escribe un comentario (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Button variant="contained" onClick={() => onSubmit({ puntuacion, comentario })} disabled={puntuacion < 1}>
                    Guardar
                </Button>
                <Button variant="text" onClick={onCancel}>Cancelar</Button>
            </Stack>
        </Box>
    );
};

const ProfileCardReseñas = ({ profileData }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null); // null: no edit, {}: new, {id}: edit existing
    const [evaluadores, setEvaluadores] = useState({}); // Mapa: evaluadorId -> { nombre, apellido, media }

    const evaluatedUserId = profileData?.id; // Perfil que estamos viendo

    const averageRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10; // 1 decimal
    }, [reviews]);

    const reviewCount = reviews?.length || 0;

    const ownReview = useMemo(() => {
        if (!user) return null;
        return reviews.find(r => String(r.evaluador) === String(user.id)) || null;
    }, [reviews, user]);

    const canEdit = Boolean(user && evaluatedUserId && String(user.id) !== String(evaluatedUserId));

    const fetchReviews = async () => {
        if (!evaluatedUserId) return;
        setLoading(true);
        try {
            // Este endpoint lista todas; si necesitas filtrar por evaluado, podríamos usar query param
            const resp = await axiosInstance.get(VALORACIONES);
            const all = Array.isArray(resp.data) ? resp.data : resp.data?.results || [];
            const filtered = all.filter(r => String(r.evaluado) === String(evaluatedUserId));
            
            setReviews(filtered);

            // Verificar si el backend devuelve el campo evaluador
            if (filtered.length > 0 && !filtered[0].hasOwnProperty('evaluador')) {
                // No intentar cargar evaluadores si el campo no existe
                setEvaluadores({});
                return;
            }

            // Obtener información de los evaluadores únicos, filtrando undefined/null
            const evaluadorIds = [...new Set(
                filtered
                    .map(r => r.evaluador)
                    .filter(id => id !== undefined && id !== null)
            )];
            
            if (evaluadorIds.length === 0) {
                setEvaluadores({});
                return;
            }
            
            const evaluadoresData = {};
            
            await Promise.all(
                evaluadorIds.map(async (id) => {
                    try {
                        const userResp = await axiosInstance.get(`usuarios/${id}/`);
                        evaluadoresData[id] = {
                            nombre: userResp.data.nombre || '',
                            apellido: userResp.data.apellido || '',
                            media: userResp.data.media || null
                        };
                    } catch (err) {
                        console.warn(`No se pudo cargar evaluador #${id}:`, err._friendlyMessage || err.message);
                        evaluadoresData[id] = { nombre: 'Usuario', apellido: '', media: null };
                    }
                })
            );
            
            setEvaluadores(evaluadoresData);
        } catch (e) {
            console.error('Error cargando valoraciones:', e._friendlyMessage || e.message);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evaluatedUserId]);

    const handleCreateOrUpdate = async ({ puntuacion, comentario }) => {
        try {
            if (ownReview) {
                await axiosInstance.put(`${VALORACIONES}${ownReview.id}/`, {
                    evaluado: evaluatedUserId,
                    puntuacion,
                    comentario,
                });
            } else {
                await axiosInstance.post(VALORACIONES, {
                    evaluado: evaluatedUserId,
                    puntuacion,
                    comentario,
                });
            }
            setEditingReview(null);
            fetchReviews();
        } catch (e) {
            console.error('Error guardando valoración:', e._friendlyMessage || e.message);
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await axiosInstance.delete(`${VALORACIONES}${reviewId}/`);
            fetchReviews();
        } catch (e) {
            console.error('Error eliminando valoración:', e._friendlyMessage || e.message);
        }
    };

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Valoraciones y Reseñas
                </Typography>

                <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="h4" component="span" sx={{ mr: 1 }}>
                        {averageRating || 0}
                    </Typography>
                    <Rating value={averageRating || 0} precision={0.5} readOnly />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {reviewCount > 0 ? `Basado en ${reviewCount} reseña${reviewCount !== 1 ? 's' : ''}.` : 'Aún no hay reseñas.'}
                </Typography>

                {/* Editor para crear/editar la propia reseña */}
                {canEdit && (
                    <Box sx={{ mt: 2 }}>
                        {editingReview || !ownReview ? (
                            <ReviewEditor
                                initialValue={ownReview || undefined}
                                onCancel={() => setEditingReview(null)}
                                onSubmit={handleCreateOrUpdate}
                            />
                        ) : (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                <Typography variant="body2">Ya has dejado una valoración.</Typography>
                                <Button variant="text" size="small" onClick={() => setEditingReview(ownReview)}>
                                    Editar la tuya
                                </Button>
                                <Button variant="text" size="small" color="error" onClick={() => handleDelete(ownReview.id)}>
                                    Eliminar
                                </Button>
                            </Stack>
                        )}
                    </Box>
                )}

                {/* Listado */}
                <Box sx={{ mt: 3 }}>
                    {loading && (
                        <Typography variant="body2" color="text.secondary">Cargando reseñas...</Typography>
                    )}
                    {!loading && reviews.length === 0 && (
                        <Box sx={{ p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No hay valoraciones para este usuario.
                            </Typography>
                        </Box>
                    )}
                    {!loading && reviews.length > 0 && (
                        <Grid container spacing={2}>
                            {reviews.map((rev) => (
                                <ReviewItem
                                    key={rev.id}
                                    review={rev}
                                    isOwnReview={ownReview?.id === rev.id}
                                    onEdit={(r) => setEditingReview(r)}
                                    onDelete={handleDelete}
                                    evaluadorInfo={evaluadores[rev.evaluador] || null}
                                />
                            ))}
                        </Grid>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfileCardReseñas;