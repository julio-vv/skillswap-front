import { useState, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { useMediaQuery, useTheme } from '@mui/material';
import { ConversationsList } from './components/ConversationsList';
import { ChatWindow } from './components/ChatWindow';
import { useConversations } from './hooks/useConversations';

/**
 * Página principal de chat
 * Renderiza la lista de conversaciones y la ventana de chat activa
 */
export default function ChatPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { conversacionId } = useParams();
    // Normalizar conversationId a número (puede venir como string desde URL)
    const initialId = conversacionId ? Number(conversacionId) : null;
    const [selectedConversation, setSelectedConversation] = useState(initialId);
    const { conversations, loading, error, fetchConversations } = useConversations();

    // Obtener el usuario de la conversación seleccionada
    const selectedConversationData = useMemo(() => {
        return conversations.find(conv => String(conv.id) === String(selectedConversation));
    }, [conversations, selectedConversation]);

    return (
        <Box
            sx={{
                display: 'flex',
                height: 'calc(100vh - 100px)',
                gap: 1,
                p: 2,
                backgroundColor: '#f5f5f5'
            }}
        >
            {/* Lista de conversaciones */}
            <Paper
                sx={{
                    flex: isMobile ? (selectedConversation ? 0 : 1) : '0 0 320px',
                    display: isMobile && selectedConversation ? 'none' : 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><CircularProgress /></Box>}>
                    <ConversationsList
                        conversations={conversations}
                        loading={loading}
                        error={error}
                        onSelectConversation={(convId) => {
                            setSelectedConversation(convId);
                        }}
                        onRetry={fetchConversations}
                        selectedConversationId={selectedConversation}
                    />
                </Suspense>
            </Paper>

            {/* Ventana de chat */}
            {selectedConversation && (
                <Paper
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><CircularProgress /></Box>}>
                        <ChatWindow
                            conversationId={selectedConversation}
                            otherUser={selectedConversationData?.otherUser}
                            onBack={isMobile ? () => setSelectedConversation(null) : undefined}
                        />
                    </Suspense>
                </Paper>
            )}

            {/* Mensaje cuando no hay conversación seleccionada */}
            {!selectedConversation && !isMobile && (
                <Paper
                    sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Selecciona una conversación para empezar a chatear
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
