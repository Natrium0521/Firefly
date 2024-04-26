class flip {
    elements = undefined
    rects = undefined

    constructor() {
        this.elements = new Array()
        this.rects = new Array()
    }

    append(ele) {
        this.elements.push(ele)
        this.rects.push(ele.getBoundingClientRect())
    }

    refresh() {
        this.elements.forEach((e, i) => {
            if (!e.isConnected) return
            this.rects[i] = e.getBoundingClientRect()
        })
    }

    play(duration = 1000, easing = 'ease') {
        var window_rect = document.querySelector('body').getBoundingClientRect()
        this.elements.forEach((ele, i) => {
            if (!ele.isConnected) return
            var new_rect = ele.getBoundingClientRect()
            var inv = {
                y: this.rects[i].y - new_rect.y
            }
            if ((this.rects[i].top < window_rect.bottom && this.rects[i].bottom > window_rect.top) ||
                (new_rect.top < window_rect.bottom && new_rect.bottom > window_rect.top)) {
                const keyframes = [{
                    transform: `translate(0px, ${inv.y}px)`
                }, {
                    transform: `translate(0px, 0px)`
                }]
                ele.animate(keyframes, { duration: duration, easing: easing })
            }
            this.rects[i] = new_rect
        })
    }
}