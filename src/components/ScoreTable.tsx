import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  /** Height (dp) of the keyboard currently overlapping the screen, 0 if none. */
  keyboardInset?: number;
  onScoreChange: (lineId: string, userId: string, value: string) => void;
  onFocusChange: (cell: FocusedCell) => void;
  onDeleteLine: (lineId: string) => void;
  onUsersReorder: (reorderedUsers: User[]) => void;
}

// Must match the real on-screen width of one column: CELL_WIDTH plus the
// horizontal margins of headerCellWrapper / scoreInputCell. The old
// hard-coded 94 didn't (80 + 2×3 = 86), so drop targets and column shifts
// drifted further off the more you dragged.
const CELL_WIDTH = 80;
const CELL_MARGIN = 3;
const COLUMN_WIDTH = CELL_WIDTH + CELL_MARGIN * 2;
// Hold time before a header becomes draggable. Short enough to feel
// responsive, long enough that a normal horizontal swipe still scrolls.
const DRAG_ACTIVATION_MS = 250;

const SPRING = { useNativeDriver: true, tension: 100, friction: 8 } as const;

const ScoreTable: React.FC<ScoreTableProps> = ({
  selectedUsers,
  scoreLines,
  focusedCell,
  scoreLimit: _scoreLimit,
  keyboardInset = 0,
  onScoreChange,
  onFocusChange,
  onDeleteLine,
  onUsersReorder,
}) => {
  const { theme } = useTheme();
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const rowsScrollRef = useRef<ScrollView>(null);

  // ---- Drag & drop state -------------------------------------------------
  // Everything the gesture callbacks read lives in refs, so the gestures can
  // be created once (per player list) instead of on every render. Recreating
  // them mid-drag made gesture-handler swap handlers under the finger and
  // made onEnd read a stale `targetIndex` from an old closure.
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const targetIndexRef = useRef<number | null>(null);
  const usersRef = useRef(selectedUsers);
  usersRef.current = selectedUsers;
  const onUsersReorderRef = useRef(onUsersReorder);
  onUsersReorderRef.current = onUsersReorder;

  const dragOffset = useRef(new Animated.Value(0)).current;
  const dragOpacity = useRef(new Animated.Value(1)).current;
  const columnShifts = useRef<Animated.Value[]>([]);
  const getShift = (idx: number) => {
    if (!columnShifts.current[idx]) {
      columnShifts.current[idx] = new Animated.Value(0);
    }
    return columnShifts.current[idx];
  };

  const handleScoreChange = (lineId: string, userId: string, value: string) => {
    let cleanedValue = value;
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0')) {
      cleanedValue = cleanedValue.replace(/^0+/, '') || '0';
    }
    onScoreChange(lineId, userId, cleanedValue);
  };

  const beginEditing = (lineId: string, userId: string) => {
    onFocusChange({ lineId, userId });
  };

  // Scrolls the rows list so the focused cell sits near the top of the
  // visible area. Called on focus AND again once the keyboard has opened
  // (keyboardInset changes): the first call happens before the table has
  // shrunk, so on its own it can leave the cell under the keyboard.
  const scrollFocusedInputIntoView = (inputKey: string) => {
    const input = inputRefs.current[inputKey];
    const scrollView = rowsScrollRef.current;
    if (!input || !scrollView) return;

    requestAnimationFrame(() => {
      const scrollNode = findNodeHandle(scrollView);
      if (!scrollNode) return;
      input.measureLayout(
        scrollNode,
        (_x: number, y: number) => {
          scrollView.scrollTo({ y: Math.max(0, y - 60), animated: true });
        },
        () => {
          // Measurement can fail transiently during layout; ignore.
        },
      );
    });
  };

  useEffect(() => {
    if (!focusedCell) return;
    const key = `${focusedCell.lineId}_${focusedCell.userId}`;
    // Let the screen re-layout with the new bottom padding first.
    const t = setTimeout(() => scrollFocusedInputIntoView(key), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardInset, focusedCell?.lineId, focusedCell?.userId]);

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

  const applyColumnShifts = (from: number, to: number) => {
    const count = usersRef.current.length;
    for (let idx = 0; idx < count; idx++) {
      if (idx === from) continue;
      let shift = 0;
      if (from > to && idx >= to && idx < from) shift = COLUMN_WIDTH;
      else if (from < to && idx > from && idx <= to) shift = -COLUMN_WIDTH;
      Animated.spring(getShift(idx), { toValue: shift, ...SPRING }).start();
    }
  };

  const userIdsKey = selectedUsers.map(u => u.id).join('|');

  const dragGestures = useMemo(
    () =>
      selectedUsers.map((_user, index) =>
        // One Pan that only activates after a long press: no race between a
        // separate LongPress and Pan, and a quick horizontal swipe on a
        // header still scrolls the table instead of starting a drag.
        Gesture.Pan()
          .runOnJS(true)
          .activateAfterLongPress(DRAG_ACTIVATION_MS)
          .onStart(() => {
            draggedIndexRef.current = index;
            targetIndexRef.current = index;
            setDraggedIndex(index);
            setTargetIndex(index);
            dragOffset.setValue(0);
            Animated.spring(dragOpacity, { toValue: 0.7, ...SPRING }).start();
          })
          .onUpdate(event => {
            const from = draggedIndexRef.current;
            if (from !== index) return;
            dragOffset.setValue(event.translationX);

            const last = usersRef.current.length - 1;
            const to = Math.max(
              0,
              Math.min(last, from + Math.round(event.translationX / COLUMN_WIDTH)),
            );
            if (to !== targetIndexRef.current) {
              targetIndexRef.current = to;
              setTargetIndex(to);
              applyColumnShifts(from, to);
            }
          })
          // onFinalize runs on success AND on cancellation (e.g. the system
          // stole the touch). Using onEnd only left the header stuck
          // half-transparent whenever the gesture got cancelled.
          .onFinalize(() => {
            const from = draggedIndexRef.current;
            if (from !== index) return;
            const to = targetIndexRef.current;

            draggedIndexRef.current = null;
            targetIndexRef.current = null;

            // Snap the dragged header onto its destination slot, then commit.
            const snapTo = to !== null ? (to - from) * COLUMN_WIDTH : 0;
            Animated.parallel([
              Animated.spring(dragOffset, { toValue: snapTo, ...SPRING }),
              Animated.spring(dragOpacity, { toValue: 1, ...SPRING }),
            ]).start(() => {
              // Reset every shift to 0 *in the same frame* as the reorder,
              // so no column keeps an offset meant for the old order.
              dragOffset.setValue(0);
              columnShifts.current.forEach(v => v?.setValue(0));
              setDraggedIndex(null);
              setTargetIndex(null);
              if (to !== null && to !== from) {
                const newUsers = [...usersRef.current];
                const [moved] = newUsers.splice(from, 1);
                newUsers.splice(to, 0, moved);
                onUsersReorderRef.current(newUsers);
              }
            });
          }),
      ),
    // Gestures only need rebuilding when the player list itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userIdsKey],
  );

  const isDraggingAny = draggedIndex !== null;

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
          // Freeze horizontal scrolling while a column is being dragged.
          scrollEnabled={!isDraggingAny}
          // Needed on *every* nested ScrollView: with the default ('never')
          // the outer one swallowed the first tap on another cell while the
          // keyboard was open (keyboard closed instead of moving focus).
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <View style={styles.lineNumberHeader} />
              {selectedUsers.map((user, index) => {
                const isDragging = draggedIndex === index;
                const isTarget = isDraggingAny && targetIndex === index && !isDragging;
                const gesture = dragGestures[index];

                const headerCell = (
                  <Animated.View
                    style={[
                      styles.playerHeaderCell,
                      { borderBottomColor: user.color },
                      isDragging
                        ? {
                            backgroundColor: theme.colors.surface,
                            transform: [{ translateX: dragOffset }, { scale: 1.05 }],
                            opacity: dragOpacity,
                          }
                        : { transform: [{ translateX: getShift(index) }] },
                    ]}
                  >
                    <Text
                      style={[styles.playerHeaderText, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      ⠿ {user.name}
                    </Text>
                  </Animated.View>
                );

                return (
                  <View
                    key={user.id}
                    // zIndex/elevation on the wrapper (the sibling level), not
                    // the inner view, so the dragged header draws on top of
                    // its neighbours on both platforms.
                    style={[styles.headerCellWrapper, isDragging && styles.headerCellWrapperDragging]}
                  >
                    {isTarget && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.dropPlaceholder,
                          {
                            borderColor: theme.colors.primary,
                            backgroundColor: theme.colors.primaryBackground,
                          },
                        ]}
                      />
                    )}
                    {gesture ? (
                      <GestureDetector gesture={gesture}>{headerCell}</GestureDetector>
                    ) : (
                      headerCell
                    )}
                  </View>
                );
              })}
              <View style={styles.actionHeader} />
            </View>

            {/* Score Lines - Scrollable */}
            <ScrollView
              ref={rowsScrollRef}
              style={styles.scrollableRows}
              contentContainerStyle={styles.rowsContent}
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
                    // Text — which never intercepts a scroll gesture.
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
                          // Keep the keyboard up while jumping to the next
                          // cell instead of closing/reopening it each time.
                          submitBehavior="submit"
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
  },
  rowsContent: {
    paddingBottom: 12,
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
  },
  playerHeaderCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 6,
  },
  dropPlaceholder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: CELL_WIDTH,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 6,
    opacity: 0.8,
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
    width: CELL_WIDTH,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: FONTS.titleBold,
    marginHorizontal: CELL_MARGIN,
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
    width: CELL_WIDTH,
    marginHorizontal: CELL_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCellWrapperDragging: {
    zIndex: 1000,
    elevation: 10,
  },
});
export default ScoreTable;
