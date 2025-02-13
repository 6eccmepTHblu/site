// PracticeSettingsStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
// import { API_BASE_URL } from '../config.ts'

export const usePracticeSettingsStore = defineStore('practiceSettings', () => {
  const maxRepetitions = ref(10)

  return {
    maxRepetitions,
  }
})
