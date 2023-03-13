class Roulette {
  /**
     * 缓动函数，由快到慢
     * @param {Num} t 当前时间
     * @param {Num} b 初始值
     * @param {Num} c 变化值
     * @param {Num} d 持续时间
     */
  easeOut(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b
    return -c / 2 * ((--t) * (t - 2) - 1) + b
  }

  windowToCanvas(canvas, e) {
    const bbox = canvas.getBoundingClientRect()
    const x = e.changedTouches[0].clientX
    const y = e.changedTouches[0].clientY

    return {
      x: x - bbox.left,
      y: y - bbox.top
    }
  }

  /**
     * 绘制自动换行的文本
     * @param {Obj} context
     * @param {Str} t          文本内容
     * @param {Num} x          坐标
     * @param {Num} y          坐标
     * @param {Num} w          文本限制宽度
     * @param {Num} lineHeight 行高
     */
  drawText(context, t, x, y, w, lineHeight = 20) {
    const chr = t.split('')
    let temp = ''
    const row = []

    for (let a = 0; a < chr.length; a++) {
      if (context.measureText(temp).width >= w) {
        row.push(temp)
        temp = ''
      }
      temp += chr[a]
    }

    row.push(temp)

    for (let b = 0; b < row.length; b++) {
      context.fillText(row[b], x, y + (b + 1) * lineHeight)
    }
  }

  /**
     * 定义圆角矩形的方法
     * @param {Obj} context
     * @param {Num} cornerX
     * @param {Num} cornerY
     * @param {Num} width
     * @param {Num} height
     * @param {Num} cornerRadius
     */
  roundedRect(context, cornerX, cornerY, width, height, cornerRadius) {
    if (width > 0) context.moveTo(cornerX + cornerRadius, cornerY)
    else context.moveTo(cornerX - cornerRadius, cornerY)

    context.arcTo(cornerX + width, cornerY,
      cornerX + width, cornerY + height,
      cornerRadius)

    context.arcTo(cornerX + width, cornerY + height,
      cornerX, cornerY + height,
      cornerRadius)

    context.arcTo(cornerX, cornerY + height,
      cornerX, cornerY,
      cornerRadius)

    if (width > 0) {
      context.arcTo(cornerX, cornerY,
        cornerX + cornerRadius, cornerY,
        cornerRadius)
    } else {
      context.arcTo(cornerX, cornerY,
        cornerX - cornerRadius, cornerY,
        cornerRadius)
    }
  }
}

function drawImage(self, context, _startRadian, image) {
  const size = Math.sin(self.AWARD_RADIAN) * self.outsideRadius / 2.5
  context.save()
  context.translate(
    self.centerX + Math.cos(_startRadian + self.AWARD_RADIAN / 2) * self.TEXT_RADIAS,
    self.centerY + Math.sin(_startRadian + self.AWARD_RADIAN / 2) * self.TEXT_RADIAS
  )
  context.rotate(_startRadian + self.AWARD_RADIAN / 2 + Math.PI / 2)
  context.drawImage(
    image,
    -size / 2, 0,
    size, size
  )
  context.restore()
}

class RouletteWheel extends Roulette {
  constructor(options) {
    super()

    this.centerX = options.centerX
    this.centerY = options.centerY
    this.outsideRadius = options.outsideRadius

    this.evenColor = options.evenColor || '#FF6766'
    this.oddColor = options.oddColor || '#FD5757'
    this.loseColor = options.loseColor || '#F79494'
    this.textColor = options.textColor || 'White'

    this.arrowColorFrom = options.arrowColorFrom || '#FFFC95'
    this.arrowColorTo = options.arrowColorTo || '#FF9D37'
    this.buttonFont = options.buttonFont || '开始抽奖'
    this.buttonFontColor = options.buttonFontColor || '#88411F'
    this.buttonColorFrom = options.buttonColorFrom || '#FDC964'
    this.buttonColorTo = options.buttonColorTo || '#FFCB65'

    this.awards = options.awards

    this.startRadian = options.startRadian || 0
    this.duration = options.duration || 4000
    this.velocity = options.velocity || 10

    this.finish = options.finish

    this.INSIDE_RADIUS = 0
    this.TEXT_RADIAS = this.outsideRadius * 0.8
    this.FONT_STYLE = `bold ${this.outsideRadius * 0.07}px Helvetica, Arial`

    this.ARROW_RADIUS = this.outsideRadius / 3 // 圆盘指针的半径
    this.BUTTON_RADIUS = this.ARROW_RADIUS * 0.8 // 圆盘内部按钮的半径

    this.AWARDS_COUNT = this.awards.length
    this.AWARD_RADIAN = (Math.PI * 2) / this.AWARDS_COUNT

    this._isAnimate = false
    this._spinningTime = 0
    // this._spinTotalTime
    // this._spinningChange

    // this._canvasStyle
  }

