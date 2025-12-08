import { useState } from 'react';
import { 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemAvatar, 
    ListItemText, 
    Avatar, 
    Badge, 
    Typography, 
    Box,
    TextField,
    InputAdornment,
    Divider,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Componente para mostrar la lista de conversaciones
 */
export const ConversationsList = ({ 
    conversations = [],
    loading = false,
    error = null,
    selectedConversationId, 
    onSelectConversation,
    onRetry
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" p={2}>
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                    {error}
                </Alert>
                <Button variant="outlined" size="small" onClick={onRetry}>
                    Reintentar
                </Button>
            </Box>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="text.secondary">
                    No tienes conversaciones aún
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                    Inicia una conversación desde la lista de amigos
                </Typography>
            </Box>
        );
    }

    // Filtrar conversaciones por nombre del otro usuario
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        
        const otherUser = conv.otherUser;
        const searchLower = searchQuery.toLowerCase();
        
        return (
            otherUser?.nombre?.toLowerCase().includes(searchLower) ||
            otherUser?.apellido?.toLowerCase().includes(searchLower) ||
            otherUser?.email?.toLowerCase().includes(searchLower)
        );
    });
    
    // Normalizar selectedConversationId a número para comparación consistente.
    // Necesario porque conversationId puede venir como string desde la URL (?id=123)
    // pero los IDs en conversations[] son numbers. Evita falsos negativos en isSelected.
    const normalizedSelectedId = selectedConversationId ? Number(selectedConversationId) : null;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Buscador */}
            <Box p={2} pb={1}>
                <TextField
                    id="search-conversations"
                    name="search-conversations"
                    fullWidth
                    size="small"
                    placeholder="Buscar conversación..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Lista de conversaciones */}
            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                {filteredConversations.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">
                            No se encontraron conversaciones
                        </Typography>
                    </Box>
                ) : (
                    filteredConversations.map((conversation, index) => {
                        const otherUser = conversation.otherUser;
                        const isSelected = Number(conversation.id) === normalizedSelectedId;
                        const hasUnread = conversation.unreadCount > 0;

                        return (
                            <Box key={conversation.id}>
                                {index > 0 && <Divider />}
                                <ListItem disablePadding>
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => onSelectConversation(conversation.id)}
                                        sx={{
                                            py: 2,
                                            '&.Mui-selected': {
                                                backgroundColor: 'action.selected',
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge 
                                                badgeContent={hasUnread ? conversation.unreadCount : 0} 
                                                color="error"
                                                overlap="circular"
                                            >
                                                <Avatar 
                                                    src={otherUser?.media || otherUser?.foto_perfil}
                                                    alt={`${otherUser?.nombre || ''} ${otherUser?.apellido || ''}`}
                                                >
                                                    {otherUser?.nombre?.[0]?.toUpperCase() || '?'}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        
                                        <ListItemText
                                            primary={
                                                <Typography 
                                                    variant="subtitle2" 
                                                    fontWeight={hasUnread ? 'bold' : 'normal'}
                                                >
                                                    {otherUser?.nombre} {otherUser?.apellido}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: hasUnread ? 'medium' : 'normal'
                                                    }}
                                                >
                                                    {conversation.ultimo_mensaje?.contenido || 
                                                     (conversation.fecha_actualizacion 
                                                        ? new Date(conversation.fecha_actualizacion).toLocaleTimeString('es-ES', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit',
                                                            hour12: false 
                                                          })
                                                        : 'Sin mensajes')}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </Box>
                        );
                    })
                )}
            </List>
        </Box>
    );
};
