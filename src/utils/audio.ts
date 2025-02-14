export function playSuccessSound(volume = 0.5): Promise<void> {
    return new Promise((resolve) => {
        const audio = new Audio('public/success.mp3');
        audio.volume = Math.max(0, Math.min(1, volume));

        audio.onended = () => {
            resolve();
        };

        audio.onerror = () => {
            console.error('Error playing audio');
            resolve();
        };

        audio.play().catch((error) => {
            console.error('Error starting audio playback:', error);
            resolve();
        });
    });
}