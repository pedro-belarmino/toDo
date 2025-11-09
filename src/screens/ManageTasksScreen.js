import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getTasks, updateTask } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const ManageTasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Todas');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await getTasks();
      setTasks(allTasks.filter(task => !task.archived));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
    }
  };

  const handleArchive = async (task) => {
    try {
      await updateTask(task.id, { archived: true });
      fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível arquivar a tarefa.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Pendentes') return !task.completed;
    if (filter === 'Concluídas') return task.completed;
    return true;
  });

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={[styles.taskName, item.completed ? styles.completedTask : null]}>
        {item.name}
      </Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={() => handleToggleComplete(item)}>
          <MaterialIcons name={item.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleArchive(item)}>
          <MaterialIcons name="archive" size={24} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Nova Tarefa" onPress={() => navigation.navigate('CreateTask')} />
      <View style={styles.filterContainer}>
        <Button title="Todas" onPress={() => setFilter('Todas')} disabled={filter === 'Todas'} />
        <Button title="Pendentes" onPress={() => setFilter('Pendentes')} disabled={filter === 'Pendentes'} />
        <Button title="Concluídas" onPress={() => setFilter('Concluídas')} disabled={filter === 'Concluídas'} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      <Button title="Ver Arquivadas" onPress={() => navigation.navigate('ArchivedTasks')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  taskContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  taskName: { fontSize: 18 },
  completedTask: { textDecorationLine: 'line-through', color: 'gray' },
  icons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
});

export default ManageTasksScreen;
