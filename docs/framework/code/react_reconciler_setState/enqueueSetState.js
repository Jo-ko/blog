const classComponentUpdater = {
    isMounted,
    enqueueSetState(inst, payload, callback) {
      const fiber = getInstance(inst);
      const currentTime = requestCurrentTime();
      const expirationTime = computeExpirationForFiber(currentTime, fiber);
  
      const update = createUpdate(expirationTime);
      update.payload = payload;
      if (callback !== undefined && callback !== null) {
        if (__DEV__) {
          warnOnInvalidCallback(callback, 'setState');
        }
        update.callback = callback;
      }
  
      flushPassiveEffects();
      enqueueUpdate(fiber, update);
      scheduleWork(fiber, expirationTime);
    },
  };