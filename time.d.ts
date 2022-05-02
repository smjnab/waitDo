type WaitDoProps = {
    [key: string]: any, // Add anything wanted to contain timer specific properties to the timer.
    id: number, cbIndex: number,  // ID of the timer, is the index of the array of timers.
    stop: boolean, pause: boolean,  // Stop will stop and free the timer, pause will pause but keep the timer.
    repeat: boolean, wait: number,  // Repeat will repeat the current callback, wait will be the time between repeats/next callback.
    accDelta: number, accMs: number,  // Accumulated frame delta and frame time since timer started, or since last callback. 
    destroyCb: (props: WaitDoProps) => void // Method called when using .clean(). Useful if creating props in a timer that needs cleaning.
}
type WaitDoCb = (props: WaitDoProps, delta: number, ms: number) => void; 
type WaitDoObject = { wait: number, totalTime: number, callbacks: WaitDoCb[], props: WaitDoProps }
type WaitDoCallbacks = WaitDoCb[];
