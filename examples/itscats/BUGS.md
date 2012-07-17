# Stuck Images

Sometimes images get 'stuck' and don't disappear when they're supposed to. It looks like they stick around forever, hiding beneath images that get loaded on top of them.

## Debugging

I knew that the resize handler had the possibility of interrupting an image's lifecycle mid-flight, so I reloaded the page and let it run without ever resizing it. The problem persisted. To be sure, I commented out the resize handler and there was still no change.

---

My theory is that one of the callbacks (probably an animation handler) is not being called (so breakpoints won't be much help). I could use console.log() to track the progress of each image, but there is a lot of activity on the page. I see two ways to address that:

1. Assign a unique identifier to each image by which I can group the corresponding log entries. There would be so much data that I would need to write some post-processing code to identify the missing callback.

2. Only load a single image at a time. I think it would take way too long to reproduce the bug this way. Also, the stuck images don't seem to prevent overall progress, so the log entries would continue and I may still need some kind of log post-processing unless I happen to be watching while the problem manifests.

I kept looking for other strategies.

---

Idea: set timeouts for every suspected callback. I created a function that wraps another function, throwing an exception if it's not called within the specified number of milliseconds:

    var expect = function(f, timeout) {
      var received = false;
      setTimeout(function () {
        if (!received) {
          throw new Error('never received call to ' + f);
        }
      }, timeout);
      return function () {
        received = true;
        f.apply(this, arguments);
      }
    };

I wrapped every callback with a reasonable timeout, but it never fired, even though I noticed some images get stuck. It did fire a few times for images whose load events didn't fire im time.

The only callback functions I didn't wrap were the ones passed to setTimeout and setInterval. I need a new theory!

---

New theory: .remove() doesn't work when the img tag is being animated. I tried calling .stop() before .remove(), but that didn't help. Then I tried replacing .fadeIn() and .fadeOut() with .show() and .hide(), but still no luck.

---

New theory: I'm removing references to the images from the grid without ever triggering the code to hide them. As a guess, I tweaked the code so that it always clears the entire grid instead of only clearing a portion of it. (It used to only clear the entire grid every 5 refreshes.) I watched the page for a while and the bug doesn't seem to occur any more. When I make it always refresh only part of the page, the bug still happens.

So this is likely a case of the model getting out of sync with the view (DOM).

I inspected the code but nothing stood out. I added a reference count to the img tags: every time I added a reference to the tag to the grid, I incremented the counter. I also added an assertion that a grid cell had nothing in it when it was assigned to. I caught something with that last assertion and that led me to the bug.

**Bug found:** when placing an image, I would determine the largest possible width and height by scanning rightward from the starting point, then downward from the starting point, then pick a random width and height within that range. That would sometimes generate a rectangle which overlapped with another rectangle, if that rectangle didn't exist on the same row or column as the starting point. I fixed the algorithm and the problem no longer seems to occur.


# Image 404s & Endless Spinner

When an image fails to load, the spinner never goes away. imagesLoading doesn't appear to decrement when those images fail to load, so I assume the load even isn't firing for them.
