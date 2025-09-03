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
      const delay = Math.round(1000 / this.fps);

      // создать гиф здесь
      alert("Экспорт анимации пока не реализован");
    } catch (error) {
      console.error("Ошибка при создании GIF:", error);
      alert("Произошла ошибка при создании GIF файла");
    }
  },
};
