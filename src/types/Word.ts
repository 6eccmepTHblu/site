export interface Translation{
    id: number;
    russian: string;
    word_id: number;
}

export interface Word{
    id: number;
    english: string;
    transcription: string | null;
    created_at: string;
    selected: boolean;
    repetition_count: number;
    translations: Translation[];
    description: string | null;
    audio_name: string | null;
    api_status: number | null;
    remember: boolean;
}