  /**
     * 绘制转盘
     * @param {Obj} context
     */
  drawRouletteWheel(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    // ---------- 绘制外表盘
    context.save()
    const rgb = this.oddColor.replace('#', '')
    const r = parseInt(rgb[0] + rgb[1], 16)
    const g = parseInt(rgb[2] + rgb[3], 16)
    const b = parseInt(rgb[4] + rgb[5], 16)

    context.fillStyle = `rgba(${r}, ${g}, ${b}, .72)`
    context.shadowColor = 'rgba(0, 0, 0, .24)'
    context.shadowOffsetX = 0
    context.shadowOffsetY = 5
    context.shadowBlur = 15
    context.arc(this.centerX, this.centerY, this.outsideRadius, 0, Math.PI * 2, false)
    context.fill()
    context.restore()
    // ----------

    // --------- 绘制表盘中的色块，和对应的文字与图片
    for (let i = 0; i < this.AWARDS_COUNT; i++) {
      // 绘制色块
      context.save()

      if (this.awards[i].type === 'losing') context.fillStyle = this.loseColor
      else if (i % 2 === 0) context.fillStyle = this.evenColor
      else context.fillStyle = this.oddColor

      const _startRadian = this.startRadian + this.AWARD_RADIAN * i
      const _endRadian = _startRadian + this.AWARD_RADIAN

      context.beginPath()
      context.arc(this.centerX, this.centerY, this.outsideRadius - 5, _startRadian, _endRadian, false)
      context.arc(this.centerX, this.centerY, this.INSIDE_RADIUS, _endRadian, _startRadian, true)
      context.fill()
      context.restore()

      // 绘制图片
      if (this.awards[i].type === 'image') {
        const self = this
        const image = new Image()
        image.src = this.awards[i].content

        // 如果图片未加载，则加载
        // 如果图片已经加载完成，则直接使用
        if (!image.complete) {
          image.onload = function (e) {
            drawImage(self, context, _startRadian, image)
          }
        } else {
          drawImage(self, context, _startRadian, image)
        }
      } else if (this.awards[i].type === 'text' || this.awards[i].type === 'losing') {
        // 绘制文字
        const award = this.awards[i].content
        context.save()
        context.fillStyle = this.textColor
        context.font = this.FONT_STYLE
        context.translate(
          this.centerX + Math.cos(_startRadian + this.AWARD_RADIAN / 2) * this.TEXT_RADIAS,
          this.centerY + Math.sin(_startRadian + this.AWARD_RADIAN / 2) * this.TEXT_RADIAS
        )
        context.rotate(_startRadian + this.AWARD_RADIAN / 2 + Math.PI / 2)
        context.fillText(award, -context.measureText(award).width / 2, 0)
        context.restore()
      }
    }
    // ----------

    // ---------- 绘制按钮指针
    const moveX = this.centerX
    const moveY = this.centerY - this.ARROW_RADIUS + 5

    context.save()
    context.fillStyle = this.arrowColorFrom
    context.beginPath()
    context.moveTo(moveX, moveY)
    context.lineTo(moveX - 15, moveY)
    context.lineTo(moveX, moveY - 30)
    context.closePath()
    context.fill()
    context.restore()

    context.save()
    context.fillStyle = this.arrowColorTo
    context.beginPath()
    context.moveTo(moveX, moveY)
    context.lineTo(moveX + 15, moveY)
    context.lineTo(moveX, moveY - 30)
    context.closePath()
    context.fill()
    context.restore()
    // ----------

    // ---------- 绘制按钮圆盘
    const gradient1 = context.createLinearGradient(
      this.centerX - this.ARROW_RADIUS, this.centerY - this.ARROW_RADIUS,
      this.centerX - this.ARROW_RADIUS, this.centerY + this.ARROW_RADIUS
    )
    context.save()
    gradient1.addColorStop(0, this.arrowColorFrom)
    gradient1.addColorStop(1, this.arrowColorTo)
    context.fillStyle = gradient1

    context.shadowColor = 'rgba(0, 0, 0, .12)'
    context.shadowOffsetX = 0
    context.shadowOffsetY = 5
    context.shadowBlur = 15

    context.beginPath()
    context.arc(this.centerX, this.centerY, this.ARROW_RADIUS, 0, Math.PI * 2, false)
    context.fill()
    context.restore()
    // ----------

    // ---------- 绘制按钮
    const gradient2 = context.createLinearGradient(
      this.centerX - this.BUTTON_RADIUS, this.centerY - this.BUTTON_RADIUS,
      this.centerX - this.BUTTON_RADIUS, this.centerY + this.BUTTON_RADIUS
    )
    context.save()
    gradient2.addColorStop(0, this.buttonColorFrom)
    gradient2.addColorStop(1, this.buttonColorTo)
    context.fillStyle = gradient2
    context.beginPath()
    context.arc(this.centerX, this.centerY, this.BUTTON_RADIUS, 0, Math.PI * 2, false)
    context.fill()
    context.restore()
    // ----------

    // ---------- 绘制按钮文字
    context.save()
    context.fillStyle = this.buttonFontColor
    context.font = `bold ${this.BUTTON_RADIUS / 2}px helvetica`
    super.drawText(
      context,
      this.buttonFont,
      this.centerX - this.BUTTON_RADIUS / 2, this.centerY - this.BUTTON_RADIUS / 2 - 4,
      this.BUTTON_RADIUS * 0.8,
      this.BUTTON_RADIUS / 2 + 4
    )
    context.restore()
    // ----------
  }

