interface ToastItem {
    id: number;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    content: string;
    showtime: number;
    close: () => void;
}
