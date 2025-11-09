import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import ManageTasksScreen from '../screens/ManageTasksScreen';
import ArchivedTasksScreen from '../screens/ArchivedTasksScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="CreateTask">
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'Criar Nova Tarefa' }} />
      <Stack.Screen name="ManageTasks" component={ManageTasksScreen} options={{ title: 'Minhas Tarefas' }} />
      <Stack.Screen name="ArchivedTasks" component={ArchivedTasksScreen} options={{ title: 'Tarefas Arquivadas' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
