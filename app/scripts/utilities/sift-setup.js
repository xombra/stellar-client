var _user_id = '';
var _sift = _sift || [];

function loadSiftScript(userId) {
  _user_id = userId;

  _sift.push(['_setAccount', '5c25600a01']);
  _sift.push(['_setUserId', _user_id]);
  _sift.push(['_trackPageview']);

  var e = document.createElement('script');
  e.type = 'text/javascript';
  e.async = true;
  e.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.siftscience.com/s.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(e, s);
};
