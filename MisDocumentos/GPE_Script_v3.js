<script type="text/javascript" charset="utf-8">
  (function (g, e, n, es, ys) {
    g['_genesysJs'] = e;
    g[e] = g[e] || function () {
      (g[e].q = g[e].q || []).push(arguments)
    };
    g[e].t = 1 * new Date();
    g[e].c = es;
    ys = document.createElement('script'); ys.async = 1; ys.src = n; ys.charset = 'utf-8'; document.head.appendChild(ys);
  })(window, 'Genesys', 'https://apps.euw2.pure.cloud/genesys-bootstrap/genesys.min.js', {
    environment: 'prod-euw2',
    deploymentId: '59b24b31-be21-4101-80e9-73929a1dac47'
  });
</script>
<script type="text/javascript" charset="utf-8">
  Genesys("subscribe", "Journey.ready", function() {
    Genesys("command", "Journey.pageview", {
      pageTitle: window.document.title
    });
    setTimeout(function () {
      Genesys("command", "Journey.record", {
        eventName: "Event_Time_on_page",
          customAttributes: {
            "Timer":"30s",
            "Event hostname": window.location.hostname
          }
         });
      }, 30000);
   });
</script>
