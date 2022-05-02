export class Time {
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TIME PROPERTIES
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private waitDos: WaitDoObject[];
    private freeWaitDoID: number;


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TIME METHODS
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor() {
        this.waitDos = [];
        // Note: this.freeWaitDoID is meant to be undefined.
    }

    // Note: Call update with your game loop, pixi ticker, reqAnimFrame or similar. Pass in frame time delta and frame time.
    update(delta: number, ms: number) {
        if (this.waitDos == undefined) return;

        this.waitDos.forEach(waitDo => {
            // Move all timers forward that are active and not paused.
            if (!waitDo.props.stop && !waitDo.props.pause) {

                // Accumulate to reflect delta and ms since last callback, or since creation of waitDo on first pass.
                waitDo.props.accDelta += delta;
                waitDo.props.accMs += ms;

                // Time is at or beyond the waiting time.
                if ((waitDo.totalTime += ms) >= waitDo.wait) {
                    // Trigger callback and include the props + this frame delta and frame ms.
                    waitDo.callbacks[waitDo.props.cbIndex++](waitDo.props, delta, ms);

                    // Reset to 0.
                    waitDo.props.accDelta = 0;
                    waitDo.props.accMs = 0;

                    // Check if this was the last callback.
                    waitDo.props.stop = waitDo.callbacks[waitDo.props.cbIndex] ? false : true;

                    // Last callback, but set to repeat, step back to repeat same callback next pass.
                    if (waitDo.props.stop && waitDo.props.repeat) {
                        waitDo.props.stop = false;
                        waitDo.props.cbIndex--;
                    }

                    // There are more callbacks, but set to repeat, step back to repeat same callback next pass.
                    else if (waitDo.props.cbIndex != 0 && waitDo.props.repeat) waitDo.props.cbIndex--;

                    // Set the next time to trigger a callback.
                    if (!waitDo.props.stop) waitDo.wait = waitDo.totalTime + waitDo.props.wait;

                    // WaitDo stopped, set the id (array element) free to use by a new WaitDo.
                    else this.freeWaitDoID = waitDo.props.id;
                }
            }
        });
    }

    /**
     * Run all waitDos destroy to clean up any advanced properties and clear the array of waitDos.
     */
    cleanUp() {
        this.waitDos.forEach(waitDo => waitDo.props.destroyCb(waitDo.props));

        this.waitDos = [];
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ADD WAITDO
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Add a new waitDo timer. A waitDo is highly configurable by using the props passed into all callbacks. Use the props to repeat, 
     * change wait time, repeat a callback, go to a specific callback or store any other property you like to use.
     * 
     * 
     * @param wait, the time to wait before triggering callback.
     * @param callbacks, a single callback or many to step through each callback, by default using the initial wait time between each.
     * @returns id of the waitDo.
     */
    waitDo(wait: number, ...callbacks: WaitDoCallbacks) {
        /**
         * Try getting the freeWaitDoID, if undefined, search the array for a free id.
         * If none found, a new id will be created later.
         * 
         * @returns 
         */
        const getID = () => {
            if (this.freeWaitDoID == undefined) this.freeWaitDoID = this.waitDos.findIndex(waitDo => waitDo.props.stop);

            return this.freeWaitDoID;
        }

        // Create the waitDo config object.
        const waitDoObject = {
            callbacks: callbacks,
            wait: wait,
            totalTime: 0,
            props: {
                id: getID(),
                pause: false,
                stop: false,
                repeat: false,
                wait: wait,
                cbIndex: 0,
                accDelta: 0,
                accMs: 0,
                destroyCb: () => { }
            } as WaitDoProps
        }

        // Clear the freeWaitDo. When a WaitDo is stopped this is set to limit how often to search the array for a free element.
        this.freeWaitDoID = undefined;

        // Re-use array element.
        if (waitDoObject.props.id != -1) this.waitDos[waitDoObject.props.id] = waitDoObject;

        // Add a new element.
        else waitDoObject.props.id = this.waitDos.push(waitDoObject) - 1;

        return waitDoObject.props.id;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // WAITDO HELPERS
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getWaitDo(id: number) {
        return this.waitDos.find(waitDo => waitDo.props.id === id);
    }

    stopWaitDo(id: number) {
        this.getWaitDo(id).props.stop = true;
        this.freeWaitDoID = id;
    }

    pauseWaitDo(id: number) {
        this.getWaitDo(id).props.pause = true;
    }

    resumeWaitDo(id: number) {
        this.getWaitDo(id).props.pause = false;
    }
}
