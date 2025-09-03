const GIF = require("./gif");

const animationExporter = {
  fps: 10,
  width: 640, // используйте реальные размеры
  height: 480,

  async exportGIF() {
    if (animationPlayer.frames.length === 0) {
      alert("Нет кадров для экспорта");
      return;
    }

    alert("Начинаем создание GIF... Это может занять несколько секунд");

    try {
      const delay = Math.round(1000 / this.fps);

      // Вариант 1: без воркеров (работает везде)
      const gif = new GIF({
        workers: 0,
        quality: 10,
        width: this.width,
        height: this.height,
      });

      // Вариант 2: с локальным воркером (нужен файл gif.worker.js)
      /*
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.width,
        height: this.height,
        workerScript: 'gif.worker.js'
      });
      */

      for (let i = 0; i < animationPlayer.frames.length; i++) {
        if (animationPlayer.frames[i]) {
          await this.addFrameToGIF(gif, animationPlayer.frames[i], delay);
        }
      }

      gif.on("finished", (blob) => {
        this.downloadGIF(blob);
        alert("GIF успешно создан и сохранен!");
      });

      gif.render();
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла");
    }
  },

  async addFrameToGIF(gif, imageData, delay) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = animationExporter.width;
        canvas.height = animationExporter.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
