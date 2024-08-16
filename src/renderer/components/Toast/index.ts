class Toast {
    private id: number;
    private toastList: Set<ToastItem>;
    private updateCb: (newToastList: ToastItem[]) => void;

    constructor() {
        this.id = 0;
        this.toastList = new Set<ToastItem>();
    }

    public update(cb: (newToastList: ToastItem[]) => void) {
        this.updateCb = cb;
    }

    private addToast(type: ToastItem['type'], title: string, content: string, showtime: number) {
        const toast: ToastItem = {
            id: this.id++,
            type,
            title,
            content,
            showtime,
            close: () => {
                this.toastList.delete(toast);
                this.updateCb([...this.toastList.values()]);
            },
        };
        if (showtime >= 0) {
            setTimeout(() => {
                if (this.toastList.has(toast)) toast.close();
            }, showtime + 100);
        }
        this.toastList.add(toast);
        this.updateCb([...this.toastList.values()]);
    }

    public info(title: string, content: string, showtime = -1) {
        this.addToast('info', title, content, showtime);
    }

    public success(title: string, content: string, showtime = -1) {
        this.addToast('success', title, content, showtime);
    }

    public warning(title: string, content: string, showtime = -1) {
        this.addToast('warning', title, content, showtime);
    }

    public error(title: string, content: string, showtime = -1) {
        this.addToast('error', title, content, showtime);
    }
}

export default new Toast();
