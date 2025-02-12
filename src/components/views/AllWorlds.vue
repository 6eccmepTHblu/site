<script setup lang="ts">
  // === import =================================
  // vue-query
  import { useQuery } from 'vue-query'
  // type
  import type { Word } from '../../types/Word.ts'
  // store
  import { useAllWords } from '../../store/AllWordsStore.ts'
  import { useVocabulary } from '../../store/VocabularyState.ts'
  // primevue
  import Drawer from 'primevue/drawer'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner';

  // === Store =================================
  const allWords = useAllWords()
  const vocabulary = useVocabulary()

  // === Drawer =================================
  const visible = defineModel<boolean>('visible')

  // === Logic =================================
  //  Add words in list AllWords
  const { isLoading } = useQuery<Word[], Error>(
    'allWords',
    allWords.fetchAllWords,
    {
      onSuccess: (fetchedData: Word[]) => {
        allWords.fillListAllWords(fetchedData)
      },
      enabled: visible,
    }
  )

  // Button add word in list practices
  const addWord = (word: Word) => {
    vocabulary.addWord(word)
  }
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :show-close-icon="false">
    <!-- Header -->
    <template #header>
      <div class="flex justify-center items-center w-full">
        <span class="text-2xl">All word</span>
      </div>
    </template>

    <!-- === List item for all words ================================================== -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ProgressSpinner />
    </div>
    <TransitionGroup v-else name="allWords" tag="ul">
      <li
        v-for="word in allWords.wordsAll"
        :key="word.id"
        class="mb-4 p-3 bg-slate-700 rounded-lg shadow-purple-400 hover:shadow-md transition-shadow duration-200"
      >
        <!-- === Inform for word ================================== -->
        <!-- Line 1 -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-purple-200">{{ word.english }}</h3>
          <span class="text-sm text-gray-300">{{ word.transcription }}</span>
        </div>

        <!-- Line 2 -->
        <div
          v-if="word.transcription && word.transcription.length"
          class="mt-1 items-center justify-between"
        >
          <span class="text-sm text-gray-300">
            {{ word.translations.map((translation) => translation.russian).join('; ') }}
          </span>
        </div>

        <!-- Line 1 -->
        <div class="flex items-center justify-between mt-2">
          <div>
            <span
              v-if="word.remember"
              class="text-xs bg-yellow-600 text-yellow-100 rounded-full px-2 py-1"
              >Remember</span
            >
          </div>
          <Button
            @click="addWord(word)"
            v-if="!vocabulary.checkWordInWordsList(word)"
            unstyled
            icon="pi pi-plus-circle"
            severity=""
            class="text-green-400 hover:text-green-600 hover:scale-120 transform transition-transform"
          />
        </div>
      </li>
    </TransitionGroup>
  </Drawer>
</template>

<style scoped></style>
