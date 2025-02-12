import {defineStore} from "pinia";
import {ref} from "vue";
import type {Word} from "../types/Word.ts";

export const useAllWords = defineStore('allWord', () => {
    const wordsAll = ref<Word[]>([
        {
            id: 1,
            english: "hello",
            transcription: "həˈləʊ",
            created_at: "2023-05-15T10:30:00Z",
            selected: false,
            repetition_count: 5,
            translations: [
                { id: 1, russian: "привет", word_id: 1 },
                { id: 2, russian: "здравствуйте", word_id: 1 }
            ],
            description: "A common greeting",
            audio_name: "hello.mp3",
            api_status: 200,
            remember: true
        },
        {
            id: 2,
            english: "world",
            transcription: "wɜːld",
            created_at: "2023-05-16T14:45:00Z",
            selected: true,
            repetition_count: 3,
            translations: [
                { id: 3, russian: "мир", word_id: 2 },
                { id: 4, russian: "свет", word_id: 2 }
            ],
            description: "The earth, together with all of its countries and peoples",
            audio_name: null,
            api_status: null,
            remember: true
        },
        {
            id: 3,
            english: "programming",
            transcription: "ˈprəʊɡræmɪŋ",
            created_at: "2023-05-17T09:15:00Z",
            selected: false,
            repetition_count: 1,
            translations: [
                { id: 5, russian: "программирование", word_id: 3 }
            ],
            description: "The process of writing computer programs",
            audio_name: "programming.mp3",
            api_status: 200,
            remember: false
        }
    ]);

    return {
        wordsAll
    }
})