(() => {
  'use strict';
  const axis = document.body.dataset.axis;
  const target = axis === 'landscape' ? 'landscape-primary' : 'portrait-primary';
  const remoteUrl = 'https://remotedesktop.google.com/access';
  const install = document.getElementById('install');
  const message = document.getElementById('message');
  let promptEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  function report() {
    document.getElementById('mode').textContent = standalone() ? '설치된 앱으로 실행 중' : '브라우저에서 실행 중';
    document.getElementById('orientation').textContent = '현재 방향: ' + (innerWidth > innerHeight ? '가로' : '세로');
    install.hidden = standalone();
  }
  report();
  addEventListener('resize', report);
  addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); promptEvent = event; install.textContent = '이 방향으로 앱 설치'; });
  addEventListener('appinstalled', () => { promptEvent = null; install.hidden = true; message.textContent = '설치되었습니다. 홈 화면의 새 앱을 열어 주세요.'; });
  install.addEventListener('click', async () => {
    if (!promptEvent) { message.textContent = 'Chrome 오른쪽 위 ⋮ → 홈 화면에 추가 → 설치를 선택하세요. 설치 메뉴가 없으면 Chrome에서 이 페이지를 직접 열어 주세요.'; return; }
    try { await promptEvent.prompt(); await promptEvent.userChoice; promptEvent = null; }
    catch { message.textContent = '설치 창을 열지 못했습니다. Chrome 메뉴에서 설치해 주세요.'; }
  });
  document.getElementById('lock').addEventListener('click', async () => {
    try {
      if (!screen.orientation || typeof screen.orientation.lock !== 'function') throw new Error('unsupported');
      await screen.orientation.lock(target);
      message.textContent = '방향 고정을 요청했습니다. 아래 버튼으로 연결한 뒤에도 유지되는지 확인하세요.';
    } catch {
      message.textContent = '추가 고정 요청을 적용하지 못했습니다. 설치된 앱에서는 기본 방향 설정이 적용됩니다. 홈 화면의 앱으로 실행했는지 확인하세요.';
    }
    report();
  });
  document.getElementById('connect').addEventListener('click', () => { location.assign(remoteUrl); });
  document.getElementById('fullscreen').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (screen.orientation && typeof screen.orientation.lock === 'function') await screen.orientation.lock(target);
      message.textContent = '전체 화면에서 고정했습니다. 원격 데스크톱 연결을 눌러 테스트하세요.';
    } catch { message.textContent = '이 환경에서는 전체 화면 또는 방향 고정 요청을 적용하지 못했습니다. 기본 연결 버튼을 사용해 보세요.'; }
    report();
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {
      message.textContent = '설치 준비 파일을 불러오지 못했습니다. Chrome에서 페이지를 새로고침해 주세요.';
    });
  }
  // Keep the browser page available for installation. Only installed app launches
  // skip this page, preserving the orientation supplied by their own manifest.
  // setup=1 is a maintenance route; installed start URLs keep their existing IDs.
  if (standalone() && new URLSearchParams(location.search).get('setup') !== '1') {
    location.replace(remoteUrl);
  }
})();
