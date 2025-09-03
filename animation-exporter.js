const animationExporter = {
  fps: 10,
  width: 640,
  height: 480,

  async exportGIF() {
    if (animationPlayer.frames.length === 0) {
      alert("Нет кадров для экспорта");
      return;
    }

    alert("Начинаем создание GIF... Это может занять несколько секунд");

    try {
      const delay = Math.round(1000 / this.fps);

      // Создаем экземпляр GIF
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.width,
        height: this.height,
        workerScript: "gif.worker.js", // убедитесь, что файл в той же папке
      });

      // Создаем промисы для загрузки всех изображений
      const framePromises = animationPlayer.frames
        .filter((frame) => frame)
        .map((imageData, index) =>
          this.addFrameToGIF(gif, imageData, delay, index)
        );

      // Ждем загрузки всех кадров
      await Promise.all(framePromises);

      // Рендерим GIF
      gif.render();

      // Обрабатываем результат
      gif.on("finished", (blob) => {
        this.downloadGIF(blob);
        alert("GIF успешно создан и сохранен!");
      });

      gif.on("abort", () => {
        alert("Создание GIF прервано");
      });
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла: " + error.message);
    }
  },

  async addFrameToGIF(gif, imageData, delay, index) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = function () {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = animationExporter.width;
          canvas.height = animationExporter.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          // Очищаем canvas и рисуем изображение
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Добавляем кадр в GIF
          gif.addFrame(canvas, { delay: delay });
          console.log(`Добавлен кадр ${index + 1}`);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = function () {
        reject(
          new Error(`Не удалось загрузить изображение для кадра ${index + 1}`)
        );
      };

      img.src = imageData;
    });
  },

  downloadGIF(blob) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Динамика_эпюры_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.gif`;
      document.body.appendChild(a);
      a.click();

      // Небольшая задержка перед очисткой
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Ошибка при скачивании GIF:", error);
      alert("Ошибка при сохранении файла");
    }
  },
};
