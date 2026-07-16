import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Game, User } from '../types';
import { storageService } from '../services/storageService';

/**
 * Score lines, kept as raw strings while the game is in progress.
 * '' (empty string) means "not entered yet" — this replaces the previous
 * `number | null` union that was secretly holding strings during typing
 * (via an `as any` cast), which was untyped and error-prone.
 */
export type ScoreLines = Record<string, Record<string, string>>;

export interface GameSessionState {
  selectedUsers: User[];
  gameTitle: string;
  gameGoal: 'highest' | 'lowest';
  scoreLimit: number | null;
  scoreLines: ScoreLines;
  nextLineId: number;
  currentGameId: string | null;
  limitReachedUsers: Record<string, true>;
  editingGameSetup: boolean;
}

const EMPTY_CELL = '';

function createInitialState(): GameSessionState {
  return {
    selectedUsers: [],
    gameTitle: '',
    gameGoal: 'highest',
    scoreLimit: null,
    scoreLines: {},
    nextLineId: 1,
    currentGameId: null,
    limitReachedUsers: {},
    editingGameSetup: false,
  };
}

function emptyLineFor(users: User[]): Record<string, string> {
  const line: Record<string, string> = {};
  users.forEach(u => {
    line[u.id] = EMPTY_CELL;
  });
  return line;
}

function lineIsComplete(
  line: Record<string, string>,
  users: User[],
): boolean {
  return users.every(u => (line[u.id] ?? '') !== '');
}

