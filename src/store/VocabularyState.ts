import { defineStore } from 'pinia'
import type { Word } from '../types/Word.ts'
import { useMutation } from 'vue-query'
import { ref } from 'vue'
import { API_WORDS_URL } from '../config.ts'

export const useVocabularyStore = defineStore('vocabulary', () => {
  // Список слов для практики
  const words = ref<Word[]>([])
  // Активное слово для практики
  const activeWord = ref<Word | null>(null)
  // Нужно ли показывать перевод
  const rightAnswer = ref(false)

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

  // Метод/Мутация для добавления слова в лист практики
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
        addWordInListWords(mutatedWord)
      },
      onError: (error) => {
        console.error('Error updating word:', error)
      },
    }
  )
  const addWord = (word: Word): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!checkWordInWordsList(word)) {
        addWordMutation.mutate(word, {
          onSuccess: () => resolve(),
          onError: (error: unknown) => reject(error),
        })
      }
    })
  }

  // Метод/Мутация для добавления числа повторений слова
  const updateRepCountWordMutation = useMutation(
    async ({ word, count }: { word: Word; count: number }) => {
      const findWord: Word = words.value.find((w) => w.id === word.id)!
      return await updateWordInBD(findWord, { repetition_count: count })
    },
    {
      onSuccess: (updatedWord) => {
        // Обновляем слово в локальном состоянии
        const index = words.value.findIndex((w) => w.id === updatedWord.id)
        if (index !== -1) {
          words.value[index] = updatedWord
        }
      },
    }
  )
  const updateRepCountWord = (word: Word, count: number): Promise<void> => {
    if (checkWordInWordsList(word)) {
      return new Promise((resolve, reject) => {
        updateRepCountWordMutation.mutate(
          { word, count },
          {
            onSuccess: () => resolve(),
            onError: (error: unknown) => reject(error),
          }
        )
      })
    } else {
      return Promise.reject(new Error('Word not found'))
    }
  }

  // Метод/Мутация для удаления слова из списка практики
  const deleteWordMutation = useMutation(
    async (word: Word) => {
      const updateWord = await updateWordInBD(word, { selected: false })
      return {
        ...updateWord,
        selected: false,
      }
    },
    {
      onSuccess: (mutatedWord) => {
        words.value = words.value.filter((w) => w.id !== mutatedWord.id)
      },
      onError: (error) => {
        console.error('Error deleting word:', error)
      },
    }
  )
  const deleteWord = (word: Word): Promise<void> => {
    return new Promise((resolve, reject) => {
      deleteWordMutation.mutate(word, {
        onSuccess: () => resolve(),
        onError: (error: unknown) => reject(error),
      })
    })
  }

  // Получение списка выбранных слов из базы данных
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

  // Удаление слов из списка Практики
  const deleteWordsMutation = useMutation(
    async () => {
      const response = await fetch(`${API_WORDS_URL}/clear-selected`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json()
    },
    {
      onSuccess: () => {
        words.value = []
      },
      onError: (error) => {
        console.error('Error clearing words:', error)
      },
    }
  )

  const deleteWords = () => {
    deleteWordsMutation.mutate()
  }

  // === Методы =======================================================
  // Проверка наличия слова в списке Практики
  const checkWordInWordsList = (word: Word): boolean => {
    return words.value.some((w) => w.id === word.id)
  }

  // Добавление слова в список Практики
  const addWordInListWords = (word: Word) => {
    if (!checkWordInWordsList(word)) {
      words.value.push(word)
    }
  }

  // Выбирает случайное слово из списка
  const selectRandomWord = () => {
    if (words.value.length > 0) {
      rightAnswer.value = false
      const randomIndex = Math.floor(Math.random() * words.value.length)
      activeWord.value = words.value[randomIndex]
    } else {
      activeWord.value = null
    }
  }

  // Изменяем видимость перевода
  const setRightAnswer = (value: boolean) => {
    rightAnswer.value = value
  }

  return {
    words,
    activeWord,
    rightAnswer,
    addWord,
    addWordInListWords,
    checkWordInWordsList,
    fetchSelectedWords,
    fillListSelectedWords,
    deleteWord,
    deleteWords,
    selectRandomWord,
    updateRepCountWord,
    setRightAnswer,
  }
})
