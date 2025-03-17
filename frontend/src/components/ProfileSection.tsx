import { Card, CardContent, Avatar, Typography, Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import { IUserProfile } from '../types/common';
import ProfileEditForm from './ProfileEditForm';

interface ProfileBlockProps {
  user: IUserProfile | null;
}

const ProfileSection: React.FC<ProfileBlockProps> = memo(({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!user) {
    return <Typography color="error">Нет данных пользователя</Typography>;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar
                src={`${apiUrl}/uploads/${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                sx={{ width: 80, height: 80, marginRight: 2 }}
              />
              <Box>
                <Typography variant="h5">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography color="textSecondary">
                  Дата рождения: {user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : ''}
                </Typography>
              </Box>
            </Box>

          </Box>
          <Box mt={2}>
            <Typography>{user.about}</Typography>
          </Box>
          <Box mt={2}>
            <Typography>Email: {user.email}</Typography>
            <Typography>Телефон: {user.phone}</Typography>
          </Box>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleEditClick}>
              Редактировать
            </Button>
          </Box>
        </CardContent>
      </Card>

      {user && (
        <ProfileEditForm
          user={user}
          onCancel={handleCancelEdit}
          open={isEditing}
        />
      )}
    </>
  );
});

export default ProfileSection;
