const animationPlayer = {
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  animationInterval: null,
  fps: 10,
  width: 50,
  height: 50,

  init(frames) {
    this.frames = frames;
    this.setupCanvas();
  },

  setupCanvas() {
    const canvas = document.getElementById("animation-canvas");
    const ctx = canvas.getContext("2d");

    // Устанавливаем размер canvas по первому кадру
    if (this.frames.length > 0) {
      const img = new Image();
      img.onload = () => {
        canvas.width = this.width;
        canvas.height = this.height;
        this.showFrame(0);
      };
      img.src = this.frames[0];
    }
  },

  playstop() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  },

  play() {
    if (this.isPlaying || this.frames.length === 0) return;

    this.isPlaying = true;

    this.animationInterval = setInterval(() => {
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.frames.length;
      this.showFrame(this.currentFrameIndex);
    }, 1000 / this.fps);
  },

  stepNext() {
    if (this.isPlaying || this.frames.length === 0) return;

    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    this.showFrame(this.currentFrameIndex);
  },

  stepPrev() {
    if (this.isPlaying || this.frames.length === 0) return;

    this.currentFrameIndex = (this.currentFrameIndex - 1) % this.frames.length;
    if (this.currentFrameIndex < 0) {
      this.currentFrameIndex += this.frames.length;
    }
    this.showFrame(this.currentFrameIndex);
  },

  stop() {
    this.isPlaying = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  },

  showFrame(frameIndex) {
    const canvas = document.getElementById("animation-canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = this.frames[frameIndex];
    this.currentFrameIndex = frameIndex;
  },
};
