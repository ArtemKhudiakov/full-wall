import { Box, Typography } from '@mui/material';
import PostCard from './PostCard';
import { IPost } from '../types/common';
import { memo } from 'react';
import PostForm from './PostForm';

interface PostFeedProps {
  posts: IPost[];
}

const PostFeed: React.FC<PostFeedProps> = memo(({ posts }) => {

  return (
    <Box maxWidth="md">
      <PostForm />

      {posts && posts.length > 0 ? (
        posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <Typography>Посты отсутствуют</Typography>
      )}
    </Box>
  );
});

export default PostFeed;
