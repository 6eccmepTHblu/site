import {defineStore} from "pinia";
import type {Word} from "../types/Word.ts";
import {ref} from "vue";

export const useVocabulary = defineStore('vocabulary', () => {
    const words = ref<Word[]> ([])

    // === Methods for AllWords ===============================================
    const addWord = (word: Word): boolean => {
        if (!checkWordInWordsList(word)) {
            words.value.push(word)
            return true
        }
        return false
    }

    // === Methods for Vocabulary =======================================================
    const checkWordInWordsList = (word: Word): boolean => {
        return words.value.some(w => w.id === word.id)
    }

    return {
        words,
        addWord,
        checkWordInWordsList
    }
})