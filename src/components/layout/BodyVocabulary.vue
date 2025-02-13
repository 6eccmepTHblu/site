<script setup lang="ts">
  // === import =================================
  // vue-query
  import { useQuery } from 'vue-query'
  // type
  import type { Word } from '../../types/Word.ts'
  // store
  import { useVocabularyStore } from '../../store/VocabularyState.ts'
  import ProgressSpinner from 'primevue/progressspinner'
  // primevue
  import Button from 'primevue/button'

  // === Store =================================
  const vocabulary = useVocabularyStore()

  // === Logic =================================
  // Загрузка выбранных слов при монтировании
  const { isLoading } = useQuery<Word[], Error>('wordsPractice', vocabulary.fetchSelectedWords, {
    onSuccess: (data: Word[]) => {
      vocabulary.fillListSelectedWords(data)
    },
  })
</script>

<template>
  <main class="flex p-4">
    <div class="max-w-4xl mx-auto space-y-4 w-full">
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
      <div v-else class="rounded-lg shadow-md p-2">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Words of practices</h3>
        <TransitionGroup name="words" tag="ul" class="container">
          <li
            v-for="word in vocabulary.words"
            :key="word.id"
            class="w-full mb-4 rounded-lg shadow-purple-400 hover:shadow-md transition-shadow duration-200"
          >
            <div
              class="p-3 bg-gray-50 rounded-lg shadow hover:shadow-md transition-all duration-300"
            >
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-blue-600">{{ word.english }}</h3>
                <span class="text-sm text-gray-500">{{ word.transcription }}</span>
              </div>
              <div class="mt-1 flex justify-between items-center">
                <span v-if="word.translations.length" class="mt-1 text-sm text-gray-600">{{
                  word.translations.map((t) => t.russian).join('; ')
                }}</span>

                <Button
                  @click="vocabulary.deleteWord(word)"
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
