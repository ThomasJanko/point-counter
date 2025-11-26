import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { User } from '../types';
import { useTheme } from '../theme';

interface ScoreTableProps {
  selectedUsers: User[];
  scoreLines: { [lineId: string]: { [userId: string]: number | null } };
  focusedInput: string | null;
  scoreLimit: number | null;
  onScoreChange: (lineId: string, userId: string, value: string) => void;
  onInputFocus: (inputKey: string) => void;
  onInputBlur: (userId: string) => void;
  onDeleteLine: (lineId: string) => void;
  onUsersReorder: (reorderedUsers: User[]) => void;
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
  onUsersReorder,
}) => {
  const { theme } = useTheme();
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const dragOffsetAnimated = useRef(new Animated.Value(0)).current;
  const opacityAnimated = useRef(new Animated.Value(1)).current;
  const columnShifts = useRef<{ [key: number]: Animated.Value }>({});

  const handleScoreChange = (lineId: string, userId: string, value: string) => {
    console.log('handleScoreChange', lineId, userId, value);
    // Remove leading zeros (e.g., "065" -> "65", "034" -> "34")
    // But keep "0" if the value is just "0"
    let cleanedValue = value;
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '') || '0';
    }
    console.log('cleanedValue', cleanedValue);
    onScoreChange(lineId, userId, cleanedValue);
  };

  const focusNextInput = (currentLineId: string, currentUserId: string) => {
    const lineEntries = Object.entries(scoreLines);
    const currentLineIndex = lineEntries.findIndex(
      ([id]) => id === currentLineId,
    );
    const currentUserIndex = selectedUsers.findIndex(
      u => u.id === currentUserId,
    );

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

  const createDragGesture = (index: number) => {
    const longPress = Gesture.LongPress()
      .minDuration(150)
      .onStart(() => {
        draggedIndexRef.current = index;
        setDraggedIndex(index);
        dragOffsetAnimated.setValue(0);
        Animated.spring(opacityAnimated, {
          toValue: 0.6,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      });

    const pan = Gesture.Pan()
      .onUpdate(event => {
        if (draggedIndexRef.current !== index) return;

        const { translationX } = event;
        dragOffsetAnimated.setValue(translationX);

        // Calculate which column we're hovering over
        const columnWidth = 94; // width (80) + margin (8 * 2)
        const currentDraggedIndex = draggedIndexRef.current;
        if (currentDraggedIndex === null) return;

        // Calculate target index based on translation
        // Allow placing before (negative) or after (positive) other columns
        const targetCol = Math.round(translationX / columnWidth);
        let newTargetIndex = currentDraggedIndex + targetCol;

        // Clamp to valid range
        newTargetIndex = Math.max(
          0,
          Math.min(selectedUsers.length - 1, newTargetIndex),
        );

        // If dragging to the same position, check if we want before or after
        if (newTargetIndex === currentDraggedIndex && targetCol !== 0) {
          newTargetIndex =
            targetCol > 0
              ? Math.min(selectedUsers.length - 1, currentDraggedIndex + 1)
              : Math.max(0, currentDraggedIndex - 1);
        }

        setTargetIndex(prev => {
          if (prev === newTargetIndex) {
            return prev;
          }

          // Animate column shifts to show insertion point
          const currentDraggedIdx = draggedIndexRef.current;
          if (currentDraggedIdx !== null) {
            for (let idx = 0; idx < selectedUsers.length; idx++) {
              if (idx !== currentDraggedIdx) {
                if (!columnShifts.current[idx]) {
                  columnShifts.current[idx] = new Animated.Value(0);
                }

                let newShift = 0;
                // If dragging left (to a lower index)
                if (currentDraggedIdx > newTargetIndex) {
                  // Shift columns between target and dragged position to the right
                  if (idx >= newTargetIndex && idx < currentDraggedIdx) {
                    newShift = 94; // Shift right (width 80 + margin 16)
                  }
                }
                // If dragging right (to a higher index)
                else if (currentDraggedIdx < newTargetIndex) {
                  // Shift columns between dragged and target position to the left
                  if (idx > currentDraggedIdx && idx <= newTargetIndex) {
                    newShift = -94; // Shift left (width 80 + margin 16)
                  }
                }

                Animated.spring(columnShifts.current[idx], {
                  toValue: newShift,
                  useNativeDriver: true,
                  tension: 100,
                  friction: 8,
                }).start();
              }
            }
          }

          return newTargetIndex;
        });
      })
      .onEnd(() => {
        const currentDraggedIndex = draggedIndexRef.current;
        if (
          currentDraggedIndex === index &&
          targetIndex !== null &&
          currentDraggedIndex !== targetIndex
        ) {
          // Reorder users
          const newUsers = [...selectedUsers];
          const [draggedUser] = newUsers.splice(currentDraggedIndex, 1);
          newUsers.splice(targetIndex, 0, draggedUser);
          onUsersReorder(newUsers);
        }
        if (draggedIndexRef.current === index) {
          // Reset all column shifts
          const resetAnimations = Object.keys(columnShifts.current).map(idx =>
            Animated.spring(columnShifts.current[Number(idx)], {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          );

          Animated.parallel([
            Animated.spring(dragOffsetAnimated, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(opacityAnimated, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            ...resetAnimations,
          ]).start(() => {
            draggedIndexRef.current = null;
            setDraggedIndex(null);
            setTargetIndex(null);
            dragOffsetAnimated.setValue(0);
            opacityAnimated.setValue(1);
          });
        }
      });

    return Gesture.Simultaneous(longPress, pan);
  };

  return (
    <View style={styles.scoreTableContainer}>
      <View
        style={[
          styles.scrollContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ScrollView
          style={styles.scoreTable}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View
              style={[
                styles.tableHeader,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.lineNumberHeader,
                  { color: theme.colors.primary },
                ]}
              >
                #
              </Text>
              {selectedUsers.map((user, index) => {
                const isDragging = draggedIndex === index;
                const isTarget =
                  targetIndex === index &&
                  draggedIndex !== null &&
                  draggedIndex !== index;
                const dragGesture = createDragGesture(index);

                return (
                  <View key={user.id} style={styles.headerCellWrapper}>
                    {/* Show placeholder in the original position when dragging */}
                    {isDragging && draggedIndex === index && (
                      <View
                        style={[
                          styles.playerHeaderCell,
                          styles.placeholderCell,
                          { borderColor: theme.colors.textTertiary },
                        ]}
                      />
                    )}
                    {/* Drop placeholder indicator - absolutely positioned */}
                    {isTarget && (
                      <Animated.View
                        style={[
                          styles.dropPlaceholder,
                          styles.dropPlaceholderAbsolute,
                          {
                            borderColor: theme.colors.primary,
                            backgroundColor: theme.colors.primaryBackground,
                            opacity: opacityAnimated.interpolate({
                              inputRange: [0.6, 1],
                              outputRange: [0.8, 0],
                            }),
                          },
                        ]}
                      />
                    )}
                    <GestureDetector gesture={dragGesture}>
                      <Animated.View
                        style={[
                          styles.playerHeaderCell,
                          isDragging && [
                            styles.playerHeaderCellDragging,
                            {
                              transform: [{ translateX: dragOffsetAnimated }],
                              opacity: opacityAnimated,
                              zIndex: 1000,
                              elevation: 10,
                            },
                          ],
                          !isDragging &&
                            (() => {
                              if (!columnShifts.current[index]) {
                                columnShifts.current[index] =
                                  new Animated.Value(0);
                              }
                              return {
                                transform: [
                                  { translateX: columnShifts.current[index] },
                                ],
                              };
                            })(),
                        ]}
                      >
                        <View
                          style={[
                            styles.dragHandle,
                            isDragging && styles.dragHandleActive,
                          ]}
                        />
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: user.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.playerHeaderText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          {user.name}
                        </Text>
                      </Animated.View>
                    </GestureDetector>
                  </View>
                );
              })}
              <View style={styles.actionHeader} />
            </View>

            {/* Score Lines - Scrollable */}
            <ScrollView
              style={styles.scrollableRows}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {Object.entries(scoreLines).map(
                ([lineId, lineScores], lineIndex) => (
                  <View
                    key={lineId}
                    style={[
                      styles.tableRow,
                      { borderBottomColor: theme.colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lineNumberCell,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {lineIndex + 1}
                    </Text>
                    {selectedUsers.map(user => {
                      const inputKey = `${lineId}_${user.id}`;
                      const isFocused = focusedInput === inputKey;
                      return (
                        <TextInput
                          // multiline={true}
                          ref={ref => {
                            inputRefs.current[inputKey] = ref;
                          }}
                          key={inputKey}
                          style={[
                            styles.scoreInputCell,
                            {
                              backgroundColor: theme.colors.card,
                              borderColor: theme.colors.borderLight,
                              color: theme.colors.text,
                            },
                            isFocused && [
                              styles.scoreInputCellFocused,
                              {
                                borderColor: theme.colors.primary,
                                backgroundColor: theme.colors.primaryBackground,
                                shadowColor: theme.colors.primary,
                              },
                            ],
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
                          onSubmitEditing={() => {
                            console.log('onSubmitEditing', lineId, user.id);
                            focusNextInput(lineId, user.id);
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={theme.colors.placeholder}
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
                      <View
                        style={[
                          styles.minusIconContainer,
                          { backgroundColor: theme.colors.error },
                        ]}
                      >
                        <View
                          style={[
                            styles.minusIcon,
                            { backgroundColor: theme.colors.text },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ),
              )}
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
  scrollContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
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
    height: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  lineNumberHeader: {
    width: 24,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  playerHeaderCell: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    position: 'relative',
  },
  playerHeaderCellDragging: {
    zIndex: 1000,
    elevation: 10,
  },
  playerHeaderCellTarget: {
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 4,
  },
  dropPlaceholder: {
    width: 80,
    height: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  dragHandle: {
    opacity: 0.3,
  },
  dragHandleActive: {
    opacity: 1,
  },
  playerHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionHeader: {
    width: 35,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    minHeight: 40,
  },
  lineNumberCell: {
    width: 30,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreInputCell: {
    width: 80,
    height: 34,
    borderRadius: 6,
    borderWidth: 2,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 4,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  scoreInputCellFocused: {
    shadowOffset: { width: 0, height: 0 },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusIcon: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flex: 0,
    marginRight: 4,
  },
  headerCellWrapper: {
    position: 'relative',
    width: 80,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropPlaceholderAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  placeholderCell: {
    opacity: 0.3,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
});
export default ScoreTable;
