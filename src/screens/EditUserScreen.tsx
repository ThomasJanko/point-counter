import React from 'react';
import { useRoute } from '@react-navigation/native';
import { User } from '../types';
import UserForm from '../components/UserForm';

const EditUserScreen = () => {
  const route = useRoute();
  const { user } = route.params as { user: User };

  return <UserForm mode="edit" user={user} />;
};

export default EditUserScreen;
