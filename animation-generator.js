const precision = 5;

const baseURL = "https://deciptikon.github.io/WaveJS/";

const defaultData = {
  Chi: "4",
  Psi: "0.128",
  Amplutuda: "0.95",
  S: "1",
  Width: "640",
  Height: "480",
  X0: "141",
  Y0: "56",
  Scale: "0.04",
  Alfa: "1.571",
  Betta: "0.524",
  Gamma: "0",
  Ro: "2",
};

const defaultOrder = [
  "Chi",
  "Psi",
  "Amplutuda",
  "S",
  "Width",
  "Height",
  "X0",
  "Y0",
  "Scale",
  "Alfa",
  "Betta",
  "Gamma",
  "Ro",
];

const animParamsOrder = {
  width: 0,
  height: 1,
  totalFrames: 2,
  fps: 3,
};

let calculationWindow = null;

const windowWidth = 1100;
const windowHeight = screen.height - 300;
const windowLeft = (screen.width - windowWidth) / 2;
const windowTop = 50;

const windowFeatures = [
  `width=${windowWidth}`,
  `height=${windowHeight}`,
  `left=${windowLeft}`,
  `top=${windowTop}`,
].join(",");

const animationGenerator = {
  frames: [],
  currentFrame: 0,
  totalFrames: 0,
  isGenerating: false,

  generateAnimation() {
    if (this.isGenerating) return;

    this.startParams = this.getParamsFromTable("start-params-table");
    this.endParams = this.getParamsFromTable("end-params-table");
    this.animParams = this.getParamsFromTable("animation-params-table");

    this.totalFrames =
      Number(this.animParams[animParamsOrder[`totalFrames`]]) - 1 || 30;
    this.frames = [];
    this.currentFrame = 0;
    this.isGenerating = true;

    this.showProgress();
    this.scrollToBottom();
    this.generateAnimationFrames();
  },

  getParamsFromTable(tableId) {
    const inputs = document.querySelectorAll(`#${tableId} input`);
    const params = Array.from(inputs).map((input) => input.value);
    console.log(params);

    return params;
  },

  generateAnimationFrames() {
    console.log("generateAnimationFrames __________________________");
    console.log(`startParams = ${this.startParams}`);
    console.log(`endParams = ${this.endParams}`);
    console.log(`animParams = ${this.animParams}`);

    console.log(`this.currentFrame = ${this.currentFrame}`);

    const progress = this.currentFrame / (this.totalFrames + 1);
    let frameParams = [];

    for (let j = 0; j < this.startParams.length; j++) {
      const valS = Number(this.startParams[j].replaceAll(",", "."));
      const valE = Number(this.endParams[j].replaceAll(",", "."));

      const val = valS + (valE - valS) * progress;

      frameParams.push(this.num(val));
    }

    console.log(`frameParams = ${frameParams}`);

    this.generateFrame(
      frameParams,
      this.animParams[animParamsOrder.width],
      this.animParams[animParamsOrder.height]
    );
  },

  generateFrame(params, width, height) {
    const data = this.paramsToData(params, width, height);
    const url = this.urlFromData(baseURL, data);

    this.openCalculationWindow(url);
  },

  openCalculationWindow(url) {
    if (calculationWindow) {
      //меняем адресс окна
      try {
        calculationWindow.location.href = url;
      } catch (error) {
        alert("Ошибка, окно не существует или было закрыто!");
      }
    } else {
      calculationWindow = window.open(url, `calculationWindow`, windowFeatures);
    }

    setTimeout(() => {
      if (calculationWindow && !calculationWindow.closed) {
        this.checkCalculationComplete();
      } else {
        alert("Ошибка! Окно не существует или было закрыто.");
      }
    }, 200);
  },

  checkCalculationComplete() {
    const checkInterval = setInterval(() => {
      try {
        if (!calculationWindow || calculationWindow.closed) {
          clearInterval(checkInterval);
          alert("Ошибка! Окно не существует или было закрыто.");
        }

        const calculationComplete = localStorage.getItem(
          "flag_saved_epure_wavejs"
        );
        console.log(`calculationComplete = ${calculationComplete}`);

        if (calculationComplete === "true") {
          clearInterval(checkInterval);
          localStorage.removeItem("flag_saved_epure_wavejs");

          this.frameComplete();
        }
      } catch (error) {
        console.log("Ожидание завершения расчета...", error);
      }
    }, 1000);
  },

  frameComplete() {
    const imageData = localStorage.getItem("saved_epure_wavejs");
    if (imageData) {
      this.frames[this.currentFrame] = imageData;
      this.updateProgress();
      this.currentFrame++;

      if (this.currentFrame > this.totalFrames) {
        this.generationComplete();
      } else {
        this.generateAnimationFrames();
      }
    } else {
      console.log("Эпюра отсутствует");
    }
  },

  showProgress() {
    const container = document.getElementById("progress-container");
    container.style.display = "block";
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    progressFill.style.width = `${0}%`;
    progressText.textContent = `${0}% (${0}/${this.totalFrames + 1})`;
  },

  updateProgress() {
    const f = this.currentFrame + 1;
    const t = this.totalFrames + 1;
    console.log(`currentFrame=${f}  |  totalFrames=${t}`);
    const p = (f / t) * 100;
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    progressFill.style.width = `${p}%`;
    progressText.textContent = `${Math.round(p)}% (${f}/${t})`;
    this.scrollToBottom();
  },

  generationComplete() {
    this.isGenerating = false;
    calculationWindow.close();
    //console.log("Генерация завершена!", this.frames);
    //alert("Генерация завершена");

    // Показываем контейнер с анимацией
    document.getElementById("animation-container").style.display = "block";

    // Инициализируем плеер с готовыми кадрами
    animationPlayer.init(this.frames);
    animationPlayer.fps = Number(this.animParams[animParamsOrder.fps]) || 10;
    animationPlayer.width = Number(this.animParams[animParamsOrder.width]);
    animationPlayer.height = Number(this.animParams[animParamsOrder.height]);

    // Передаём данные для генерации анимации
    animationExporter.fps = animationPlayer.fps;
    animationExporter.width = animationPlayer.width;
    animationExporter.height = animationPlayer.height;

    setTimeout(() => {
      this.scrollToBottom();
    }, 200);
  },

  urlFromData(baseURL, data) {
    let url = `${baseURL}?`;
    defaultOrder.forEach((key) => {
      url += `${key}=${data[key]}&`;
    });
    return url.slice(0, -1);
  },

  toRadians(gradus) {
    return (Math.PI * gradus) / 180;
  },

  num(n, precision = 5) {
    return Number.parseFloat(Number(n).toFixed(precision)).toString();
  },

  isValid(str, options = {}) {
    if (!str || typeof str !== "string" || str.trim() === "") {
      console.log(`--- не строка: ${typeof str}`);

      return false;
    }

    const trimmedStr = str.trim().replaceAll(",", ".");

    if (isNaN(trimmedStr) || trimmedStr === "" || isNaN(Number(trimmedStr))) {
      console.log(`--- не корректное число`);
      return false;
    }

    const num = Number(trimmedStr);

    if (options.integer && !Number.isInteger(num)) {
      console.log(`--- не целое`);
      return false;
    }

    if (options.min !== undefined && num < options.min) {
      console.log(`--- мелкое`);
      return false;
    }

    if (options.max !== undefined && num > options.max) {
      console.log(`--- крупное`);
      return false;
    }

    return true;
  },

  paramsToData(params, width, height) {
    const [s, A, F, n, x0, y0, scale, alfa, betta, gamma, ro] = params;
    const data = defaultData;

    if (!this.isValid(width, { integer: true, min: 100, max: 1080 })) {
      alert("Ширина холста должна быть корректной!" + ` ${width}`);
      return;
    }
    data.Width = width.replaceAll(",", ".");

    if (!this.isValid(height, { integer: true, min: 100, max: 1080 })) {
      alert("Высота холста должна быть корректной!" + ` ${height}`);
      return;
    }
    data.Height = height.replaceAll(",", ".");

    if (!this.isValid(x0)) {
      alert("Смещение по горизонтали должно быть корректным!" + ` ${x0}`);
      return;
    }
    data.X0 = x0.replaceAll(",", ".");

    if (!this.isValid(y0)) {
      alert("Смещение по вертикали должно быть корректным!" + ` ${y0}`);
      return;
    }
    data.Y0 = y0.replaceAll(",", ".");

    if (!this.isValid(scale, { min: 0, max: 5 })) {
      alert("Масштаб должен быть корректным!" + ` ${scale}`);
      return;
    }
    data.Scale = scale.replaceAll(",", ".");

    if (!this.isValid(alfa, { min: 0, max: 90 })) {
      alert(
        "Угол наклона главной режущей кромки (Alfa) должен быть корректным!" +
          ` ${alfa}`
      );
      return;
    }
    let al = Number(alfa.replaceAll(",", "."));
    if (90 - al < 0.01) al = 90 - 0.01;
    data.Alfa = this.num(this.toRadians(al));

    if (!this.isValid(betta, { min: 0, max: 90 })) {
      alert(
        "Угол наклона вспомогательной режущей кромки (Betta) должен быть корректным!" +
          ` ${betta}`
      );
      return;
    }
    let be = Number(betta.replaceAll(",", "."));
    if (90 - be < 0.01) be = 90 - 0.01;
    data.Betta = this.num(this.toRadians(be));

    if (!this.isValid(gamma, { min: -90, max: 90 })) {
      alert(
        "Угол наклона резца относительно поверхности обработки (Gamma) должен быть корректным!" +
          ` ${gamma}`
      );
      return;
    }
    data.Gamma = this.num(this.toRadians(Number(gamma.replaceAll(",", "."))));

    if (!this.isValid(ro, { min: 0, max: 10 })) {
      alert("Радиус скругления вершины резца (Ro) должен быть корректным!");
      return;
    }
    data.Ro = ro.replaceAll(",", ".");

    if (!this.isValid(s, { min: 0, max: 10 })) {
      alert("Подача должна быть корректной!" + ` ${s}`);
      return;
    }
    data.S = s.replaceAll(",", ".");

    if (!this.isValid(A, { min: 0, max: 100000 })) {
      alert("Амплитуда колебаний должна быть корректной!" + ` ${A}`);
      return;
    }
    data.Amplutuda = this.num(Number(A.replaceAll(",", ".")) / 100);

    if (!this.isValid(F, { min: 0, max: 100000 })) {
      alert("Частота колебаний должна быть корректной!" + ` ${F}`);
      return;
    }
    if (!this.isValid(n, { min: 0, max: 100000 })) {
      alert("Частота вращения должна быть корректной!" + ` ${n}`);
      return;
    }

    // частота относительных колебаний
    const f = Number(F.replaceAll(",", ".")) / Number(n.replaceAll(",", "."));

    if (!isFinite(f)) {
      alert("Относительная частота бесконечна!");
      return;
    }

    // разделяем на целую (chi) и дробную (psi) части
    const chi = Math.floor(f);
    const psi = f - chi;

    data.Chi = this.num(chi);
    data.Psi = this.num(Math.max(psi, 0.00001));

    return data;
  },

  scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  },
};
