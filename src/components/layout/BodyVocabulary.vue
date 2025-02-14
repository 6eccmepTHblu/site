<script setup lang="ts">
  // === import =================================
  // vue
  import { ref } from 'vue'
  // vue-query
  import { useQuery } from 'vue-query'
  // type
  import type { Word } from '../../types/Word.ts'
  // store
  import { useVocabularyStore } from '../../store/VocabularyState.ts'
  import { useSettingsStore, SettingKey } from '../../store/SettingStore.ts'
  // utils
  import { playSuccessSound } from '../../utils/audio';
  // primevue
  import ProgressSpinner from 'primevue/progressspinner'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import FloatLabel from 'primevue/floatlabel'
  import Card from 'primevue/card'
  import InputNumber, { type InputNumberInputEvent } from 'primevue/inputnumber'
  import ToggleButton from 'primevue/togglebutton'

  // === Store =================================
  const vocabularyStore = useVocabularyStore()
  const settingsStore = useSettingsStore()

  // === Logic =================================
  // Загрузка выбранных слов при монтировании
  const { isLoading } = useQuery<Word[], Error>(
    'wordsPractice',
    vocabularyStore.fetchSelectedWords,
    {
      onSuccess: (data: Word[]) => {
        vocabularyStore.fillListSelectedWords(data)
        if (vocabularyStore.words.length > 0) {
          vocabularyStore.selectRandomWord()
        }
      },
      refetchOnWindowFocus: false
    }
  )

  // Написание слова
  const inputText = ref('')

  // Запуск проверки введённого слова
  const checkInputText = () => {
    const input = inputText.value.trim()
    if (!input) return

    const isCorrect: boolean = checkTranslation(input)

    if (isCorrect) {
      handleCorrectTranslation()
    }
  }

  // Проверка введённого слова, с русскими переводами
  const checkTranslation = (input: string) => {
    if (!vocabularyStore.activeWord) {
      return false
    }
    const inputLower = input.toLowerCase().trim()
    const translationsLower = vocabularyStore.activeWord.translations.map((t) =>
      t.russian.toLowerCase().trim()
    )
    return translationsLower.includes(inputLower)
  }

  // Отработка в верно введённого результата
  const handleCorrectTranslation = async () => {
    if (!vocabularyStore.activeWord) {
      return false
    }
    vocabularyStore.setRightAnswer(true)
    vocabularyStore.setShowTranslation(true)

    // Воспроизводим звук успеха
    if (settingsStore.playAudio) {
      playSuccessSound();
    }

    const newCount = vocabularyStore.activeWord.repetition_count + 1
    await vocabularyStore.updateRepCountWord(vocabularyStore.activeWord, newCount)

    try {
      const shouldRemove = newCount >= settingsStore.maxRepetitions

      setTimeout(async () => {
        // Получаем следующее слово только если слово не будет удалено
        if (shouldRemove) {
          if (!vocabularyStore.activeWord) {
            return false
          }
          await vocabularyStore.deleteWord(vocabularyStore.activeWord)
        }
        inputText.value = ''
        vocabularyStore.selectRandomWord()
      }, 500)
    } catch (error) {
      console.error('Error updating word:', error)
    }
  }

  // Временно показать перевод
  const handleShowTranslation = () => {
    vocabularyStore.setShowTranslation(true)
    vocabularyStore.setShowSuggestion(true)
    setTimeout(async () => {
      vocabularyStore.setShowTranslation(false)
      vocabularyStore.setShowSuggestion(false)
    }, 1000)
  }

  // Обновление настройки числа повторений
  const updateMaxRepetitions = (event: InputNumberInputEvent) => {
    if (typeof event.value === 'number') {
      // Немедленно обновляем локальное значение для отзывчивости UI
      settingsStore.updateLocalSetting(SettingKey.MAX_REPETITIONS, event.value)

      // Запускаем отложенное обновление на сервере
      settingsStore.debouncedUpdateMaxRepetitions(event.value)
    }
  }
  // Обновление настройки воспроизведения звука
  const updatePlayAudio = (value: boolean) => {
    console.log(value)
    settingsStore.updateLocalSetting(SettingKey.PLAY_AUDIO, value)
    settingsStore.setSetting.mutate({ key: SettingKey.PLAY_AUDIO, value: value })
  }
</script>

