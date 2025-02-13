// PracticeSettingsStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
// import { API_BASE_URL } from '../config.ts'

export const usePracticeSettingsStore = defineStore('practiceSettings', () => {
  const maxRepetitions = ref(10)

  // Загрузка настроек при инициализации
  // const loadSettings = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/settings/max_repetitions`)
  //     const data = await response.json()
  //     maxRepetitions.value = parseInt(data.value) || 10
  //   } catch (error) {
  //     console.error('Error loading settings:', error)
  //   }
  // }

  // Сохранение настроек при изменении
  // watch(maxRepetitions, async (newValue: number) => {
  //   try {
  //     await fetch(`${API_BASE_URL}/settings/max_repetitions`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ value: newValue }),
  //     })
  //   } catch (error) {
  //     console.error('Error saving settings:', error)
  //   }
  // })

  // Загружаем настройки при создании store
  // loadSettings()

  return {
    maxRepetitions,
  }
})
