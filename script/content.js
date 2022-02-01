(() => {
  let elements = document.querySelectorAll('input:not([type]),input[type=text],input[type=search],input[type=tel],input[type=url],input[type=email],input[type=password],input[type=number],textarea');
  let countDisplay; // 文字数ディスプレイの要素
  let opacityTimeout, displayTimeout; // 2秒間操作がなかったら透明度を下げる timeout と、 10秒間操作がなかったら非表示にする timeout

  addEvent(false, elements);

  const observeElem = document.body;
  const observeConfig = {
    childList: true,
    subtree: true
  }

  /* 要素の変化を監視し、動的に生成された要素にもイベントを登録 */
  const mutationObserver = new MutationObserver(() => {
    mutationObserver.disconnect();
    addEvent(true, elements);
    const newElements = document.querySelectorAll('input:not([type]),input[type=text],input[type=search],input[type=tel],input[type=url],input[type=email],input[type=password],input[type=number],textarea');
    addEvent(false, newElements);
    elements = newElements;
    mutationObserver.observe(observeElem, observeConfig);
  });

  mutationObserver.observe(observeElem, observeConfig);

  /**
   * テキストボックスにイベントを登録or解除する
   * @param {Boolean} isRemoved イベントリスナーを解除するか否か
   * @param {NodeList} elements テキストボックスの要素の NodeList
   */
  function addEvent(isRemoved, elements) {
    elements.forEach((element) => {
      const handleTextInput = () => {
        const textLength = element.value.length;
        createDisplayElement(element);
        countDisplay.textContent = textLength;
        throttle(setCoordDinateToCurrentElement);
      };

      const handleFocus = () => {
        createDisplayElement(element);
        window.addEventListener('scroll', () => throttle(setCoordDinateToCurrentElement));
        window.addEventListener('resize', () => throttle(setCoordDinateToCurrentElement));
      };

      const handleBlur = () => {
        if (countDisplay) countDisplay.remove();
        countDisplay = null;
        window.removeEventListener('scroll', () => throttle(setCoordDinateToCurrentElement));
        window.removeEventListener('resize', () => throttle(setCoordDinateToCurrentElement));
      }

      if (isRemoved) {
        element.removeEventListener('input', handleTextInput);

        element.removeEventListener('focus', handleFocus);

        element.removeEventListener('blur', handleBlur);
      } else {
        element.addEventListener('input', handleTextInput);

        element.addEventListener('focus', handleFocus);

        element.addEventListener('blur', handleBlur);
      }

      const setCoordDinateToCurrentElement = () => setCoordinate(element);
    })
  }


  /**
   * 文字数ディスプレイの生成
   * @param {Element} element 対象とするテキストボックスの要素 
   */
  function createDisplayElement(element) {
    setOpacityTimeout(); // 2秒間操作がなかったら透明度を下げる
    if (!countDisplay) {
      // 文字数を表示する要素を生成
      countDisplay = document.createElement('div');

      countDisplay.style.position = "absolute";
      countDisplay.style.backgroundColor = '#000';
      countDisplay.style.opacity = 0.9;
      countDisplay.style.color = '#fff';
      countDisplay.style.padding = '7px 10px';
      countDisplay.style.borderRadius = '10px';
      countDisplay.style.fontSize = '18px';
      countDisplay.style.zIndex = 999999999999999999;
      countDisplay.style.fontFamily = '"Helvetica Neue", "Segoe UI", Roboto';
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) countDisplay.style.transition = 'opacity .2s, top .2s ease-out, left .2s ease-out, right .2s ease-out'

      countDisplay.textContent = element.value.length;

      setCoordinate(element);

      document.body.appendChild(countDisplay);
    }
  }

  /**
   * 文字数ディスプレイの透明度を2秒後に下げる
   */
  function setOpacityTimeout() {
    clearTimeout(opacityTimeout);
    clearTimeout(displayTimeout);
    if (countDisplay) {
      countDisplay.style.opacity = 0.9
      countDisplay.style.display = '';
    }
    opacityTimeout = setTimeout(() => {
      if (countDisplay) countDisplay.style.opacity = 0.2;
      displayTimeout = setTimeout(() => {
        if (countDisplay) countDisplay.style.display = 'none';
      }, 8000);
    }, 2000);
  }


  /**
   * 文字数ディスプレイの位置を調整
   * @param {Element} element 対象となるテキストボックスの要素
   */
  function setCoordinate(element) {
    const clientRect = element.getBoundingClientRect();
    let x;
    if (clientRect.right + window.scrollX + 5 + 10 * element.value.length.toString().length + 10 * 2 <= window.scrollX + window.innerWidth - 10) {
      x = clientRect.right + window.scrollX + 5 + 'px';
      countDisplay.style.right = '';
      countDisplay.style.left = x;
    } else {
      x = window.innerWidth - (window.scrollX + window.innerWidth - 10) + 'px';
      countDisplay.style.left = '';
      countDisplay.style.right = x;
    }
    const y = Math.min(clientRect.top + element.clientHeight + window.scrollY + 5, window.scrollY + window.innerHeight - 40) + 'px';
    countDisplay.style.top = y;
  }

  /**
   * 重たいイベントを間引きする関数
   * @param {Function} callback 間引きしたい処理
   * @param {Number} interval 間引きする間隔(デフォルトでは1280ms)
   * @returns {Function} 
   */
  var throttle = (function (callback, interval = 256) {
    var time = Date.now(),
      lag,
      debounceTimer,
      debounceDelay = 16;

    return function (callback) {
      lag = time + interval - Date.now();
      if (lag < 0) {
        callback();
        time = Date.now();
      } else {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          callback();
        }, (interval - lag + debounceDelay));
      }
    }
  })();
})();
