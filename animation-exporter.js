const animationExporter = {
  fps: 10,
  width: 50,
  height: 50,

  async exportGIF() {
    if (animationPlayer.frames.length === 0) {
      alert("Нет кадров для экспорта");
      return;
    }

    try {
      const delay = 1 / this.fps; // секунды между кадрами

      const options = {
        images: animationPlayer.frames,
        gifWidth: this.width,
        gifHeight: this.height,
        interval: delay,
        numFrames: animationPlayer.frames.length,
        frameDuration: 1,
        fontWeight: "normal",
        fontSize: "16px",
        sampleInterval: 10,
        numWorkers: 2,
      };

      gifshot.createGIF(options, function (obj) {
        if (!obj.error) {
          const gifUrl = obj.image;
          //document.getElementById("result").src = gifUrl;
          // Скачивание
          const link = document.createElement("a");
          link.href = gifUrl;
          link.download = `animation.gif`;
          link.click();
        } else {
          console.error("Error:", obj.error);
        }
      });
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла");
    }
  },
};
