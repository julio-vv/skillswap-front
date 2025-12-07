import React, { lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// Lazy load MatchSection para mejorar rendimiento inicial
const MatchSection = lazy(() => import('./MatchSection'));

/**
 * Wrapper para MatchSection con lazy loading
 * Muestra skeleton mientras carga el componente
 */
export const LazyMatchSection = ({ tipo, users, hasMore, onLoadMore, onUserClick, fullWidth }) => {
    const SkeletonLoader = () => (
        <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="200px" sx={{ mb: 2 }} />
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={150} />
                ))}
            </Stack>
        </Box>
    );

    return (
        <Suspense fallback={<SkeletonLoader />}>
            <MatchSection
                tipo={tipo}
                users={users}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
                onUserClick={onUserClick}
                fullWidth={fullWidth}
            />
        </Suspense>
    );
};

export default LazyMatchSection;
