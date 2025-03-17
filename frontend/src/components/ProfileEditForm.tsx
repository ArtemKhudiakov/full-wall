import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Modal,
  Fade,
  Avatar,
  IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as locales from 'date-fns/locale';
import { IUserProfile } from '../types/common';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '../core/store/authSlice';

interface ProfileEditFormProps {
  user: IUserProfile;
  onCancel: () => void;
  open: boolean;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onCancel, open }) => {
  const [formData, setFormData] = useState<IUserProfile>({
    ...user
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading, error: uploadError }] = useUploadAvatarMutation();

  const isLoading = isUpdating || isUploading;
  const error = updateError || uploadError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        birthDate: date.toISOString().split('T')[0] 
      }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        id: user.id.toString(),
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          about: formData.about,
          phone: formData.phone,
        }
      }).unwrap();

      if (avatarFile) {
        await uploadAvatar({
          id: user.id.toString(),
          file: avatarFile
        }).unwrap();
      }

      onCancel(); 
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    }
  };

  return ReactDOM.createPortal(
    <Modal
      open={open}
      onClose={onCancel}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={open}>
        <Card sx={{ maxWidth: 450, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Редактирование профиля
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Произошла ошибка при обновлении профиля
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview || undefined}
                    alt={`${formData.firstName} ${formData.lastName}`}
                    sx={{ width: 100, height: 100, cursor: 'pointer' }}
                    onClick={handleAvatarClick}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      }
                    }}
                    onClick={handleAvatarClick}
                  >
                    <PhotoCameraIcon fontSize="small" sx={{ color: 'white' }} />
                  </IconButton>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Имя"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Box>
              </Box>

              <Box sx={{ width: '100%', mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locales.ru}>
                  <DatePicker
                    label="Дата рождения"
                    value={formData.birthDate ? new Date(formData.birthDate) : null}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="О себе"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Box>

              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>

              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled
                  margin="normal"
                  helperText="Email нельзя изменить"
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </Modal>,
    document.body
  );
};

export default ProfileEditForm; 