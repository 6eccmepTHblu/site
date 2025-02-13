import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMutation } from 'vue-query'
import type { Word } from '../types/Word.ts'
import { API_WORDS_URL } from '../config.ts'
import { useVocabularyStore } from './VocabularyState.ts'

export const useAllWordsStore = defineStore('allWord', () => {
  const wordsAll = ref<Word[]>([])
  const vocabularyStore = useVocabularyStore()

  // === Методы =======================================================
  // Добавляем все слова в список
  function fillListAllWords(data: Word[]): void {
    wordsAll.value = data
  }

  // === БД =======================================================
  // Получаем все слова из БД
  async function fetchAllWords(): Promise<Word[]> {
    const response = await fetch(API_WORDS_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  // Отмечаем слова из списка в БД как выбранные
  const selectWordsMutation = useMutation(
    async (wordsToSelect: Partial<Word>[]) => {
      const response = await fetch(`${API_WORDS_URL}/select-words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordsToSelect),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json()
    },
    {
      onSuccess: (selectedWords: Word[]) => {
        selectedWords.forEach((word) => {
          vocabularyStore.addWordInListWords(word)
        })
      },
      onError: (error) => {
        console.error('Error selecting words:', error)
      },
    }
  )

  const selectWords = (wordsToSelect: Word[]) => {
    const updatedWords = wordsToSelect.map(word => ({
      id: word.id,
      selected: true,
      repetition_count: 0
    }))
    selectWordsMutation.mutate(updatedWords)
  }

  return {
    wordsAll,
    fetchAllWords,
    fillListAllWords,
    selectWords
  }
})
