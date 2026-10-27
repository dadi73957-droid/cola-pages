/* 站点埋点：页面浏览 / 卡片点击 / 搜索词 / 筛选点击。失败静默，绝不影响页面。 */
(function () {
  'use strict';
  var cfg = (typeof window.STATS_ENDPOINT === 'string') ? window.STATS_ENDPOINT.trim() : '';
  var ep = '';
  try {
    if (cfg) ep = cfg.replace(/\/+$/, '') + '/api/collect';
    else if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) ep = location.origin + '/api/collect';
  } catch (e) { }
  if (!ep) { window.ColaStat = { send: function () { }, on: false }; return; }

  var sid = '';
  try {
    sid = sessionStorage.getItem('cc_sid') || '';
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('cc_sid', sid);
    }
  } catch (e) { sid = 'anon'; }

  var refHost = '';
  try { refHost = document.referrer ? (new URL(document.referrer)).host : ''; } catch (e) { }

  function send(e, extra) {
    try {
      var body = { e: e, sid: sid, path: location.pathname + location.search, ref: refHost };
      if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
      var s = JSON.stringify(body);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ep, new Blob([s], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch(ep, { method: 'POST', body: s, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(function () { });
      }
    } catch (err) { }
  }

  window.ColaStat = { send: send, on: true, endpoint: ep };

  // 页面浏览
  send('view');
})();
