# waitDo
Timer to create sequences suitable for game development.

### A timer allows for interesting game events
Having a timer that is quick to use and configurable makes it more enjoyable to create interesting events. Over the years I have tweaked a timer and I found the latest revision of it to be simple, yet highly configurable and worth sharing to anyone interested. Following are some examples of how to use it.

#### The basic, three examples
```typescript
time.waitDo(1000, () => {
  console.log("Waited 1000 ms!");
});
```
```typescript
time.waitDo(1000, (props) => {
  console.log("Waited 1000 ms, then repeat until told otherwise.");
  
  props.repeat = true;
});
```
```typescript
time.waitDo(1000, (props) => {
  console.log("Waited 1000 ms, then repeat with 500 ms interval until told otherwise.");
  
  props.repeat = true;
  props.wait = 500;
});
```

#### The sequence, two examples
```typescript
time.waitDo(1000, 
  () => {
    console.log("Waited 1000 ms!");
  },
  () => {
    console.log("After 1000 ms I did something else.");
  },
  () => {
    console.log("After another 1000 ms I did the last thing.");
  }
);
```
```typescript
const timerID = time.waitDo(0, 
  (props, delta, ms) => {
    console.log("Started next frame and keeps repeating every frame until delay is 1000 ms.");
    
    if (props.delay == undefined) props.delay = 0;
    
    if ((props.delay += ms) < 1000) props.repeat = false;
    else props.repeat = true;
  },
  (props) => {
    console.log("Doing it, then setting a random wait time.");
    
    props.wait = Math.random() * 1000;
  },
  (props) => {
    console.log("After random time I'm doing something. Then I am waiting on something somewhere else in the code.");
    
    props.pause = true;
  },
  () => {
    console.log("And I am doing my last thing.");
  }
);

// Somewhere else in the code.
time.getWaitDo(timerID).props.pause = false;
```

#### The advanced, one example
```typescript
time.waitDo(0, 
  (props) => {
    console.log("Creating a new sprite, setting a count property to 0 and waiting 1000 ms.");
    
    props.sprite = new Sprite(...);
    props.sprite.visible = false;
    props.count = 0;
    
    props.wait = 1000;
  },
  (props, delta) => {
    console.log(`Set sprite visible, repeat every frame and move down 1 * delta until at 100.\n
    Then go to next callback, or if second pass, go to last callback.`);
      
    props.sprite.visible = true;
    props.sprite.y += 1 * delta;

    if (props.sprite.y < 100) props.repeate = true;
    else {
      props.repeate = false;
      props.count++;
      
      if (props.count > 1) props.cbIndex = 3; 
    }
    
    props.wait = 0;
  },
  (props, delta) => {
    console.log("Move sprite back up until reaching 0. Then go back to the previous callback.");
   
    props.sprite.y -= 1 * delta;
    
    if (props.sprite.y > 0) props.repeate = true;
    else props.cbIndex = 1; 
  },
  (props) =>{
   console.log("Hiding the sprite. When later using time.clean(), the sprite will be properly destroyed.");
   
    props.sprite.visible = false;
       
    props.destroyCb = (props) => {
      props.sprite.destroy();
    }
  }
);
```
