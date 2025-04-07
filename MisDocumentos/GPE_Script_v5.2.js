Genesys('subscribe', 'Journey.ready', function() {
  setTimeout (() => {
    let pathname = window.location.pathname;
    Genesys('command', 'Journey.pageview', {
        pageTitle: pathname
    });
  }, 5000);

  const delays = [5000, 30000, 60000, 120000, 180000, 10800000]; // Timeout options

  // Looping through 'delays' array and executing each setTimeout after it's specified delay
  delays.forEach((delay, index) => {
    const delayInSeconds = (delay / 1000) + 's';

    setTimeout (() => {
      Genesys('command', 'Journey.record', {
        eventName: 'Event_Time_on_page',
          customAttributes: {
            'Timer': delayInSeconds,
            'Event hostname': window.location.hostname
          }
      });
      console.log(`Timeout ${index + 1} executed after ${delayInSeconds}`);
    }, delay);
  });

});
