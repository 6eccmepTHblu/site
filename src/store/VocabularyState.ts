import { defineStore } from 'pinia'
import type { Word } from '../types/Word.ts'
import { useMutation } from 'vue-query'
import { ref } from 'vue'
import { API_WORDS_URL } from '../config.ts'

export const useVocabulary = defineStore('vocabulary', () => {
  const words = ref<Word[]>([])

  // === БД =======================================================
  // Обновление данных слова в базе данных
  const updateWordInBD = async (word: Word, updateData: Partial<Word>): Promise<Word> => {
    const response = await fetch(`${API_WORDS_URL}/${word.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  // Мутация для обновления данных слова
  const addWordMutation = useMutation(
    async (word: Word) => {
      const updateWord = await updateWordInBD(word, { selected: true, repetition_count: 0 })
      return {
        ...updateWord,
        repetition_count: 0,
        selected: true,
      }
    },
    {
      onSuccess: (mutatedWord) => {
        if (!checkWordInWordsList(mutatedWord)) {
          words.value.push(mutatedWord)
        }
      },
      onError: (error) => {
        console.error('Error updating word:', error)
      },
    }
  )

  // Метод для добавления слова в список Практики
  const addWord = (word: Word): boolean => {
    if (!checkWordInWordsList(word)) {
      addWordMutation.mutate(word)
      return true
    }
    return false
  }

  async function fetchSelectedWords(): Promise<Word[]> {
    const response = await fetch(`${API_WORDS_URL}/selected`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  }

  function fillListSelectedWords(data: Word[]): void {
    words.value = data
  }

  // === Методы =======================================================
  // Проверка наличия слова в списке Практики
  const checkWordInWordsList = (word: Word): boolean => {
    return words.value.some((w) => w.id === word.id)
  }

  return {
    words,
    addWord,
    checkWordInWordsList,
    fetchSelectedWords,
    fillListSelectedWords
  }
})
