<script setup lang="ts">
  // === import =================================
  // vue-query
  import { useQuery } from 'vue-query'
  // type
  import type { Word } from '../../types/Word.ts'
  // store
  import { useVocabulary } from '../../store/VocabularyState.ts'
  import ProgressSpinner from "primevue/progressspinner";

  // === Store =================================
  const vocabulary = useVocabulary()

  // === Logic =================================
  const {isLoading} = useQuery<Word[], Error>(
      'wordsPractice',
      vocabulary.fetchSelectedWords,
      {
        onSuccess: (data: Word[]) => {
          vocabulary.fillListSelectedWords(data)
        }
      }
  )
</script>

<template>
  <main class="flex p-4">
    <div class="max-w-4xl mx-auto space-y-4">
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
      <TransitionGroup v-else name="words" tag="ul">
        <li
          v-for="word in vocabulary.words"
          :key="word.id"
          class="mb-4 p-3 bg-slate-700 rounded-lg shadow-purple-400 hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex justify-center items-center">
            <span class="text-sm text-gray-300">{{ word.english }}</span>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </main>
</template>
<style scoped></style>
