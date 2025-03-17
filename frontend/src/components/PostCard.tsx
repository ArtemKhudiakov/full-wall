import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid2
} from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import { IPost } from '../types/common';
import { memo } from 'react';
import { useDeletePostMutation } from '../core/store/postsSlice';
import PostForm from './PostForm';

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = memo(({ post }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePost(post.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  return (
    <>
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography component="div" sx={{ flex: 1 }}>
              {post.text}
            </Typography>

            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditClick}>
                <Edit fontSize="small" sx={{ mr: 1 }} />
                Редактировать
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <Delete fontSize="small" sx={{ mr: 1 }} />
                Удалить
              </MenuItem>
            </Menu>
          </Box>

          {post.images && post.images.length > 0 && (
            <Grid2 container spacing={1} mt={1}>
              {post.images.map((image, index) => (
                <Grid2 key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <CardMedia
                    component="img"
                    image={`${apiUrl}/uploads/${image}`}
                    alt={`Изображение поста ${index + 1}`}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid2>
              ))}
            </Grid2>
          )}

          <Typography variant="caption" display="block" mt={1}>
            {new Date(post.createdAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <PostForm
            post={post}
            isEditing={true}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление поста</DialogTitle>
        <DialogContent>
          <Typography>
            Точно удаляем? А если подумать...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default PostCard;
