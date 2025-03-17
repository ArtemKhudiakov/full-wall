import { Container, Box, AppBar, Toolbar, Typography } from '@mui/material';
import ProfileSection from './components/ProfileSection';
import PostFeed from './components/PostFeed';
import AuthStatus from './components/AuthStatus';
import { useSelector } from 'react-redux';
import { RootState } from './core/store/index';
import { useCurrentProfile } from './core/store/authSlice';
import { useGetAllPostsQuery } from './core/store/postsSlice';
function App() {
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data: authUser, isLoading: isAuthLoading } = useCurrentProfile();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: posts, isLoading: isPostsLoading } = useGetAllPostsQuery(user?.id.toString() || '');

  return (
    <Box width="800px">
      <AppBar position="static" >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Моя Стена
          </Typography>
          <AuthStatus />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, justifyContent: 'center' }}>
          <Box sx={{ width: '100%', mb: 4 }}>
            {isAuthLoading || loading ? (
              <div>Загрузка профиля...</div>
            ) : error ? (
              <div>Ошибка: {error}</div>
            ) : isAuthenticated && authUser ? (
              <ProfileSection user={user} />
            ) : (
              null
            )}
          </Box>

          {isPostsLoading ? (
            <div>Загрузка постов...</div>
          ) : isAuthenticated && authUser ? (
            <Box sx={{ width: '100%' }}>
              <PostFeed posts={posts || []} />
            </Box>
          ) : (
            <p>Необходимо авторизоваться</p>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
