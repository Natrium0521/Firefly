class flip {
    element = undefined
    rect = undefined

    constructor() {
        this.element = new Array()
        this.rect = new Array()
    }

    append(ele) {
        this.element.push(ele)
        this.rect.push(ele.getBoundingClientRect())
    }

    refresh() {
        this.element.forEach((e, i) => {
            this.rect[i] = e.getBoundingClientRect()
        })
    }

    play(duration = 1000, easing = 'ease') {
        var window_rect = document.querySelector('body').getBoundingClientRect()
        this.element.forEach((ele, i) => {
            var new_rect = ele.getBoundingClientRect()
            var inv = {
                y: this.rect[i].y - new_rect.y
            }
            if ((this.rect[i].top < window_rect.bottom && this.rect[i].bottom > window_rect.top) ||
                (new_rect.top < window_rect.bottom && new_rect.bottom > window_rect.top)) {
                const keyframes = [{
                    transform: `translate(0px, ${inv.y}px)`
                }, {
                    transform: `translate(0px, 0px)`
                }]
                ele.animate(keyframes, { duration: duration, easing: easing })
            }
            this.rect[i] = new_rect
        })
    }
}