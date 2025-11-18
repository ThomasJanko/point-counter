import React, { useRef } from 'react';
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
  scoreLimit: _scoreLimit,
  onScoreChange,
  onInputFocus,
  onInputBlur,
  onDeleteLine,
}) => {
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const handleScoreChange = (lineId: string, userId: string, value: string) => {
    // Remove leading zeros (e.g., "065" -> "65", "034" -> "34")
    // But keep "0" if the value is just "0"
    let cleanedValue = value;
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '') || '0';
    }
    onScoreChange(lineId, userId, cleanedValue);
  };

  const focusNextInput = (currentLineId: string, currentUserId: string) => {
    const lineEntries = Object.entries(scoreLines);
    const currentLineIndex = lineEntries.findIndex(([id]) => id === currentLineId);
    const currentUserIndex = selectedUsers.findIndex(u => u.id === currentUserId);

    // Try next user in same row
    if (currentUserIndex < selectedUsers.length - 1) {
      const nextUserId = selectedUsers[currentUserIndex + 1].id;
      const nextInputKey = `${currentLineId}_${nextUserId}`;
      onInputFocus(nextInputKey);
      inputRefs.current[nextInputKey]?.focus();
      return;
    }

    // Try first user in next row
    if (currentLineIndex < lineEntries.length - 1) {
      const nextLineId = lineEntries[currentLineIndex + 1][0];
      const firstUserId = selectedUsers[0].id;
      const nextInputKey = `${nextLineId}_${firstUserId}`;
      onInputFocus(nextInputKey);
      inputRefs.current[nextInputKey]?.focus();
    }
  };

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
              <View style={styles.actionHeader} />
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
                        ref={ref => {
                          inputRefs.current[inputKey] = ref;
                        }}
                        key={inputKey}
                        style={[
                          styles.scoreInputCell,
                          isFocused && styles.scoreInputCellFocused,
                        ]}
                        value={
                          lineScores[user.id] == null
                            ? ''
                            : lineScores[user.id]?.toString() || ''
                        }
                        onChangeText={value =>
                          handleScoreChange(lineId, user.id, value)
                        }
                        onFocus={() => onInputFocus(inputKey)}
                        onBlur={() => onInputBlur(user.id)}
                        onSubmitEditing={() => focusNextInput(lineId, user.id)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#666"
                        selectTextOnFocus={true}
                        returnKeyType="next"
                        textAlignVertical="center"
                      />
                    );
                  })}
                  <TouchableOpacity
                    style={styles.deleteLineButton}
                    onPress={() => onDeleteLine(lineId)}
                  >
                    <View style={styles.minusIconContainer}>
                      <View style={styles.minusIcon} />
                    </View>
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
    padding: 6,
    paddingTop: 4,
  },
  tableHeaderContainer: {
    marginBottom: 4,
  },
  leaderboardTitle: {
    fontSize: 18,
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
    minWidth: '100%',
    flex: 1,
  },
  scrollableRows: {
    flex: 1,
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
  },
  lineNumberHeader: {
    width: 30,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  playerHeaderCell: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  playerHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginLeft: 3,
    textAlign: 'center',
  },
  actionHeader: {
    width: 35,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    alignItems: 'center',
    minHeight: 40,
  },
  lineNumberCell: {
    width: 30,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  scoreInputCell: {
    width: 80,
    height: 34,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 2,
    paddingHorizontal: 4,
    paddingVertical: 0,
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
    width: 35,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  minusIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusIcon: {
    width: 10,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ScoreTable;