  /**
     * 开始旋转
     * @param {Obj} context
     */
  rotateWheel(context) {
    this._spinningTime += 30

    if (this._spinningTime >= this._spinTotalTime) {
      this._isAnimate = false
      if (this.finish) this.finish(this.getValue())
      return
    }

    const __spinningChange = (this._spinningChange - (super.easeOut(this._spinningTime, 0, this._spinningChange, this._spinTotalTime))) *
                              (Math.PI / 180)
    this.startRadian += __spinningChange

    this.drawRouletteWheel(context)
    window.requestAnimationFrame(this.rotateWheel.bind(this, context))
  }

  /**
     * 获取奖品的值
     */
  getValue() {
    const degrees = this.startRadian * 180 / Math.PI + 90
    const arcd = this.AWARD_RADIAN * 180 / Math.PI
    const index = Math.floor((360 - degrees % 360) / arcd)

    return index
  }

  /**
     * 执行旋转，用于绑定在按钮上
     * @param {Obj} context
     */
  luckyDraw(context) {
    this._isAnimate = true
    this.value = ''
    this._spinningTime = 0
    this._spinTotalTime = Math.random() * 1000 + this.duration
    this._spinningChange = Math.random() * 100 + this.velocity
    this.rotateWheel(context)
  }

  /**
     * 初始化转盘
     * @param {obj} canvas
     * @param {Obj} context
     */
  render(canvas, context) {
    this._canvasStyle = canvas.getAttribute('style')
    this.drawRouletteWheel(context);

    ['touchstart', 'mousedown'].forEach((event) => {
      canvas.addEventListener(event, (e) => {
        if (!this._isAnimate) {
          const loc = super.windowToCanvas(canvas, e)
          context.beginPath()
          context.arc(this.centerX, this.centerY, this.BUTTON_RADIUS, 0, Math.PI * 2, false)
          if (context.isPointInPath(loc.x, loc.y)) {
            this.luckyDraw(context)
          }
        }
      })
    })

    canvas.addEventListener('mousemove', (e) => {
      const loc = super.windowToCanvas(canvas, e)
      context.beginPath()
      context.arc(this.centerX, this.centerY, this.BUTTON_RADIUS, 0, Math.PI * 2, false)
      if (context.isPointInPath(loc.x, loc.y)) {
        canvas.setAttribute('style', `cursor: pointer;${this._canvasStyle}`)
      } else {
        canvas.setAttribute('style', this._canvasStyle)
      }
    })
  }
}

// const canvas = document.getElementById('canvas')
// const context = canvas.getContext('2d')

// new RouletteWheel({
//   centerX: canvas.width / 2,
//   centerY: canvas.height / 2,
//   outsideRadius: 200,
//   awards: [
//     { type: 'text', content: 'iphone8' },
//     { type: 'text', content: '大保健' },
//     { type: 'text', content: '10元话费' },
//     { type: 'image', content: 'https://img12.360buyimg.com/n7/jfs/t4807/209/1436278963/496606/8e486549/58f0884eNcec87657.jpg' },
//     { type: 'losing', content: '未中奖' }
//   ],
//   finish: function (index) {
//     switch (this.awards[index].type) {
//       case 'text':
//         alert('🎉恭喜您中得：' + this.awards[index].content)
//         break
//       case 'image':
//         alert('🎉恭喜您中得：战争磨坊水冷机箱')
//         break
//       case 'losing':
//         alert('💔很遗憾，您没有中奖~')
//         break
//     }
//   }

// }).render(canvas, context)

export default RouletteWheel