function parseCell(value: string | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

export function computeTotals(
  scoreLines: ScoreLines,
  users: User[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  users.forEach(u => {
    totals[u.id] = Object.values(scoreLines).reduce(
      (sum, line) => sum + parseCell(line[u.id]),
      0,
    );
  });
  return totals;
}

type Action =
  | { type: 'TOGGLE_USER'; user: User }
  | { type: 'REORDER_USERS'; users: User[] }
  | { type: 'SET_GAME_TITLE'; title: string }
  | { type: 'SET_GAME_GOAL'; goal: 'highest' | 'lowest' }
  | { type: 'SET_SCORE_LIMIT'; limit: number | null }
  | { type: 'START_GAME' }
  | { type: 'START_EDIT_SETUP' }
  | { type: 'CONFIRM_EDIT_SETUP' }
  | { type: 'UPDATE_SCORE'; lineId: string; userId: string; value: string }
  | { type: 'DELETE_LINE'; lineId: string }
  | { type: 'RESET_SCORES' }
  | { type: 'MARK_LIMIT_REACHED'; userId: string }
  | { type: 'LOAD_SAVED_GAME'; game: Game }
  | { type: 'SET_CURRENT_GAME_ID'; id: string };

function reducer(
  state: GameSessionState,
  action: Action,
): GameSessionState {
  switch (action.type) {
    case 'TOGGLE_USER': {
      const isSelected = state.selectedUsers.some(
        u => u.id === action.user.id,
      );
      return {
        ...state,
        selectedUsers: isSelected
          ? state.selectedUsers.filter(u => u.id !== action.user.id)
          : [...state.selectedUsers, action.user],
      };
    }

    case 'REORDER_USERS':
      return { ...state, selectedUsers: action.users };

    case 'SET_GAME_TITLE':
      return { ...state, gameTitle: action.title };

    case 'SET_GAME_GOAL':
      return { ...state, gameGoal: action.goal };

    case 'SET_SCORE_LIMIT':
      return { ...state, scoreLimit: action.limit };

    case 'START_GAME': {
      const lineId = `line_${state.nextLineId}`;
      return {
        ...state,
        scoreLines: { [lineId]: emptyLineFor(state.selectedUsers) },
        nextLineId: state.nextLineId + 1,
        limitReachedUsers: {},
        editingGameSetup: false,
      };
    }

    case 'START_EDIT_SETUP':
      return { ...state, editingGameSetup: true };

    case 'CONFIRM_EDIT_SETUP': {
      const syncedLines: ScoreLines = {};
      for (const [lineId, line] of Object.entries(state.scoreLines)) {
        const newLine: Record<string, string> = {};
        state.selectedUsers.forEach(user => {
          newLine[user.id] = line[user.id] ?? EMPTY_CELL;
        });
        syncedLines[lineId] = newLine;
      }

      const allowedIds = new Set(state.selectedUsers.map(u => u.id));
      const limitReachedUsers: Record<string, true> = {};
      Object.keys(state.limitReachedUsers).forEach(id => {
        if (allowedIds.has(id)) {
          limitReachedUsers[id] = true;
        }
      });

      return {
        ...state,
        scoreLines: syncedLines,
        limitReachedUsers,
        editingGameSetup: false,
      };
    }

    case 'UPDATE_SCORE': {
      const { lineId, userId, value } = action;
      const line = state.scoreLines[lineId] ?? {};
      const updatedLine = { ...line, [userId]: value };
      const scoreLines: ScoreLines = {
        ...state.scoreLines,
        [lineId]: updatedLine,
      };

      // Auto-append a fresh empty line once every player has filled the
      // current last line, so the table always has room to keep scoring.
      if (lineIsComplete(updatedLine, state.selectedUsers)) {
        const hasEmptyLine = Object.values(scoreLines).some(
          l => !lineIsComplete(l, state.selectedUsers),
        );
        if (!hasEmptyLine) {
          const newLineId = `line_${state.nextLineId}`;
          scoreLines[newLineId] = emptyLineFor(state.selectedUsers);
          return { ...state, scoreLines, nextLineId: state.nextLineId + 1 };
        }
      }

      return { ...state, scoreLines };
    }

    case 'DELETE_LINE': {
      const scoreLines = { ...state.scoreLines };
      delete scoreLines[action.lineId];
      return { ...state, scoreLines };
    }

    case 'RESET_SCORES': {
      const lineId = `line_${state.nextLineId}`;
      return {
        ...state,
        scoreLines: { [lineId]: emptyLineFor(state.selectedUsers) },
        nextLineId: state.nextLineId + 1,
        limitReachedUsers: {},
      };
    }

    case 'MARK_LIMIT_REACHED':
      return {
        ...state,
        limitReachedUsers: { ...state.limitReachedUsers, [action.userId]: true },
      };

    case 'SET_CURRENT_GAME_ID':
      return { ...state, currentGameId: action.id };

    case 'LOAD_SAVED_GAME': {
      const { game } = action;
      let scoreLines: ScoreLines = {};
      let nextLineId = 1;

      if (game.scoreLines && Object.keys(game.scoreLines).length > 0) {
        Object.entries(game.scoreLines).forEach(([lineId, line]) => {
          const stringLine: Record<string, string> = {};
          Object.entries(line).forEach(([userId, value]) => {
            stringLine[userId] =
              value === null || value === undefined ? EMPTY_CELL : String(value);
          });
          scoreLines[lineId] = stringLine;
        });

        const lineNumberRegex = /line_(\d+)/;
        const maxLineNumber = Math.max(
          0,
          ...Object.keys(scoreLines).map(id => {
            const match = lineNumberRegex.exec(id);
            return match ? parseInt(match[1], 10) : 0;
          }),
        );
        nextLineId = maxLineNumber + 1;
      } else {
        const line: Record<string, string> = {};
        game.players.forEach(player => {
          line[player.id] = String(game.scores[player.id] ?? 0);
        });
        scoreLines = { line_1: line };
        nextLineId = 2;
      }

      return {
        ...state,
        selectedUsers: game.players,
        gameTitle: game.name,
        gameGoal: game.gameGoal || 'highest',
        scoreLimit: game.scoreLimit ?? null,
        scoreLines,
        nextLineId,
        currentGameId: game.id,
        limitReachedUsers: {},
        editingGameSetup: false,
      };
    }

    default:
      return state;
  }
}

/**
 * Centralizes all the state for an in-progress game.
 *
 * This replaces ~11 separate useState calls that used to live in
 * GameScreen. The previous implementation recomputed totals and checked
 * the score limit by reading `scoreLines` from an outer closure inside
 * setTimeout callbacks — since that closure was captured at the last
 * render and setTimeout runs later, it could read stale (pre-update)
 * values, especially the value the user had just typed. Routing every
 * mutation through a single reducer and deriving totals with useMemo from
 * the reducer's own (always current) state removes that whole class of
 * bug.
 */
export function useGameSession(savedGame?: Game) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedSavedGameRef = useRef(false);

  useEffect(() => {
    if (savedGame && !hasLoadedSavedGameRef.current) {
      hasLoadedSavedGameRef.current = true;
      dispatch({ type: 'LOAD_SAVED_GAME', game: savedGame });
    }
  }, [savedGame]);

  const totals = useMemo(
    () => computeTotals(state.scoreLines, state.selectedUsers),
    [state.scoreLines, state.selectedUsers],
  );

  const rankedPlayers = useMemo(() => {
    return state.selectedUsers
      .map(user => ({ ...user, score: totals[user.id] || 0 }))
      .sort((a, b) =>
        state.gameGoal === 'highest' ? b.score - a.score : a.score - b.score,
      );
  }, [state.selectedUsers, totals, state.gameGoal]);

  const buildGameRecord = useCallback((): Game => {
    const persistedScoreLines: NonNullable<Game['scoreLines']> = {};
    Object.entries(state.scoreLines).forEach(([lineId, line]) => {
      const persistedLine: Record<string, number | null> = {};
      Object.entries(line).forEach(([userId, raw]) => {
        persistedLine[userId] = raw === '' ? null : parseCell(raw);
      });
      persistedScoreLines[lineId] = persistedLine;
    });

    return {
      id: state.currentGameId || Date.now().toString(),
      name:
        state.gameTitle.trim() || `Partie ${new Date().toLocaleDateString()}`,
      players: state.selectedUsers,
      scores: totals,
      scoreLines: persistedScoreLines,
      gameGoal: state.gameGoal,
      scoreLimit: state.scoreLimit,
      createdAt: new Date(),
    };
  }, [state, totals]);

  const persistGame = useCallback(async (): Promise<Game> => {
    const game = buildGameRecord();
    if (state.currentGameId) {
      await storageService.updateGame(game);
    } else {
      await storageService.saveGame(game);
      dispatch({ type: 'SET_CURRENT_GAME_ID', id: game.id });
    }
    return game;
  }, [buildGameRecord, state.currentGameId]);

  // Debounced auto-save whenever the session has meaningful content.
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const hasContent =
      Object.keys(state.scoreLines).length > 0 || state.selectedUsers.length > 0;
    if (!hasContent) return undefined;
    if (!state.gameTitle.trim() && !state.currentGameId) return undefined;

    autoSaveTimeoutRef.current = setTimeout(() => {
      persistGame().catch(error => {
        console.error('Error auto-saving game:', error);
      });
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    state.scoreLines,
    state.selectedUsers,
    state.gameTitle,
    state.currentGameId,
    persistGame,
  ]);

  /**
   * Checks whether a player just crossed the score limit. Reads `totals`,
   * which is always derived from the latest committed state (see useMemo
   * above), so — unlike the old implementation — this is safe to call
   * synchronously from an onBlur handler with no setTimeout delay needed.
   */
  const checkScoreLimit = useCallback(
    (
      userId: string,
      onLimitReached: (user: User, limit: number, total: number) => void,
    ) => {
      if (state.scoreLimit === null) return;
      if (state.limitReachedUsers[userId]) return;
      const user = state.selectedUsers.find(u => u.id === userId);
      if (!user) return;
      const total = totals[userId] ?? 0;
      if (total >= state.scoreLimit) {
        onLimitReached(user, state.scoreLimit, total);
      }
    },
    [state.scoreLimit, state.limitReachedUsers, state.selectedUsers, totals],
  );

  return {
    state,
    dispatch,
    totals,
    rankedPlayers,
    buildGameRecord,
    persistGame,
    checkScoreLimit,
  };
}
