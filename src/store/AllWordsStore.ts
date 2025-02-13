import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Word } from '../types/Word.ts'
import { API_WORDS_URL } from '../config.ts'

export const useAllWordsStore = defineStore('allWord', () => {
  const wordsAll = ref<Word[]>([])

  // Common methods
  function fillListAllWords(data: Word[]): void {
    wordsAll.value = data
  }

  // Request
  async function fetchAllWords(): Promise<Word[]> {
    const response = await fetch(API_WORDS_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  return {
    wordsAll,
    fetchAllWords,
    fillListAllWords,
  }
})