<template>
  <main class="flex p-4">
    <div class="max-w-4xl mx-auto space-y-4 w-full">
      <!-- === Loading ================================================== -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
      <div v-else class="rounded-lg">
        <!-- === Settings ================================================== -->
        <Card class="shadow-md rounded-lg mb-4">
          <template #title>
            <h3 class="text-xl font-semibold text-gray-800">Настройки</h3>
          </template>
          <template #content>
            <div class="flex items-center space-x-2">
              <ToggleButton
                  v-model="settingsStore.playAudio"
                  onLabel="Со звуком"
                  offLabel="Без звука"
                  @value-change="updatePlayAudio"
              />
            </div>
          </template>
        </Card>

        <!-- === Word info ================================================== -->
        <Card
          v-if="vocabularyStore.activeWord"
          class="shadow-md rounded-lg p-4 mb-4 relative transition-all duration-700 ease-in-out"
          :class="{
            'bg-green-200 shadow-green-300': vocabularyStore.rightAnswer,
            'bg-red-200 shadow-red-300': vocabularyStore.showSuggestion,
          }"
          unstyled
        >
          <template #title>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold text-gray-800" @click="handleShowTranslation">
                  {{ vocabularyStore.activeWord.english }}
                </h2>
              </div>
              <div class="flex items-center space-x-2">
                <span v-if="vocabularyStore.activeWord.transcription" class="text-sm text-gray-500">
                  {{ vocabularyStore.activeWord.transcription }}
                </span>
              </div>
            </div>
          </template>
          <template #content>
            <div class="flex justify-between items-end">
              <p class="text-gray-600">
                {{
                  vocabularyStore.showTranslation
                    ? vocabularyStore.activeWord.translations.map((t) => t.russian).join(', ')
                    : '***'
                }}
              </p>
            </div>
            <span
              id="cont"
              class="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {{ vocabularyStore.activeWord.repetition_count }} из
              {{ settingsStore.maxRepetitions }}
            </span>
          </template>
        </Card>

        <!-- === Input ================================================== -->
        <div class="bg-white rounded-lg shadow p-4 mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-full">
              <FloatLabel variant="on" class="mb-2">
                <InputNumber
                  v-model="settingsStore.maxRepetitions"
                  showButtons
                  buttonLayout="horizontal"
                  @input="updateMaxRepetitions"
                  id="on_input_number_label"
                  fluid
                  :min="1"
                  :max="100"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
                <label for="on_input_number_label">Повторений</label>
              </FloatLabel>
              <FloatLabel variant="on" class="w-full">
                <InputText
                  v-model="inputText"
                  id="on_input_label"
                  class="scheme-light w-full"
                  @input="checkInputText"
                />
                <label for="on_input_label">Введите перевод...</label>
              </FloatLabel>
            </div>
          </div>
        </div>

        <!-- === List words ================================================== -->
        <div class="bg-white rounded-lg shadow p-4">
          <div
            class="flex justify-between items-center"
            :class="{ 'mb-6': vocabularyStore.words.length > 0 }"
          >
            <h3 class="text-xl font-semibold text-gray-800">
              Words of practices <span class="text-xs">({{ vocabularyStore.words.length }})</span>
            </h3>
            <Button
              @click="vocabularyStore.deleteWords()"
              icon="pi pi-eraser"
              unstyled
              class="text-gray-900"
            />
          </div>
          <TransitionGroup name="words" tag="ul" class="container">
            <li
              v-for="word in vocabularyStore.words"
              :key="word.id"
              class="w-full mb-4 rounded-lg shadow-purple-400 hover:shadow-md transition-shadow duration-200"
            >
              <div
                class="p-3 bg-gray-50 rounded-lg shadow hover:shadow-md transition-all duration-300"
              >
                <div class="flex justify-items-start items-center">
                  <h3 class="text-lg font-semibold text-blue-600">{{ word.english }}</h3>
                  <span class="text-xs text-gray-500"> ({{ word.transcription }})</span>
                </div>
                <div class="mt-1 flex justify-between items-center">
                  <span v-if="word.translations.length" class="mt-1 text-sm text-gray-600">{{
                    word.translations.map((t) => t.russian).join('; ')
                  }}</span>

                  <Button
                    @click="vocabularyStore.deleteWord(word)"
                    icon="pi pi-trash tex"
                    unstyled
                    class="mt-2 text-black hover:text-gray-800 hover:scale-120 transform transition-transform"
                  />
                </div>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
  .container {
    position: relative;
    padding: 0;
    list-style-type: none;
  }

  /* 1. объявление transition */
  .words-move,
  .words-enter-active,
  .words-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. объявление enter from и leave to состояний */
  .words-enter-from,
  .words-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
  }

  /* 3. убедитесь, что элементы удалены из потока layout,
чтобы можно было правильно рассчитать анимацию перемещения */
  .words-leave-active {
    position: absolute;
  }
</style>
