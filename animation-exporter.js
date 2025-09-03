const animationExporter = {
  fps: 10,
  width: 50,
  height: 50,

  async exportGIF() {
    if (animationPlayer.frames.length === 0) {
      alert("Нет кадров для экспорта");
      return;
    }

    // Показываем alert о начале процесса
    alert("Начинаем создание GIF... Это может занять несколько секунд");

    const delay = Math.round(1000 / fps);

    try {
      // Создаем GIF
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.width,
        height: this.height,
        workerScript:
          "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
      });

      // Добавляем кадры в GIF
      for (let i = 0; i < animationPlayer.frames.length; i++) {
        if (animationPlayer.frames[i]) {
          await this.addFrameToGIF(
            gif,
            animationPlayer.frames[i],
            this.width,
            this.height,
            delay
          );
        }
      }

      // Генерируем и скачиваем GIF
      gif.on("finished", function (blob) {
        animationExporter.downloadGIF(blob);
        alert("GIF успешно создан и сохранен!");
      });

      gif.render();
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла");
    }
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
