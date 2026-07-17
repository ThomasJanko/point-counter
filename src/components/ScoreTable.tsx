import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Animated, findNodeHandle, Pressable } from 'react-native';
// The score cells and the delete-line button live inside a gesture-handler
// ScrollView, so they use core RN's Pressable rather than TouchableOpacity:
// Pressable is what gesture-handler's native gesture recognizer arbitrates
// against correctly (TouchableOpacity uses the old JS responder system,
// which doesn't), and gesture-handler's own Touchable* components are
// `@deprecated` in the installed version in favor of Pressable anyway.
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS, tabularNums } from '../theme/types';

type FocusedCell = { lineId: string; userId: string } | null;

interface ScoreTableProps {
  selectedUsers: User[];
  /** Raw string per cell; '' means "not entered yet". */
  scoreLines: Record<string, Record<string, string>>;
  focusedCell: FocusedCell;
  scoreLimit: number | null;
  onScoreChange: (lineId: string, userId: string, value: string) => void;
  onFocusChange: (cell: FocusedCell) => void;
  onDeleteLine: (lineId: string) => void;
  onUsersReorder: (reorderedUsers: User[]) => void;
}

const ScoreTable: React.FC<ScoreTableProps> = ({
  selectedUsers,
  scoreLines,
  focusedCell,
  scoreLimit: _scoreLimit,
  onScoreChange,
  onFocusChange,
  onDeleteLine,
  onUsersReorder,
}) => {
  const { theme } = useTheme();
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const rowsScrollRef = useRef<ScrollView>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const dragOffsetAnimated = useRef(new Animated.Value(0)).current;
  const opacityAnimated = useRef(new Animated.Value(1)).current;
  const columnShifts = useRef<{ [key: number]: Animated.Value }>({});

  const handleScoreChange = (lineId: string, userId: string, value: string) => {
    let cleanedValue = value;
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '') || '0';
    }
    onScoreChange(lineId, userId, cleanedValue);
  };

  // Tapping a cell clears its previous value before entering edit mode, so
  // typing always starts fresh (matching the old selectTextOnFocus "type to
  // replace" behavior) without ever letting Android enter its native text-
  // selection UI — which is what was hijacking the scroll gesture whenever a
  // filled, centered cell was touched.
  const beginEditing = (lineId: string, userId: string) => {
    // onScoreChange(lineId, userId, '');
    onFocusChange({ lineId, userId });
  };

  // Android doesn't auto-scroll a focused TextInput above the keyboard the
  // way iOS does. Without this, score inputs on the lower rows of the table
  // get hidden behind the keyboard once it opens.
  const scrollFocusedInputIntoView = (inputKey: string) => {
    const input = inputRefs.current[inputKey];
    const scrollView = rowsScrollRef.current;
    if (!input || !scrollView) return;

    requestAnimationFrame(() => {
      const scrollNode = findNodeHandle(scrollView);
      if (!scrollNode) return;
      input.measureLayout(
        scrollNode,
        (_x: number, y: number, _width: number) => {
          scrollView.scrollTo({ y: Math.max(0, y - 60), animated: true });
        },
        () => {
          // Measurement can fail transiently during layout; ignore.
        },
      );
    });
  };

  const focusNextInput = (currentLineId: string, currentUserId: string) => {
    const lineEntries = Object.entries(scoreLines);
    const currentLineIndex = lineEntries.findIndex(([id]) => id === currentLineId);
    const currentUserIndex = selectedUsers.findIndex(u => u.id === currentUserId);

    if (currentUserIndex < selectedUsers.length - 1) {
      const nextUserId = selectedUsers[currentUserIndex + 1].id;
      onFocusChange({ lineId: currentLineId, userId: nextUserId });
      return;
    }

    if (currentLineIndex < lineEntries.length - 1) {
      const nextLineId = lineEntries[currentLineIndex + 1][0];
      const firstUserId = selectedUsers[0].id;
      onFocusChange({ lineId: nextLineId, userId: firstUserId });
      return;
    }

    // Last cell of the last line: nothing to move to.
    onFocusChange(null);
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

        const columnWidth = 94;
        const currentDraggedIndex = draggedIndexRef.current;
        if (currentDraggedIndex === null) return;

        const targetCol = Math.round(translationX / columnWidth);
        let newTargetIndex = currentDraggedIndex + targetCol;

        newTargetIndex = Math.max(0, Math.min(selectedUsers.length - 1, newTargetIndex));

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

          const currentDraggedIdx = draggedIndexRef.current;
          if (currentDraggedIdx !== null) {
            for (let idx = 0; idx < selectedUsers.length; idx++) {
              if (idx !== currentDraggedIdx) {
                if (!columnShifts.current[idx]) {
                  columnShifts.current[idx] = new Animated.Value(0);
                }

                let newShift = 0;
                if (currentDraggedIdx > newTargetIndex) {
                  if (idx >= newTargetIndex && idx < currentDraggedIdx) {
                    newShift = 94;
                  }
                } else if (currentDraggedIdx < newTargetIndex) {
                  if (idx > currentDraggedIdx && idx <= newTargetIndex) {
                    newShift = -94;
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
        const finalTargetIndex = targetIndex;
        const shouldReorder =
          currentDraggedIndex === index &&
          finalTargetIndex !== null &&
          currentDraggedIndex !== finalTargetIndex;

        if (draggedIndexRef.current === index) {
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

            // Commit the actual reorder only once every per-column shift is
            // confirmed back at 0. columnShifts is keyed by array position,
            // not by user id — committing the reorder earlier (while the
            // spring-back animation was still running) meant the array
            // order changed under columns that still had a stale, non-zero
            // shift meant for the *old* order, which is what made columns
            // visually overlap after a drag.
            if (shouldReorder && currentDraggedIndex !== null && finalTargetIndex !== null) {
              const newUsers = [...selectedUsers];
              const [draggedUser] = newUsers.splice(currentDraggedIndex, 1);
              newUsers.splice(finalTargetIndex, 0, draggedUser);
              onUsersReorder(newUsers);
            }
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
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight },
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
            <View style={styles.tableHeader}>
              <View style={styles.lineNumberHeader} />
              {selectedUsers.map((user, index) => {
                const isDragging = draggedIndex === index;
                const isTarget =
                  targetIndex === index && draggedIndex !== null && draggedIndex !== index;
                const dragGesture = createDragGesture(index);

                return (
                  <View key={user.id} style={styles.headerCellWrapper}>
                    {isDragging && draggedIndex === index && (
                      <View
                        style={[
                          styles.playerHeaderCell,
                          styles.placeholderCell,
                          { borderColor: theme.colors.textTertiary },
                        ]}
                      />
                    )}
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
                          { borderBottomColor: user.color },
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
                                columnShifts.current[index] = new Animated.Value(0);
                              }
                              return { transform: [{ translateX: columnShifts.current[index] }] };
                            })(),
                        ]}
                      >
                        <Text style={[styles.playerHeaderText, { color: theme.colors.text }]} numberOfLines={1}>
                          ⠿ {user.name}
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
              ref={rowsScrollRef}
              style={styles.scrollableRows}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {Object.entries(scoreLines).map(([lineId, lineScores], lineIndex) => (
                <View key={lineId} style={styles.tableRow}>
                  <Text style={[styles.lineNumberCell, { color: theme.colors.textTertiary }]}>
                    {lineIndex + 1}
                  </Text>
                  {selectedUsers.map(user => {
                    const inputKey = `${lineId}_${user.id}`;
                    const isFocused =
                      focusedCell !== null &&
                      focusedCell.lineId === lineId &&
                      focusedCell.userId === user.id;
                    const rawValue = lineScores[user.id] ?? '';

                    // Only the single cell actually being edited is a real
                    // TextInput. Every other cell is a plain, non-editable
                    // Text — which never intercepts a scroll gesture, unlike
                    // a centered TextInput whose glyphs sit right under the
                    // finger. This is what keeps the table scroll priority
                    // over per-cell touches.
                    if (isFocused) {
                      return (
                        <TextInput
                          ref={ref => {
                            inputRefs.current[inputKey] = ref;
                          }}
                          key={inputKey}
                          autoFocus
                          style={[
                            styles.scoreInputCell,
                            tabularNums,
                            styles.scoreInputCellFocused,
                            {
                              backgroundColor: theme.colors.primaryBackground,
                              borderColor: theme.colors.primary,
                              color: theme.colors.text,
                              shadowColor: theme.colors.primary,
                            },
                          ]}
                          value={rawValue}
                          onChangeText={value => handleScoreChange(lineId, user.id, value)}
                          onFocus={() => scrollFocusedInputIntoView(inputKey)}
                          onBlur={() => onFocusChange(null)}
                          onSubmitEditing={() => focusNextInput(lineId, user.id)}
                          keyboardType="numeric"
                          placeholder="—"
                          placeholderTextColor={theme.colors.placeholder}
                          returnKeyType="next"
                          textAlignVertical="center"
                        />
                      );
                    }

                    return (
                      <Pressable
                        key={inputKey}
                        style={[
                          styles.scoreInputCell,
                          {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.borderLight,
                          },
                        ]}
                        onPress={() => beginEditing(lineId, user.id)}
                      >
                        <Text
                          style={[
                            styles.scoreCellText,
                            tabularNums,
                            { color: rawValue === '' ? theme.colors.placeholder : theme.colors.text },
                          ]}
                        >
                          {rawValue === '' ? '—' : rawValue}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable style={styles.deleteLineButton} onPress={() => onDeleteLine(lineId)}>
                    <View style={[styles.minusIconContainer, { backgroundColor: theme.colors.error }]}>
                      <View style={[styles.minusIcon, { backgroundColor: theme.colors.background }]} />
                    </View>
                  </Pressable>
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
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  scrollContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
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
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  lineNumberHeader: {
    width: 44,
    alignSelf: 'center',
    textAlign: 'center',
  },
  playerHeaderCell: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingBottom: 6,
  },
  playerHeaderCellDragging: {
    zIndex: 1000,
    elevation: 10,
  },
  dropPlaceholder: {
    width: 80,
    height: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  playerHeaderText: {
    fontSize: 10,
    fontFamily: FONTS.titleExtraBold,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  actionHeader: {
    width: 35,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 50,
  },
  lineNumberCell: {
    width: 40,
    fontSize: 10,
    fontFamily: FONTS.titleBold,
    textAlign: 'center',
  },
  scoreInputCell: {
    width: 80,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: FONTS.titleBold,
    marginHorizontal: 3,
    paddingVertical: 0,
    textAlign: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCellText: {
    fontSize: 16,
    fontFamily: FONTS.titleBold,
    textAlign: 'center',
  },
  scoreInputCellFocused: {
    shadowOffset: { width: 0, height: 0 },
  },
  deleteLineButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: -6,
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
  headerCellWrapper: {
    position: 'relative',
    width: 80,
    marginHorizontal: 3,
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
