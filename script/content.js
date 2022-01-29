const elements = document.querySelectorAll('input[type=text],input[type=search],input[type=tel],input[type=url],input[type=email],input[type=password],input[type=number],textarea');
let countDisplay;

elements.forEach((element) => {
  element.addEventListener('input', () => {
    const textLength = element.value.length;
    if (!countDisplay) {
      countDisplay = document.createElement('div');

      countDisplay.style.position = "absolute";
      countDisplay.style.top = 0;
      countDisplay.style.left = 0;
      countDisplay.style.backgroundColor = 'rgba(0,0,0,0.8)';
      countDisplay.style.padding = '7px 10px';
      countDisplay.style.borderRadius = '10px';
      countDisplay.style.fontSize = '18px';
      countDisplay.textContent = textLength;
      countDisplay.style.fontFamily = '"Helvetica Neue", "Segoe UI", Roboto'

      document.body.appendChild(countDisplay);
    } else {
      countDisplay.textContent = textLength
    }
  })
})