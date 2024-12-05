import { create } from 'zustand';
import { GameState, Player, Question, BuzzResponse } from '../types/game';

interface GameStore extends GameState {
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCurrentQuestion: (question: Question) => void;
  addBuzzResponse: (response: BuzzResponse) => void;
  clearBuzzResponses: () => void;
  setGameStarted: (started: boolean) => void;
  setCurrentAnswerer: (playerId: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  players: [],
  currentQuestion: null,
  buzzResponses: [],
  gameStarted: false,
  currentAnswerer: null,

  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  setCurrentQuestion: (question) =>
    set(() => ({ currentQuestion: question })),

  addBuzzResponse: (response) =>
    set((state) => ({
      buzzResponses: [...state.buzzResponses, response].sort(
        (a, b) => a.timestamp - b.timestamp
      ),
    })),

  clearBuzzResponses: () =>
    set(() => ({ buzzResponses: [], currentAnswerer: null })),

  setGameStarted: (started) =>
    set(() => ({ gameStarted: started })),

  setCurrentAnswerer: (playerId) =>
    set(() => ({ currentAnswerer: playerId })),
}));