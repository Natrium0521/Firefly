class alert {
    alert_flip = undefined

    constructor() {
        this.alert_flip = new flip()
    }

    _alert(ele, type, title, desc, duration) {
        ele.innerHTML =
            `<div class="icon"><img src="./img/svg/${type}.svg"></div>
            <div class="text"><div class="title">${title}</div><div class="desc">${desc}</div></div>
            <div class="close-btn"><div class="progress"></div><img src="./img/svg/close-small.svg"></div>`
        ele.querySelector('.close-btn').addEventListener('click', (e) => {
            this.alert_flip.refresh()
            alert_layer.removeChild(e.target.closest('.alert-box'))
            this.alert_flip.play(500)
        })
        if (duration > 0) {
            ele.querySelector('.close-btn .progress').style.animationDuration = `${duration}s`
        } else {
            ele.querySelector('.close-btn .progress').style.animationPlayState = 'paused'
        }
        this.alert_flip.append(ele)
        this.alert_flip.refresh()
        this.alert_flip.rects.at(-1).y = document.querySelector('body').getBoundingClientRect().height
        alert_layer.appendChild(ele)
        this.alert_flip.play(500)
        if (duration > 0) {
            setTimeout(() => {
                if (ele.isConnected) ele.querySelector('.close-btn').click()
            }, duration * 1000 + 100);
        }
    }

    info(title, desc, duration = -1) {
        var ele = document.createElement('div')
        ele.classList.add('alert-box')
        this._alert(ele, 'info', title, desc, duration)
    }

    success(title, desc, duration = -1) {
        var ele = document.createElement('div')
        ele.classList.add('alert-box')
        ele.classList.add('alert-success')
        this._alert(ele, 'success', title, desc, duration)
    }

    warning(title, desc, duration = -1) {
        var ele = document.createElement('div')
        ele.classList.add('alert-box')
        ele.classList.add('alert-warning')
        this._alert(ele, 'warning', title, desc, duration)
    }

    error(title, desc, duration = -1) {
        var ele = document.createElement('div')
        ele.classList.add('alert-box')
        ele.classList.add('alert-error')
        this._alert(ele, 'error', title, desc, duration)
    }
}

const Alert = new alert()