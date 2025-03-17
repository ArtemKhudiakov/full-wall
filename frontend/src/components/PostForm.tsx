import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  IconButton,
  Grid2
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { IPost } from '../types/common';
import { useCreatePostMutation, useUpdatePostMutation } from '../core/store/postsSlice';

interface PostFormProps {
  post?: IPost;
  onClose?: () => void;
  isEditing?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ post, onClose, isEditing = false }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (post && isEditing) {
      setText(post.text);
      setImages(post.images || []);
      setPreviewUrls(post.images || []);
    }
  }, [post, isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);

      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isEditing && index < images.length) {
      setImages(images.filter((_, i) => i !== index));
    }

    setPreviewUrls(previewUrls.filter((_, i) => i !== index));

    if (index >= images.length || !isEditing) {
      const adjustedIndex = isEditing ? index - images.length : index;
      setImageFiles(imageFiles.filter((_, i) => i !== adjustedIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('text', text);

      if (isEditing && images.length > 0) {
        images.forEach(imageName => {
          formData.append('existingImages', imageName);
        });
      }

      imageFiles.forEach(file => {
        const fileExtension = file.name.split('.').pop() || '';
        const contentType = `image/${fileExtension}`;

        const imageBlob = new Blob([file], { type: contentType });

        const imageFile = new File([imageBlob], file.name, { type: contentType });

        formData.append('images', imageFile);
      });

      if (isEditing && post) {
        await updatePost({
          id: post.id,
          data: formData
        });
      } else {
        await createPost(formData);
      }

      setText('');
      setImages([]);
      setImageFiles([]);
      setPreviewUrls([]);

      if (onClose) onClose();
    } catch (error) {
      console.error('Ошибка при сохранении поста:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Редактировать пост' : 'Создать новый пост'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Что нового?"
          value={text}
          onChange={handleTextChange}
          margin="normal"
          required
        />

        {previewUrls.length > 0 && (
          <Grid2 container spacing={1} sx={{ mt: 1, mb: 2 }}>
            {previewUrls.map((url, index) => (
              <Grid2 size={{ xs: 4, sm: 3, md: 2 }} key={index}>
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={isEditing ? `${apiUrl}/uploads/${url}` : url}
                    alt={`Превью ${index}`}
                    style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Grid2>
            ))}
          </Grid2>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCamera />}
            disabled={isLoading}
          >
            Добавить фото
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageUpload}
            />
          </Button>

          <Box>
            {onClose && (
              <Button
                onClick={onClose}
                sx={{ mr: 1 }}
                disabled={isLoading}
              >
                Отмена
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || (!text && previewUrls.length === 0)}
            >
              {isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Опубликовать'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostForm; 