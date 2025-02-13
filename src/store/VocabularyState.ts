import { defineStore } from 'pinia'
import type { Word } from '../types/Word.ts'
import { useMutation } from 'vue-query'
import { ref, watch, computed } from 'vue'
import { API_WORDS_URL } from '../config.ts'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const words = ref<Word[]>([])
  const activeWord = ref<Word | null>(null)

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
  const addWord = (word: Word): boolean => {
    if (!checkWordInWordsList(word)) {
      addWordMutation.mutate(word)
      return true
    }
    return false
  }

  // Метод/Мутация для добавления числа повторений слова
  const updateRepCountWordMutation = useMutation(
    async ({ word, count }: { word: Word; count: number }) => {
      const findWord: Word = words.value.find((w) => w.id === word.id)!
      console.log(
        'updateRepCountWordMutation ' +
          findWord.english +
          ' | ' +
          findWord.repetition_count +
          ' - ' +
          count
      )
      const updateWord = await updateWordInBD(findWord, { repetition_count: count })
      console.log(
        'updateWord ' + updateWord.english + ' | ' + updateWord.repetition_count + ' - ' + count
      )
      return updateWord
    },
    {
      onSuccess: (updatedWord) => {
        // Обновляем слово в локальном состоянии
        const index = words.value.findIndex((w) => w.id === updatedWord.id)
        if (index !== -1) {
          words.value[index] = updatedWord
        }
        if (activeWord.value && activeWord.value.id === updatedWord.id) {
          activeWord.value = updatedWord
        }
        // Выбираем новое случайное слово после успешного обновления
        selectRandomWord()
      },
    }
  )
  const updateRepCountWord = (word: Word, count: number): void => {
    if (checkWordInWordsList(word)) {
      console.log(
        'updateRepCountWord ' + word.english + ' | ' + word.repetition_count + ' - ' + count
      )
      updateRepCountWordMutation.mutate({ word, count })
    } else {
      console.log('updateRepCountWord - word not found')
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
  const deleteWord = (word: Word) => {
    console.log('deleteWord ' + word.english + ' | ' + word.repetition_count)
    deleteWordMutation.mutate(word)
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
    console.log('selectRandomWord')
    if (words.value.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.value.length)
      console.log(
        'selectRandomWord ' +
          words.value[randomIndex].english +
          '| ' +
          words.value[randomIndex].repetition_count
      )
      activeWord.value = words.value[randomIndex]
    } else {
      console.log('selectRandomWord ' + null)
      activeWord.value = null
    }
  }

  // Вычисляемое свойство для длины массива words
  const wordsCount = computed(() => words.value.length)

  // === Наблюдатели =======================================================
  // Наблюдатель за изменениями в списке слов
  watch(wordsCount, () => {
    console.log('wordsCount changed')
    selectRandomWord()
  })

  return {
    words,
    activeWord,
    addWord,
    addWordInListWords,
    checkWordInWordsList,
    fetchSelectedWords,
    fillListSelectedWords,
    deleteWord,
    deleteWords,
    selectRandomWord,
    updateRepCountWord,
  }
})
