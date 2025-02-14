// SettingStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useQuery, useMutation } from 'vue-query'
import { API_SETTINGS_URL } from '../config'
import { debounce } from 'lodash-es'

export enum SettingKey {
  MAX_REPETITIONS = 'max_repetitions',
  TRANSLATION_DIRECTION = 'translation_direction',
  CHECK_METHOD = 'check_method',
  PLAY_AUDIO = 'play_audio',
}

interface SettingResponse {
  key: SettingKey
  value: string
}

const fetchSetting = async (key: SettingKey): Promise<SettingResponse> => {
  const response = await fetch(`${API_SETTINGS_URL}/${key}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return await response.json()
}

const updateSetting = async ({
  key,
  value,
}: {
  key: SettingKey
  value: string | number
}): Promise<void> => {
  const response = await fetch(`${API_SETTINGS_URL}/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value: value.toString() }),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // Число повторений
  const maxRepetitions = ref(1)
  // Метод перевода
  const translationDirection = ref('en-ru')
  // Метод проверки
  const checkMethod = ref('writing')
  // Воспроизводить ли аудио подтверждение правильного ответа
  const playAudio = ref('writing')

  // Получение настройки
  const getSetting = (key: SettingKey) => {
    return useQuery<SettingResponse, Error>([key], () => fetchSetting(key), {
      onSuccess: (data: SettingResponse) => {
        updateLocalSetting(key, data.value)
      },
      refetchOnWindowFocus: false
    })
  }

  // Установка настройки
  const setSetting = useMutation(updateSetting, {
    onSuccess: (_, variables) => {
      updateLocalSetting(variables.key, variables.value)
    },
  })

  // Обновление локальной настройки
  const updateLocalSetting = (key: SettingKey, value: string | number) => {
    switch (key) {
      case SettingKey.MAX_REPETITIONS:
        maxRepetitions.value = typeof value === 'string' ? parseInt(value) : value
        break
      case SettingKey.TRANSLATION_DIRECTION:
        translationDirection.value = value.toString()
        break
      case SettingKey.CHECK_METHOD:
        checkMethod.value = value.toString()
        break
    }
  }

  // Загрузка настроек в State
  updateLocalSetting(SettingKey.MAX_REPETITIONS, getSetting(SettingKey.MAX_REPETITIONS))
  updateLocalSetting(SettingKey.TRANSLATION_DIRECTION, getSetting(SettingKey.TRANSLATION_DIRECTION))
  updateLocalSetting(SettingKey.CHECK_METHOD, getSetting(SettingKey.CHECK_METHOD))
  updateLocalSetting(SettingKey.PLAY_AUDIO, getSetting(SettingKey.PLAY_AUDIO))

  // Обработка изменения числа повторений
  const debouncedUpdateMaxRepetitions = debounce((value: number) => {
    setSetting.mutate({ key: SettingKey.MAX_REPETITIONS, value: value })
  }, 3000)

  return {
    maxRepetitions,
    translationDirection,
    checkMethod,
    playAudio,
    getSetting,
    setSetting,
    debouncedUpdateMaxRepetitions,
    updateLocalSetting
  }
})
