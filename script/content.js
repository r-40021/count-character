(() => {
  let elements = document.querySelectorAll('input:not([type]),input[type=text],input[type=search],input[type=tel],input[type=url],input[type=email],input[type=password],input[type=number],textarea');
  let countDisplay; // 文字数ディスプレイの要素
  let opacityTimeout, displayTimeout; // 5秒間操作がなかったら透明度を下げる timeout と、 10秒間操作がなかったら非表示にする timeout
  let isRunningAwayFromCursor = false; // カーソルを避けているかどうか

  addEvent(false, elements);

  const observeElem = document.body;
  const observeConfig = {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false,
  }

  /* 要素の変化を監視し、動的に生成された要素にもイベントを登録 */
  const mutationObserver = new MutationObserver(() => {
    mutationObserver.disconnect();
    const newElements = document.querySelectorAll('input:not([type]),input[type=text],input[type=search],input[type=tel],input[type=url],input[type=email],input[type=password],input[type=number],textarea');
    if (JSON.stringify(elements) !== JSON.stringify(newElements)) {
      addEvent(true, elements);
      addEvent(false, newElements);
      elements = newElements;
    }
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

      const throttleSetCoordDinateToCurrentElement = () => throttle(setCoordDinateToCurrentElement);

      const setCoordDinateToCurrentElement = () => setCoordinate(element);

      const handleTextInput = () => {
        createDisplayElement(element);
        countDisplay.textContent = element.value.length;
      };

      const handleFocus = () => {
        createDisplayElement(element);
        window.addEventListener('scroll', throttleSetCoordDinateToCurrentElement);
        window.addEventListener('resize', throttleSetCoordDinateToCurrentElement);
      };

      const handleBlur = () => {
        if (countDisplay) countDisplay.remove();
        countDisplay = null;
        window.removeEventListener('scroll', throttleSetCoordDinateToCurrentElement);
        window.removeEventListener('resize', throttleSetCoordDinateToCurrentElement);
      }

      if (isRemoved) {
        element.removeEventListener('input', handleTextInput);

        element.removeEventListener('focus', handleFocus);

        element.removeEventListener('blur', handleBlur);

      } else {
        element.addEventListener('input', handleTextInput);

        element.addEventListener('focus', handleFocus);

        element.addEventListener('blur', handleBlur);

        // autofocus 要素への対応
        if (document.activeElement === element) handleFocus();
      }
    })
  }


  /**
   * 文字数ディスプレイの生成
   * @param {Element} element 対象とするテキストボックスの要素 
   */
  function createDisplayElement(element) {
    setOpacityTimeout(); // 5秒間操作がなかったら透明度を下げる
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

      setCoordinate(element, true);

      document.body.appendChild(countDisplay);
    }
  }

  /**
   * 文字数ディスプレイの透明度を5秒後に下げる
   * @param {Boolean} [enableDisplay=true] 非表示のカウンターを再度表示するか否か
   */
  function setOpacityTimeout(enableDisplay = true) {
    clearTimeout(opacityTimeout);
    clearTimeout(displayTimeout);
    if (countDisplay) {
      countDisplay.style.opacity = 0.9
      if (enableDisplay) countDisplay.style.display = '';
    }
    opacityTimeout = setTimeout(() => {
      if (countDisplay) countDisplay.style.opacity = 0.2;
      displayTimeout = setTimeout(() => {
        if (countDisplay) countDisplay.style.display = 'none';
      }, 8000);
    }, 5000);
  }


  /**
   * 文字数ディスプレイの位置を調整
   * @param {Element} element 対象となるテキストボックスの要素
   * @param {Boolean} forced 強制的に戻すか否か
   */
  function setCoordinate(element, forced = false) {
    if (!forced && isRunningAwayFromCursor) return;
    const clientRect = element.getBoundingClientRect();
    if (clientRect.right + window.scrollX + 5 + 10 * element.value.length.toString().length + 10 * 2 <= window.scrollX + window.innerWidth - 10) {
      countDisplay.style.right = '';
      countDisplay.style.left = clientRect.right + window.scrollX + 5 + 'px';
    } else {
      countDisplay.style.left = '';
      countDisplay.style.right = document.body.clientWidth - (window.scrollX + window.innerWidth - 10) + 'px';
    }

    countDisplay.style.top = Math.min(clientRect.top + element.clientHeight + window.scrollY + 5, window.scrollY + window.innerHeight - 50) + 'px';

    isRunningAwayFromCursor = false;
  }

  /**
   * 重たいイベントを間引きする関数
   * @param {Function} callback 間引きしたい処理
   * @param {Number} interval 間引きする間隔(デフォルトでは1280ms)
   * @returns {Function} 
   */
  const throttle = (function (callback, interval = 256) {
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
