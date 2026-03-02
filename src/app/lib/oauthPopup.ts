export function openCenteredPopup(url: string, title = 'LALA Kenya') {
  const w = 420;
  const h = 860;
  const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
  const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
  const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

  const left = Math.max(0, width / 2 - w / 2) + dualScreenLeft;
  const top = Math.max(0, height / 2 - h / 2) + dualScreenTop;

  const features = [
    `width=${w}`,
    `height=${h}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
    'resizable=yes',
    'scrollbars=yes',
    'toolbar=no',
    'location=no',
    'status=no',
    'menubar=no',
  ].join(',');

  const win = window.open(url, title, features);
  if (win) {
    win.focus();
  }
  return win;
}

