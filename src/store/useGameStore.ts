import { create } from "zustand";
import { playSound } from "../game/audio";
import { getChainNames, getChain, getItemDef } from "../game/itemRegistry";
import { worldToGrid } from "../game/gridUtils";
import type {
  BoardItem,
  GameState,
  GridPosition,
} from "../game/types";

/** UUID v4 через crypto.getRandomValues — работает и в insecure context (HTTP по LAN) */
function uuid(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function getDeletedItemIds(): Set<string> {
  try {
    const raw = localStorage.getItem("alchemy_deleted");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

const BOARD_COLS = 8;

function computeBoardRows(): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Строки пропорционально высоте экрана; камера сместит доску к низу
  const rows = Math.round(BOARD_COLS * h / w);
  return Math.max(BOARD_COLS, Math.min(14, rows));
}

const BOARD_ROWS = computeBoardRows();

function isCellOccupied(
  items: BoardItem[],
  pos: GridPosition,
): boolean {
  return items.some(
    (i) => i.position.row === pos.row && i.position.col === pos.col,
  );
}

function getItemAtPosition(
  items: BoardItem[],
  pos: GridPosition,
): BoardItem | undefined {
  return items.find(
    (i) => i.position.row === pos.row && i.position.col === pos.col,
  );
}

/** Собираем пул спавна — первые элементы неудалённых цепочек */
function buildSpawnPool(): string[] {
  const deleted = getDeletedItemIds();
  return getChainNames()
    .map((name) => getChain(name).find((d) => !deleted.has(d.id)))
    .filter((d) => d != null)
    .map((d) => d.id);
}

/** Заполняем все пустые ячейки случайными предметами из пула */
function fillEmptyCells(
  items: BoardItem[],
  rows: number,
  cols: number,
  pool: string[],
): BoardItem[] {
  if (pool.length === 0) return items;
  const newItems = [...items];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pos = { row: r, col: c };
      if (!isCellOccupied(newItems, pos)) {
        newItems.push({
          instanceId: uuid(),
          definitionId: pool[Math.floor(Math.random() * pool.length)],
          position: pos,
        });
      }
    }
  }
  return newItems;
}

export const useGameStore = create<GameState>()((set, get) => ({
  boardRows: BOARD_ROWS,
  boardCols: BOARD_COLS,
  items: [],
  generators: [],
  selectedItemId: null,
  score: 0,
  moves: 0,
  dragItemId: null,
  dragWorldPos: null,
  mergedItemId: null,

  selectItem: (instanceId) => {
    playSound(instanceId ? "select" : "deselect", 0.4);
    set({ selectedItemId: instanceId });
  },

  moveItem: (instanceId, target) => {
    const state = get();
    const item = state.items.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const targetItem = getItemAtPosition(state.items, target);

    if (targetItem) {
      // Попытка мержа
      const sourceDef = getItemDef(item.definitionId);
      const targetDef = getItemDef(targetItem.definitionId);

      if (sourceDef.id === targetDef.id && sourceDef.mergesInto) {
        const mergedDef = getItemDef(sourceDef.mergesInto);
        playSound(mergedDef.mergesInto === null ? "maxMerge" : "merge", 0.5);

        const pool = buildSpawnPool();
        const newId = uuid();
        const afterMerge = [
          ...state.items.filter(
            (i) =>
              i.instanceId !== instanceId &&
              i.instanceId !== targetItem.instanceId,
          ),
          {
            instanceId: newId,
            definitionId: mergedDef.id,
            position: target,
          },
        ];

        set({
          items: fillEmptyCells(afterMerge, state.boardRows, state.boardCols, pool),
          selectedItemId: null,
          score: state.score + mergedDef.scoreValue,
          moves: state.moves + 1,
          mergedItemId: newId,
        });
        return;
      }
      // Целевая ячейка занята несовместимым предметом
      playSound("error", 0.3);
      set({ selectedItemId: null });
      return;
    }

    // Пустая ячейка — перемещение
    playSound("move", 0.4);
    set({
      items: state.items.map((i) =>
        i.instanceId === instanceId ? { ...i, position: target } : i,
      ),
      selectedItemId: null,
      moves: state.moves + 1,
    });
  },

  spawnItem: () => {},

  startDrag: (instanceId) => {
    playSound("select", 0.4);
    set({ dragItemId: instanceId, selectedItemId: instanceId });
  },

  updateDrag: (worldPos) => {
    set({ dragWorldPos: worldPos });
  },

  endDrag: () => {
    const state = get();
    if (!state.dragItemId) return;

    const itemId = state.dragItemId;

    if (state.dragWorldPos) {
      const target = worldToGrid(
        state.dragWorldPos[0],
        state.dragWorldPos[2],
        state.boardRows,
        state.boardCols,
      );

      const item = state.items.find((i) => i.instanceId === itemId);
      if (target && item) {
        const sameCell =
          target.row === item.position.row && target.col === item.position.col;
        if (!sameCell) {
          // Сначала очищаем drag state, потом moveItem
          set({ dragItemId: null, dragWorldPos: null, selectedItemId: null });
          get().moveItem(itemId, target);
          return;
        }
      }
    }

    // Отпустили на том же месте или за пределами — просто снимаем drag
    set({ dragItemId: null, dragWorldPos: null, selectedItemId: null });
  },

  addItem: (definitionId, position) => {
    const state = get();
    if (isCellOccupied(state.items, position)) return;
    set({
      items: [
        ...state.items,
        {
          instanceId: uuid(),
          definitionId,
          position,
        },
      ],
    });
  },

  initBoard: () => {
    const pool = buildSpawnPool();
    const items = fillEmptyCells([], BOARD_ROWS, BOARD_COLS, pool);

    set({
      items,
      generators: [],
      selectedItemId: null,
      score: 0,
      moves: 0,
    });
  },
}));
