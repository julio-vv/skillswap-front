import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Hook para manejar la lógica de formateo y agrupación de mensajes
 */
export const useMessageFormatting = () => {
    /**
     * Formatea una fecha según el contexto:
     * - Hoy: HH:mm
     * - Ayer: "Ayer HH:mm"
     * - Otros: dd/MM/yyyy HH:mm
     */
    const formatMessageDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        if (isToday(date)) {
            return format(date, 'HH:mm', { locale: es });
        } else if (isYesterday(date)) {
            return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
        } else {
            return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
        }
    };

    /**
     * Genera la clave para agrupar mensajes por fecha:
     * - Hoy
     * - Ayer
     * - dd MMMM yyyy
     */
    const getDateGroupKey = (date) => {
        if (isToday(date)) {
            return 'Hoy';
        } else if (isYesterday(date)) {
            return 'Ayer';
        } else {
            return format(date, 'dd MMMM yyyy', { locale: es });
        }
    };

    /**
     * Agrupa mensajes por fecha
     * Retorna un array de objetos { dateKey, messages }
     */
    const groupMessagesByDate = (messages) => {
        const groups = {};
        
        messages.forEach(message => {
            if (!message.fecha) return;
            
            const date = new Date(message.fecha);
            if (isNaN(date.getTime())) return;
            
            const dateKey = getDateGroupKey(date);
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        // Convertir a array ordenado por fecha
        return Object.entries(groups).map(([dateKey, messages]) => ({
            dateKey,
            messages
        }));
    };

    return {
        formatMessageDate,
        groupMessagesByDate
    };
};
