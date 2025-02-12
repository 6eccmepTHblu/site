import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Word } from '../types/Word.ts'
import { API_WORDS_URL } from '../config.ts'

export const useAllWords = defineStore('allWord', () => {
  const wordsAll = ref<Word[]>([])

  // Common methods
  function fillListAllWords(data: Word[]): void {
    console.log('Заполнение списка словарных слов')
    wordsAll.value = data
  }

  // Request
  async function fetchWords(): Promise<Word[]> {
    console.log('Получение списка словарных слов')
    const response = await fetch(API_WORDS_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  return {
    wordsAll,
    fetchWords,
    fillListAllWords,
  }
})
