const animationExporter = {
  fps: 10,
  width: 50,
  height: 50,

  async exportGIF() {
    if (animationPlayer.frames.length === 0) {
      alert("Нет кадров для экспорта");
      return;
    }

    alert("Начинаем создание GIF... Это может занять несколько секунд");

    try {
      const delay = Math.round(1000 / this.fps);

      // Оборачиваем в Promise для корректной обработки
      await this.createGIFWithFrames(delay);
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла");
    }
  },

  async createGIFWithFrames(delay) {
    return new Promise((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.width,
        height: this.height,
      });

      // Добавляем кадры
      let framesAdded = 0;
      const totalFrames = animationPlayer.frames.filter(
        (frame) => frame
      ).length;

      const addNextFrame = async () => {
        if (framesAdded >= totalFrames) {
          gif.render();
          return;
        }

        if (animationPlayer.frames[framesAdded]) {
          await this.addFrameToGIF(
            gif,
            animationPlayer.frames[framesAdded],
            this.width,
            this.height,
            delay
          );
          framesAdded++;
          addNextFrame();
        }
      };

      // Обработчики событий
      gif.on("finished", (blob) => {
        this.downloadGIF(blob);
        alert("GIF успешно создан и сохранен!");
        resolve();
      });

      gif.on("abort", () => {
        reject(new Error("GIF creation aborted"));
      });

      // Начинаем добавление кадров
      addNextFrame();
    });
  },

  async addFrameToGIF(gif, imageData, width, height, delay) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);
        gif.addFrame(ctx, { copy: true, delay: delay });
        resolve();
      };
      img.src = imageData;
    });
  },

  downloadGIF(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Анимация_эпюры_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
