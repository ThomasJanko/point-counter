import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { User } from '../types';

interface ScoreTableProps {
  selectedUsers: User[];
  scoreLines: { [lineId: string]: { [userId: string]: number | null } };
  focusedInput: string | null;
  scoreLimit: number | null;
  onScoreChange: (lineId: string, userId: string, value: string) => void;
  onInputFocus: (inputKey: string) => void;
  onInputBlur: (userId: string) => void;
  onDeleteLine: (lineId: string) => void;
}

const ScoreTable: React.FC<ScoreTableProps> = ({
  selectedUsers,
  scoreLines,
  focusedInput,
  scoreLimit,
  onScoreChange,
  onInputFocus,
  onInputBlur,
  onDeleteLine,
}) => {
  return (
    <View style={styles.scoreTableContainer}>
      <View style={styles.tableHeaderContainer}>
        <Text style={styles.leaderboardTitle}>Scores</Text>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scoreTable}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={styles.lineNumberHeader}>#</Text>
              {selectedUsers.map(user => (
                <View key={user.id} style={styles.playerHeaderCell}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: user.color },
                    ]}
                  />
                  <Text style={styles.playerHeaderText}>{user.name}</Text>
                </View>
              ))}
              <Text style={styles.actionHeader}>Action</Text>
            </View>

            {/* Score Lines - Scrollable */}
            <ScrollView
              style={styles.scrollableRows}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {Object.entries(scoreLines).map(([lineId, lineScores], lineIndex) => (
                <View key={lineId} style={styles.tableRow}>
                  <Text style={styles.lineNumberCell}>{lineIndex + 1}</Text>
                  {selectedUsers.map(user => {
                    const inputKey = `${lineId}_${user.id}`;
                    const isFocused = focusedInput === inputKey;
                    return (
                      <TextInput
                        key={inputKey}
                        style={[
                          styles.scoreInputCell,
                          isFocused && styles.scoreInputCellFocused,
                        ]}
                        value={
                          lineScores[user.id] !== null
                            ? lineScores[user.id]?.toString() || ''
                            : ''
                        }
                        onChangeText={value =>
                          onScoreChange(lineId, user.id, value)
                        }
                        onFocus={() => onInputFocus(inputKey)}
                        onBlur={() => onInputBlur(user.id)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                        selectTextOnFocus={true}
                        returnKeyType="next"
                      />
                    );
                  })}
                  <TouchableOpacity
                    style={styles.deleteLineButton}
                    onPress={() => onDeleteLine(lineId)}
                  >
                    <Text style={styles.deleteLineButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreTableContainer: {
    marginTop: -20,
    flex: 1,
    padding: 10,
    paddingTop: 5,
  },
  tableHeaderContainer: {
    marginBottom: 8,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  scoreTable: {
    flex: 1,
  },
  tableContainer: {
    minWidth: 400,
    flex: 1,
  },
  scrollableRows: {
    flex: 1,
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lineNumberHeader: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  playerHeaderCell: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  playerHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginLeft: 4,
    textAlign: 'center',
  },
  actionHeader: {
    width: 50,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    alignItems: 'center',
    minHeight: 50,
  },
  lineNumberCell: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  scoreInputCell: {
    width: 100,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 4,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  scoreInputCellFocused: {
    borderColor: '#8b5cf6',
    backgroundColor: '#3a2a4a',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteLineButton: {
    width: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLineButtonText: {
    fontSize: 16,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ScoreTable;
